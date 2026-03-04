// src/hooks/useLibrary.js
// Hook global de estado da biblioteca.
// Persiste tudo no AsyncStorage.
// Exporta funções para adicionar/remover pastas, atualizar progresso,
// definir capa customizada, marcar como lido/não lido.

import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform }  from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { scanRootFolder }  from '../utils/fileScanner';
import { extractCover, extractCoversForFiles } from '../utils/coverExtractor';

const SAF        = FileSystem.StorageAccessFramework;
const STORAGE_KEY = '@comicshelf_library_v2';

// ── Estado inicial ────────────────────────────────────────────────
const initialState = {
  rootFolders: [],   // pastas adicionadas pelo usuário
  progress:    {},   // { [fileId]: { currentPage, totalPages, status } }
  covers:      {},   // { [fileId]: coverUri }
  customCovers:{},   // { [folderId]: coverUri } — capa escolhida pelo usuário
};

// ── Singleton para evitar múltiplas instâncias desincronizadas ────
let _state     = initialState;
let _listeners = [];

function notify() {
  _listeners.forEach((fn) => fn({ ..._state }));
}

async function persist() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
  } catch (e) {
    console.warn('[Library] Erro ao persistir:', e);
  }
}

async function load() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      _state = { ...initialState, ...parsed };
    }
  } catch (e) {
    console.warn('[Library] Erro ao carregar:', e);
  }
}

// ── Hook ──────────────────────────────────────────────────────────
export function useLibrary() {
  const [state, setState] = useState(_state);
  const [loading, setLoading]   = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Registra listener
  useEffect(() => {
    const listener = (newState) => {
      if (mountedRef.current) setState(newState);
    };
    _listeners.push(listener);

    // Carrega estado inicial
    (async () => {
      setLoading(true);
      await load();
      if (mountedRef.current) {
        setState({ ..._state });
        setLoading(false);
      }
    })();

    return () => {
      _listeners = _listeners.filter((l) => l !== listener);
    };
  }, []);

  // ── Adicionar pasta ─────────────────────────────────────────────
  const addFolder = useCallback(async () => {
    try {
      let rootUri  = null;
      let rootName = null;

      if (Platform.OS === 'android') {
        // Android: StorageAccessFramework — escolhe diretório
        const perm = await SAF.requestDirectoryPermissionsAsync();
        if (!perm.granted) return { success: false, error: 'Permissão negada' };
        rootUri  = perm.directoryUri;
        // Extrai nome legível da URI
        rootName = decodeURIComponent(rootUri)
          .split(':').pop()
          .split('/').pop() || 'Pasta';
      } else {
        // iOS: DocumentPicker — escolhe pasta
        const result = await DocumentPicker.getDocumentAsync({
          type: ['public.folder'],
          copyToCacheDirectory: false,
        });
        if (result.canceled || !result.assets?.[0]) return { success: false, error: 'Cancelado' };
        rootUri  = result.assets[0].uri;
        rootName = result.assets[0].name || 'Pasta';
      }

      // Verifica se já foi adicionada
      const alreadyAdded = _state.rootFolders.some((f) => f.uri === rootUri);
      if (alreadyAdded) return { success: false, error: 'Pasta já adicionada' };

      setScanning(true);
      setScanProgress({ current: 0, total: 0 });

      // Escaneia recursivamente
      const scanned = await scanRootFolder(rootUri, rootName);

      // Extrai capas em background (arquivos da raiz + todos aninhados)
      const allFiles = collectAllFiles(scanned);
      setScanProgress({ current: 0, total: allFiles.length });

      const newCovers = await extractCoversForFiles(allFiles, (cur, tot) => {
        if (mountedRef.current) setScanProgress({ current: cur, total: tot });
      });

      // Atualiza estado global
      _state = {
        ..._state,
        rootFolders: [..._state.rootFolders, scanned],
        covers:      { ..._state.covers, ...newCovers },
      };

      await persist();
      notify();
      setScanning(false);
      return { success: true };

    } catch (e) {
      console.error('[Library] addFolder error:', e);
      setScanning(false);
      return { success: false, error: e.message };
    }
  }, []);

  // ── Remover pasta ───────────────────────────────────────────────
  const removeFolder = useCallback(async (folderId) => {
    _state = {
      ..._state,
      rootFolders: _state.rootFolders.filter((f) => f.id !== folderId),
    };
    await persist();
    notify();
  }, []);

  // ── Reescanear pasta ────────────────────────────────────────────
  const rescanFolder = useCallback(async (folderId) => {
    const folder = _state.rootFolders.find((f) => f.id === folderId);
    if (!folder) return;

    setScanning(true);
    try {
      const scanned  = await scanRootFolder(folder.uri, folder.name);
      const allFiles = collectAllFiles(scanned);
      setScanProgress({ current: 0, total: allFiles.length });

      const newCovers = await extractCoversForFiles(allFiles, (cur, tot) => {
        if (mountedRef.current) setScanProgress({ current: cur, total: tot });
      });

      _state = {
        ..._state,
        rootFolders: _state.rootFolders.map((f) =>
          f.id === folderId ? { ...scanned, id: folderId } : f,
        ),
        covers: { ..._state.covers, ...newCovers },
      };

      await persist();
      notify();
    } catch (e) {
      console.error('[Library] rescanFolder error:', e);
    }
    setScanning(false);
  }, []);

  // ── Atualizar progresso de leitura ──────────────────────────────
  const updateProgress = useCallback(async (fileId, currentPage, totalPages) => {
    const status =
      currentPage >= totalPages && totalPages > 0 ? 'completed'
      : currentPage > 0                           ? 'in_progress'
      : 'unread';

    _state = {
      ..._state,
      progress: {
        ..._state.progress,
        [fileId]: { currentPage, totalPages, status },
      },
    };
    await persist();
    notify();
  }, []);

  // ── Marcar como lido / não lido ─────────────────────────────────
  const markAsRead = useCallback(async (fileId, totalPages = 1) => {
    _state = {
      ..._state,
      progress: {
        ..._state.progress,
        [fileId]: { currentPage: totalPages, totalPages, status: 'completed' },
      },
    };
    await persist();
    notify();
  }, []);

  const markAsUnread = useCallback(async (fileId) => {
    _state = {
      ..._state,
      progress: {
        ..._state.progress,
        [fileId]: { currentPage: 0, totalPages: _state.progress[fileId]?.totalPages ?? 0, status: 'unread' },
      },
    };
    await persist();
    notify();
  }, []);

  // ── Definir capa customizada de pasta ───────────────────────────
  // coverFileId = id do arquivo CBZ/CBR/PDF a usar como capa
  const setFolderCover = useCallback(async (folderId, coverFileId) => {
    const coverUri = _state.covers[coverFileId] ?? null;
    _state = {
      ..._state,
      customCovers: { ..._state.customCovers, [folderId]: { fileId: coverFileId, uri: coverUri } },
    };
    await persist();
    notify();
  }, []);

  // ── Helpers para consultar estado ───────────────────────────────
  const getProgress = useCallback((fileId) => {
    return _state.progress[fileId] ?? { currentPage: 0, totalPages: 0, status: 'unread' };
  }, [state]);

  const getCover = useCallback((fileId) => {
    return _state.covers[fileId] ?? null;
  }, [state]);

  const getFolderCover = useCallback((folderId) => {
    return _state.customCovers[folderId]?.uri ?? null;
  }, [state]);

  const hasAnyFolder = state.rootFolders.length > 0;

  return {
    // Estado
    rootFolders: state.rootFolders,
    loading,
    scanning,
    scanProgress,
    hasAnyFolder,
    // Ações
    addFolder,
    removeFolder,
    rescanFolder,
    updateProgress,
    markAsRead,
    markAsUnread,
    setFolderCover,
    // Consultas
    getProgress,
    getCover,
    getFolderCover,
  };
}

// ── Coleta todos os arquivos de uma árvore ────────────────────────
function collectAllFiles(node) {
  const files = [...(node.files ?? [])];
  for (const sub of (node.folders ?? [])) {
    files.push(...collectAllFiles(sub));
  }
  return files;
}