// app/folder.jsx
// Tela de pasta com:
//   - Dados reais via useLibrary
//   - Long press → LongPressMenu (definir capa, marcar lido/não lido)
//   - Fundo desfocado com capa da pasta

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, useWindowDimensions, Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons }       from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLibrary }     from '../src/hooks/useLibrary';
import ComicCard          from '../src/components/ComicCard';
import FolderCard         from '../src/components/FolderCard';
import GridSection        from '../src/components/GridSection';
import LongPressMenu      from '../src/components/LongPressMenu';
import { COLORS, FONTS, SPACING, RADIUS } from '../src/constants/theme';

const H_PAD = SPACING.lg;
const GAP   = SPACING.sm;

function useCols(w) {
  if (w >= 900) return 8;
  if (w >= 600) return 6;
  return 4;
}

// Encontra uma pasta pelo id em toda a árvore
function findFolder(rootFolders, id) {
  for (const root of rootFolders) {
    const found = searchFolder(root, id);
    if (found) return found;
  }
  return null;
}
function searchFolder(node, id) {
  if (node.id === id) return node;
  for (const sub of (node.folders ?? [])) {
    const found = searchFolder(sub, id);
    if (found) return found;
  }
  return null;
}

// Pega URIs de capa para subpasta
function getFolderCoverUris(folder, covers) {
  const allFiles = collectFiles(folder);
  return allFiles.map((f) => covers[f.id]).filter(Boolean).slice(0, 3);
}
function collectFiles(node) {
  const files = [...(node.files ?? [])];
  for (const sub of (node.folders ?? [])) files.push(...collectFiles(sub));
  return files;
}

export default function FolderScreen() {
  const router           = useRouter();
  const { id, name }     = useLocalSearchParams();
  const { width }        = useWindowDimensions();
  const cols             = useCols(width);
  const cardWidth        = (width - H_PAD * 2 - GAP * (cols - 1)) / cols;

  const {
    rootFolders, covers, getProgress, getFolderCover,
    markAsRead, markAsUnread, setFolderCover,
  } = useLibrary();

  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery]           = useState('');

  // Menu de long press
  const [menuVisible,  setMenuVisible]  = useState(false);
  const [menuComic,    setMenuComic]    = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const folder = useMemo(
    () => findFolder(rootFolders, id),
    [rootFolders, id],
  );

  if (!folder) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtnAlone} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Ionicons name="folder-open-outline" size={44} color={COLORS.textMuted} />
          <Text style={styles.notFoundText}>Pasta não encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  const subFolders = (folder.folders ?? []).filter(
    (f) => !query || f.name.toLowerCase().includes(query.toLowerCase()),
  );
  const comics = (folder.files ?? []).filter(
    (c) => !query || (c.title ?? c.name)?.toLowerCase().includes(query.toLowerCase()),
  );

  // Capa de fundo da tela (primeira capa disponível)
  const allFiles    = collectFiles(folder);
  const bgCoverUri  = getFolderCover(folder.id)
    ?? allFiles.map((f) => covers[f.id]).find(Boolean)
    ?? null;

  const handleLongPress = (comic, position) => {
    setMenuComic(comic);
    setMenuPosition(position);
    setMenuVisible(true);
  };

  const handleMenuAction = async (action, comic) => {
    switch (action) {
      case 'set_cover':
        await setFolderCover(folder.id, comic.id);
        break;
      case 'mark_read': {
        const prog = getProgress(comic.id);
        await markAsRead(comic.id, prog.totalPages || 1);
        break;
      }
      case 'mark_unread':
        await markAsUnread(comic.id);
        break;
    }
  };

  return (
    <View style={styles.root}>
      {/* Fundo desfocado */}
      {bgCoverUri ? (
        <Image
          source={{ uri: bgCoverUri }}
          style={[StyleSheet.absoluteFill, { opacity: 0.35 }]}
          resizeMode="cover"
          blurRadius={22}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1A0800' }]} />
      )}
      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.82)', 'rgba(10,10,10,0.98)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {name ?? folder.name}
          </Text>
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
              placeholder="Buscar..."
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
          {/* Subpastas */}
          {subFolders.length > 0 && (
            <GridSection
              items={subFolders}
              cols={cols}
              gap={GAP}
              rowGap={SPACING.xl}
              renderItem={(sub) => (
                <FolderCard
                  key={sub.id}
                  folder={sub}
                  cardWidth={cardWidth}
                  coverUris={getFolderCoverUris(sub, covers)}
                  onPress={() =>
                    router.push({ pathname: '/folder', params: { id: sub.id, name: sub.name } })
                  }
                />
              )}
            />
          )}

          {subFolders.length > 0 && comics.length > 0 && (
            <View style={styles.divider} />
          )}

          {/* HQs — com long press */}
          {comics.length > 0 && (
            <GridSection
              items={comics}
              cols={cols}
              gap={GAP}
              rowGap={SPACING.md}
              renderItem={(comic) => (
                <ComicCard
                  key={comic.id}
                  comic={comic}
                  cardWidth={cardWidth}
                  coverUri={covers[comic.id] ?? null}
                  progressData={getProgress(comic.id)}
                  onPress={() =>
                    router.push({ pathname: '/reader', params: { id: comic.id, title: comic.title ?? comic.name } })
                  }
                  onLongPress={handleLongPress}
                />
              )}
            />
          )}

          {subFolders.length === 0 && comics.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="albums-outline" size={44} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>
                {query ? `Nenhum resultado para "${query}"` : 'Pasta vazia'}
              </Text>
            </View>
          )}

          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>

      {/* Menu de contexto */}
      <LongPressMenu
        visible={menuVisible}
        comic={menuComic}
        position={menuPosition}
        onAction={handleMenuAction}
        onClose={() => setMenuVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: H_PAD, paddingVertical: SPACING.md, gap: SPACING.sm,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  backBtnAlone: { margin: SPACING.lg },
  headerTitle:   { flex: 1, fontSize: FONTS.lg, fontWeight: '700', color: COLORS.textPrimary },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn:     { padding: SPACING.sm, borderRadius: RADIUS.sm },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: H_PAD, marginBottom: SPACING.sm,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    gap: SPACING.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  searchInput:  { flex: 1, fontSize: FONTS.md, color: COLORS.textPrimary, padding: 0 },
  scroll:       { flex: 1 },
  scrollContent:{ paddingTop: SPACING.sm },
  divider:      { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: SPACING.lg },
  emptyState:   { alignItems: 'center', paddingTop: SPACING.xxxl * 2, gap: SPACING.md },
  emptyText:    { fontSize: FONTS.md, color: COLORS.textMuted },
  notFound:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  notFoundText: { fontSize: FONTS.md, color: COLORS.textMuted },
});