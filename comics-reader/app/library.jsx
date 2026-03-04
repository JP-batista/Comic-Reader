// app/library.jsx — lê dados reais do useLibrary

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, useWindowDimensions,
} from 'react-native';
import { useRouter }    from 'expo-router';
import { Ionicons }     from '@expo/vector-icons';
import { useLibrary }   from '../src/hooks/useLibrary';
import FolderCard       from '../src/components/FolderCard';
import ComicCard        from '../src/components/ComicCard';
import GridSection      from '../src/components/GridSection';
import { COLORS, FONTS, SPACING, RADIUS } from '../src/constants/theme';

const H_PAD = SPACING.lg;
const GAP   = SPACING.sm;

function useCols(w) {
  if (w >= 900) return 8;
  if (w >= 600) return 6;
  return 4;
}

// Pega as 3 primeiras URIs de capa de uma pasta (para a pilha)
function getFolderCoverUris(folder, covers, customCovers) {
  // Capa customizada na frente
  const custom = customCovers[folder.id]?.uri ?? null;
  const allFiles = collectFiles(folder);
  const uris = allFiles
    .map((f) => covers[f.id])
    .filter(Boolean)
    .slice(0, 3);
  if (custom) uris[0] = custom;
  return uris;
}

function collectFiles(node) {
  const files = [...(node.files ?? [])];
  for (const sub of (node.folders ?? [])) files.push(...collectFiles(sub));
  return files;
}

export default function LibraryScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cols      = useCols(width);
  const cardWidth = (width - H_PAD * 2 - GAP * (cols - 1)) / cols;

  const { rootFolders, covers, loading } = useLibrary();
  // O hook não expõe customCovers diretamente, mas podemos construir
  // via getFolderCover — aqui simplificamos usando covers
  const customCovers = {};

  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery]           = useState('');

  // A biblioteca mostra as rootFolders como "pastas de topo"
  // Cada rootFolder pode ter subpastas e arquivos dentro
  const filtered = rootFolders.filter(
    (f) => !query || f.name.toLowerCase().includes(query.toLowerCase()),
  );

  // Arquivos soltos na raiz (de todas as pastas raiz)
  const looseFiles = rootFolders
    .flatMap((rf) => rf.files ?? [])
    .filter((f) => !query || f.title?.toLowerCase().includes(query.toLowerCase()));

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Biblioteca</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => { setShowSearch((v) => !v); setQuery(''); }}
          >
            <Ionicons
              name={showSearch ? 'close' : 'search'}
              size={20}
              color={showSearch ? COLORS.accent : COLORS.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="filter-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Busca */}
      {showSearch && (
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={15} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar pastas e quadrinhos..."
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: H_PAD }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Pastas raiz */}
        {filtered.length > 0 && (
          <GridSection
            items={filtered}
            cols={cols}
            gap={GAP}
            rowGap={SPACING.xl}
            renderItem={(folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                cardWidth={cardWidth}
                coverUris={getFolderCoverUris(folder, covers, customCovers)}
                onPress={() =>
                  router.push({ pathname: '/folder', params: { id: folder.id, name: folder.name } })
                }
              />
            )}
          />
        )}

        {/* Arquivos soltos */}
        {looseFiles.length > 0 && filtered.length > 0 && (
          <View style={styles.divider} />
        )}
        {looseFiles.length > 0 && (
          <GridSection
            items={looseFiles}
            cols={cols}
            gap={GAP}
            rowGap={SPACING.md}
            renderItem={(comic) => (
              <ComicCard
                key={comic.id}
                comic={comic}
                cardWidth={cardWidth}
                coverUri={covers[comic.id] ?? null}
                onPress={() =>
                  router.push({ pathname: '/reader', params: { id: comic.id, title: comic.title } })
                }
              />
            )}
          />
        )}

        {/* Vazio após busca */}
        {filtered.length === 0 && looseFiles.length === 0 && query.length > 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={44} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Nenhum resultado para "{query}"</Text>
          </View>
        )}

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: H_PAD, paddingVertical: SPACING.md,
  },
  headerTitle:   { fontSize: FONTS.xl, fontWeight: '700', color: COLORS.textPrimary },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn:     { padding: SPACING.sm, borderRadius: RADIUS.sm },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    marginHorizontal: H_PAD, marginBottom: SPACING.sm,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput:   { flex: 1, fontSize: FONTS.md, color: COLORS.textPrimary, padding: 0 },
  scroll:        { flex: 1 },
  scrollContent: { paddingTop: SPACING.sm },
  divider:       { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },
  emptyState:    { alignItems: 'center', paddingTop: SPACING.xxxl * 2, gap: SPACING.md },
  emptyText:     { fontSize: FONTS.md, color: COLORS.textMuted },
});