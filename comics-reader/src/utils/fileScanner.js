// src/utils/fileScanner.js
// Scanner recursivo de pastas usando StorageAccessFramework (Android) e
// expo-file-system (iOS). Retorna estrutura de árvore com pastas e arquivos.

import * as FileSystem from 'expo-file-system';
import { Platform }   from 'react-native';

const SAF = FileSystem.StorageAccessFramework;

// Extensões suportadas
const SUPPORTED_EXTS = ['cbz', 'cbr', 'pdf'];

// ── Extrai nome legível de uma SAF URI ────────────────────────────
export function getNameFromUri(uri) {
  try {
    const decoded = decodeURIComponent(uri);
    // SAF: ".../document/primary:Comics%2FMarvel%2Ffile.cbz"
    // Depois de decode: ".../document/primary:Comics/Marvel/file.cbz"
    const afterColon = decoded.includes(':') ? decoded.split(':').pop() : decoded;
    const parts = afterColon.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1] || 'Desconhecido';
  } catch {
    return uri.split('/').pop() || 'Desconhecido';
  }
}

// ── Verifica se URI é de arquivo suportado ────────────────────────
function getSupportedExt(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  return SUPPORTED_EXTS.includes(ext) ? ext.toUpperCase() : null;
}

// ── Scanner recursivo via SAF (Android) ──────────────────────────
async function scanSAFDirectory(dirUri, depth = 0) {
  if (depth > 10) return { folders: [], files: [] };

  let entries = [];
  try {
    entries = await SAF.readDirectoryAsync(dirUri);
  } catch (e) {
    console.warn('[Scanner] Erro ao ler diretório:', dirUri, e.message);
    return { folders: [], files: [] };
  }

  const folders = [];
  const files   = [];

  for (const entryUri of entries) {
    const name = getNameFromUri(entryUri);

    // Tenta determinar se é diretório via getInfoAsync
    let isDir = false;
    try {
      const info = await FileSystem.getInfoAsync(entryUri);
      isDir = info.isDirectory ?? false;
    } catch {
      // Se falhar, usa heurística: sem extensão → diretório
      isDir = !name.includes('.');
    }

    if (isDir) {
      const children = await scanSAFDirectory(entryUri, depth + 1);
      const totalFiles = countFiles(children);
      if (totalFiles > 0 || children.folders.length > 0) {
        folders.push({
          id:         entryUri,
          uri:        entryUri,
          name,
          comicCount: totalFiles,
          folderCount: children.folders.length,
          coverUri:   null,      // definida depois pela extração
          customCoverUri: null,  // definida pelo usuário
          coverImages: [],       // para o FolderCard (3 camadas)
          folders:    children.folders,
          files:      children.files,
        });
      }
    } else {
      const fmt = getSupportedExt(name);
      if (fmt) {
        files.push({
          id:          entryUri,
          uri:         entryUri,
          name,
          title:       name.replace(/\.[^.]+$/, ''), // sem extensão
          format:      fmt,
          totalPages:  0,
          currentPage: 0,
          status:      'unread',
          coverUri:    null,
          coverBg:     randomDarkColor(),
          coverAccent: randomDarkColor(),
          letter:      name[0]?.toUpperCase() ?? '?',
        });
      }
    }
  }

  // Ordena alfabeticamente
  folders.sort((a, b) => a.name.localeCompare(b.name));
  files.sort((a, b)   => a.name.localeCompare(b.name));

  return { folders, files };
}

// ── Scanner para iOS (via expo-file-system path normal) ──────────
async function scanNormalDirectory(dirPath, depth = 0) {
  if (depth > 10) return { folders: [], files: [] };

  let entries = [];
  try {
    entries = await FileSystem.readDirectoryAsync(dirPath);
  } catch (e) {
    console.warn('[Scanner] Erro ao ler diretório:', dirPath, e.message);
    return { folders: [], files: [] };
  }

  const folders = [];
  const files   = [];

  for (const entry of entries) {
    const fullPath = `${dirPath}/${entry}`;
    let info;
    try {
      info = await FileSystem.getInfoAsync(fullPath);
    } catch {
      continue;
    }

    if (info.isDirectory) {
      const children = await scanNormalDirectory(fullPath, depth + 1);
      const totalFiles = countFiles(children);
      if (totalFiles > 0 || children.folders.length > 0) {
        folders.push({
          id:          fullPath,
          uri:         fullPath,
          name:        entry,
          comicCount:  totalFiles,
          folderCount: children.folders.length,
          coverUri:    null,
          customCoverUri: null,
          coverImages: [],
          folders:     children.folders,
          files:       children.files,
        });
      }
    } else {
      const fmt = getSupportedExt(entry);
      if (fmt) {
        files.push({
          id:          fullPath,
          uri:         fullPath,
          name:        entry,
          title:       entry.replace(/\.[^.]+$/, ''),
          format:      fmt,
          totalPages:  0,
          currentPage: 0,
          status:      'unread',
          coverUri:    null,
          coverBg:     randomDarkColor(),
          coverAccent: randomDarkColor(),
          letter:      entry[0]?.toUpperCase() ?? '?',
        });
      }
    }
  }

  folders.sort((a, b) => a.name.localeCompare(b.name));
  files.sort((a, b)   => a.name.localeCompare(b.name));

  return { folders, files };
}

// ── Entry point principal ─────────────────────────────────────────
export async function scanRootFolder(rootUri, rootName) {
  const isAndroid = Platform.OS === 'android';
  const result = isAndroid
    ? await scanSAFDirectory(rootUri)
    : await scanNormalDirectory(rootUri);

  return {
    id:          rootUri,
    uri:         rootUri,
    name:        rootName,
    comicCount:  countFiles(result),
    folderCount: result.folders.length,
    coverUri:    null,
    customCoverUri: null,
    coverImages: [],
    folders:     result.folders,
    files:       result.files,
    scannedAt:   Date.now(),
  };
}

// ── Helpers ───────────────────────────────────────────────────────
function countFiles(node) {
  let count = node.files?.length ?? 0;
  for (const sub of (node.folders ?? [])) {
    count += countFiles(sub);
  }
  return count;
}

const DARK_PALETTES = [
  ['#0D1B4B', '#1A2E7A'], ['#2A0000', '#500000'], ['#0A1A0A', '#102A10'],
  ['#1A0A1A', '#2A102A'], ['#0D0D1A', '#1A1A33'], ['#1A0800', '#3D1200'],
  ['#0D1117', '#1A2233'], ['#1F0D33', '#2E1547'], ['#0A0F2A', '#101840'],
  ['#2B0D0D', '#3D1515'], ['#151530', '#22223D'], ['#003020', '#004530'],
];

function randomDarkColor() {
  const pair = DARK_PALETTES[Math.floor(Math.random() * DARK_PALETTES.length)];
  return pair[Math.floor(Math.random() * 2)];
}