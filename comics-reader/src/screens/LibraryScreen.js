import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import ComicCard   from '../components/ComicCard';
import FolderCard  from '../components/FolderCard';
import { MOCK_ROOT, MOCK_MARVEL } from '../data/mockData';

const { width } = Dimensions.get('window');
const H_PAD      = SPACING.lg;
const GRID_GAP   = SPACING.md;
const CARD_WIDTH = (width - H_PAD * 2 - GRID_GAP) / 2;

export default function LibraryScreen({ navigation, route }) {
  const [showSearch, setShowSearch] = useState(false);

  const isSubfolder = route?.params?.folderName === 'Marvel';
  const data        = isSubfolder ? MOCK_MARVEL : MOCK_ROOT;

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {isSubfolder ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.logoMini}>
              <Ionicons name="albums" size={20} color={COLORS.accent} />
            </View>
          )}
          <Text style={styles.headerTitle} numberOfLines={1}>{data.name}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.iconBtn, showSearch && styles.iconBtnActive]}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons
              name="search"
              size={20}
              color={showSearch ? COLORS.accent : COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Barra de busca ─────────────────────────────── */}
      {showSearch && (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={15} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar HQs e pastas..."
            placeholderTextColor={COLORS.textMuted}
            autoFocus
          />
          <TouchableOpacity onPress={() => setShowSearch(false)}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Breadcrumb ─────────────────────────────────── */}
      <View style={styles.breadcrumb}>
        <TouchableOpacity
          style={styles.crumbItem}
          onPress={() => !isSubfolder ? null : navigation.navigate('Library')}
        >
          <Ionicons name="home-outline" size={13} color={isSubfolder ? COLORS.accent : COLORS.textMuted} />
          {!isSubfolder && <Text style={styles.crumbText}>Início</Text>}
        </TouchableOpacity>

        {isSubfolder && (
          <>
            <Ionicons name="chevron-forward" size={12} color={COLORS.textMuted} />
            <Text style={styles.crumbActive}>{data.name}</Text>
          </>
        )}

        <View style={styles.crumbSpacer} />
        <Text style={styles.crumbCount}>{data.folders.length + data.comics.length} itens</Text>
      </View>

      {/* ── Conteúdo ───────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Pastas */}
        {data.folders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitle}>PASTAS</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{data.folders.length}</Text>
              </View>
            </View>
            <View style={styles.folderList}>
              {data.folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onPress={() =>
                    folder.name === 'Marvel'
                      ? navigation.navigate('Library', { folderName: 'Marvel' })
                      : null
                  }
                />
              ))}
            </View>
          </View>
        )}

        {/* HQs */}
        {data.comics.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitle}>QUADRINHOS</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{data.comics.length}</Text>
              </View>
            </View>
            <View style={styles.grid}>
              {data.comics.map((comic) => (
                <ComicCard
                  key={comic.id}
                  comic={comic}
                  width={CARD_WIDTH}
                  onPress={() => navigation.navigate('Reader', { comic })}
                />
              ))}
            </View>
          </View>
        )}

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: H_PAD,
    paddingVertical:  SPACING.md,
    backgroundColor:  COLORS.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    flex:          1,
    gap:           SPACING.sm,
  },
  logoMini: {
    width:           34,
    height:          34,
    borderRadius:    RADIUS.sm,
    backgroundColor: COLORS.accentMuted,
    alignItems:      'center',
    justifyContent:  'center',
  },
  headerTitle: {
    fontSize:   FONTS.lg,
    fontWeight: '700',
    color:      COLORS.textPrimary,
    flex:       1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.xs,
  },
  iconBtn: {
    padding:      SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  iconBtnActive: {
    backgroundColor: COLORS.accentMuted,
  },

  // Search
  searchBar: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  COLORS.surface,
    marginHorizontal: H_PAD,
    marginTop:        SPACING.sm,
    borderRadius:     RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical:  SPACING.sm,
    gap:              SPACING.sm,
    borderWidth:      1,
    borderColor:      COLORS.border,
  },
  searchInput: {
    flex:     1,
    fontSize: FONTS.md,
    color:    COLORS.textPrimary,
    padding:  0,
  },

  // Breadcrumb
  breadcrumb: {
    flexDirection:    'row',
    alignItems:       'center',
    paddingHorizontal: H_PAD,
    paddingVertical:  SPACING.sm,
    backgroundColor:  COLORS.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap:              SPACING.xs,
  },
  crumbItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  crumbText: {
    fontSize: FONTS.sm,
    color:    COLORS.textMuted,
  },
  crumbActive: {
    fontSize:   FONTS.sm,
    color:      COLORS.accent,
    fontWeight: '600',
  },
  crumbSpacer: { flex: 1 },
  crumbCount: {
    fontSize: FONTS.sm,
    color:    COLORS.textMuted,
  },

  // Scroll
  scroll:        { flex: 1 },
  scrollContent: { padding: H_PAD },

  // Section
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.sm,
    marginBottom:  SPACING.md,
  },
  sectionLine: {
    width:           3,
    height:          14,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.accent,
  },
  sectionTitle: {
    fontSize:      FONTS.xs,
    fontWeight:    '800',
    color:         COLORS.textMuted,
    letterSpacing: 1.8,
  },
  sectionBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical:   2,
    borderRadius:      RADIUS.full,
    backgroundColor:   COLORS.accentMuted,
    borderWidth:       1,
    borderColor:       COLORS.accent + '30',
  },
  sectionBadgeText: {
    fontSize:   FONTS.xs,
    fontWeight: '800',
    color:      COLORS.accent,
  },

  // Lists
  folderList: {
    gap: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           GRID_GAP,
  },
});