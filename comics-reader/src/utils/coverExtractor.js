// src/utils/coverExtractor.js
// Extração da primeira imagem de arquivos CBZ, CBR e PDF para usar como capa.
//
// CBZ  → ZIP → extrai primeira imagem com JSZip → salva em cache
// CBR  → RAR → sem suporte nativo; retorna null (placeholder colorido)
// PDF  → usa expo-print ou placeholder; integração completa via plugin nativo

import * as FileSystem from 'expo-file-system';
import JSZip           from 'jszip';

const COVER_CACHE_DIR = `${FileSystem.cacheDirectory}covers/`;
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'];

// ── Garante que o diretório de cache existe ───────────────────────
async function ensureCacheDir() {
  const info = await FileSystem.getInfoAsync(COVER_CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(COVER_CACHE_DIR, { intermediates: true });
  }
}

// ── Gera nome único para o arquivo de cache ───────────────────────
function cacheName(uri) {
  // Hash simples baseado na URI
  let hash = 0;
  for (let i = 0; i < uri.length; i++) {
    hash = ((hash << 5) - hash) + uri.charCodeAt(i);
    hash |= 0;
  }
  return `cover_${Math.abs(hash)}.jpg`;
}

// ── Verifica se a capa já está em cache ───────────────────────────
async function getCached(uri) {
  await ensureCacheDir();
  const path = COVER_CACHE_DIR + cacheName(uri);
  const info = await FileSystem.getInfoAsync(path);
  return info.exists ? path : null;
}

// ── Extrai capa de CBZ (ZIP) ──────────────────────────────────────
async function extractCBZCover(uri) {
  try {
    // Verifica cache
    const cached = await getCached(uri);
    if (cached) return cached;

    // Lê o arquivo como base64
    // Nota: para arquivos grandes isso pode ser lento.
    // Em produção: implementar leitura parcial do ZIP (apenas headers)
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Carrega com JSZip
    const zip    = await JSZip.loadAsync(base64, { base64: true });
    const files  = Object.keys(zip.files).sort();

    // Encontra a primeira imagem
    let firstImage = null;
    for (const name of files) {
      const ext = name.split('.').pop()?.toLowerCase();
      if (IMAGE_EXTS.includes(ext) && !zip.files[name].dir) {
        firstImage = zip.files[name];
        break;
      }
    }

    if (!firstImage) return null;

    // Salva em cache
    const imgBase64  = await firstImage.async('base64');
    const cachePath  = COVER_CACHE_DIR + cacheName(uri);
    await FileSystem.writeAsStringAsync(cachePath, imgBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return cachePath;
  } catch (e) {
    console.warn('[CoverExtractor] Erro CBZ:', e.message);
    return null;
  }
}

// ── Extração de CBR (RAR) ─────────────────────────────────────────
// RAR não tem suporte nativo no JavaScript puro.
// Opções futuras:
//   - Usar expo-modules-core com módulo nativo customizado
//   - Renomear CBR para CBZ se o arquivo for ZIP (alguns CBR são ZIP disfarçados)
//   - Biblioteca nativa: https://github.com/msgpack/unrar-web
async function extractCBRCover(uri) {
  try {
    // Tentativa: alguns arquivos .cbr são na verdade ZIPs renomeados
    const result = await extractCBZCover(uri);
    if (result) return result;
  } catch {}
  return null; // retorna null → FolderCard/ComicCard usa placeholder colorido
}

// ── Extração de PDF ───────────────────────────────────────────────
// Para thumbnails de PDF em Expo managed workflow, opções:
//   - expo-pdf-thumbnail (plugin nativo, requer prebuild)
//   - react-native-pdf (suporte a renderização)
// Por ora retorna null e exibe placeholder colorido.
// TODO: integrar expo-pdf-thumbnail após ejetar ou usar EAS Build
async function extractPDFCover(_uri) {
  return null;
}

// ── Entry point ───────────────────────────────────────────────────
export async function extractCover(uri, format) {
  switch (format?.toUpperCase()) {
    case 'CBZ': return extractCBZCover(uri);
    case 'CBR': return extractCBRCover(uri);
    case 'PDF': return extractPDFCover(uri);
    default:    return null;
  }
}

// ── Extrai capas de uma lista de arquivos em paralelo (com limite) ─
export async function extractCoversForFiles(files, onProgress) {
  const BATCH = 4; // máx paralelo para não travar
  const results = {};

  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (file) => {
        const coverUri = await extractCover(file.uri, file.format);
        results[file.id] = coverUri;
        onProgress?.(i + batch.length, files.length);
      }),
    );
  }

  return results;
}

// ── Limpa cache de capas ──────────────────────────────────────────
export async function clearCoversCache() {
  try {
    await FileSystem.deleteAsync(COVER_CACHE_DIR, { idempotent: true });
  } catch (e) {
    console.warn('[CoverExtractor] Erro ao limpar cache:', e);
  }
}