import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons }       from '@expo/vector-icons';
import { BlurView }       from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../src/constants/theme';
import { MOCK_PAGES } from '../src/data/mockData';

const { width, height } = Dimensions.get('window');

export default function ReaderScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const { title } = useLocalSearchParams();

  const [currentPage,    setCurrentPage]    = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const flatListRef = useRef(null);

  const progress = (currentPage + 1) / MOCK_PAGES.length;

  const onMomentumEnd = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentPage(idx);
  };

  const goTo = (idx) => {
    if (idx < 0 || idx >= MOCK_PAGES.length) return;
    flatListRef.current?.scrollToIndex({ index: idx, animated: true });
    setCurrentPage(idx);
  };

  const renderPage = ({ item }) => (
    <TouchableOpacity
      style={[styles.page, { backgroundColor: item.bg }]}
      onPress={() => setOverlayVisible((v) => !v)}
      activeOpacity={1}
    >
      {/* Grade de painéis simulando uma HQ */}
      <View style={styles.panelArea}>
        <View style={styles.panelRowTop}>
          <View style={[styles.panel, { flex: 2.2, backgroundColor: item.accent }]}>
            <Ionicons name="image-outline" size={36} color="rgba(255,255,255,0.06)" />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={[styles.panel, { flex: 1, backgroundColor: item.accent }]}>
              <Ionicons name="image-outline" size={22} color="rgba(255,255,255,0.06)" />
            </View>
            <View style={[styles.panel, { flex: 1, backgroundColor: item.accent }]}>
              <Ionicons name="image-outline" size={22} color="rgba(255,255,255,0.06)" />
            </View>
          </View>
        </View>
        <View style={styles.panelRowBottom}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.panel, { flex: 1, backgroundColor: item.accent }]}>
              <Ionicons name="image-outline" size={22} color="rgba(255,255,255,0.06)" />
            </View>
          ))}
        </View>
      </View>

      {/* Número da página */}
      <Text style={styles.pageWatermark}>{item.number}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden={!overlayVisible} />

      {/* ── Páginas ── */}
      <FlatList
        ref={flatListRef}
        data={MOCK_PAGES}
        renderItem={renderPage}
        keyExtractor={(item) => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        initialScrollIndex={0}
        getItemLayout={(_, index) => ({
          length: width, offset: width * index, index,
        })}
      />

      {/* ── Overlays ── */}
      {overlayVisible && (
        <>
          {/* Top bar */}
          <View style={[styles.topBar, { paddingTop: insets.top + SPACING.sm }]}>
            <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.topBarContent}>
              <TouchableOpacity style={styles.overlayBtn} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <View style={styles.topCenter}>
                <Text style={styles.topTitle} numberOfLines={1}>
                  {title ?? 'The Amazing Spider-Man #1'}
                </Text>
                <Text style={styles.topSub}>
                  Página {currentPage + 1} de {MOCK_PAGES.length}
                </Text>
              </View>
              <TouchableOpacity style={styles.overlayBtn}>
                <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom bar */}
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + SPACING.md }]}>
            <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.bottomBarContent}>

              {/* Progress */}
              <View style={styles.progressArea}>
                <TouchableOpacity
                  onPress={() => goTo(0)}
                  style={styles.progressEdgeBtn}
                >
                  <Ionicons name="play-skip-back" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                  {/* Thumb */}
                  <View style={[styles.progressThumb, { left: `${progress * 100}%` }]} />
                </View>
                <TouchableOpacity
                  onPress={() => goTo(MOCK_PAGES.length - 1)}
                  style={styles.progressEdgeBtn}
                >
                  <Ionicons name="play-skip-forward" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
                <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
              </View>

              {/* Controles */}
              <View style={styles.controls}>
                <TouchableOpacity
                  style={[styles.navBtn, currentPage === 0 && styles.navBtnDisabled]}
                  onPress={() => goTo(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={currentPage === 0 ? COLORS.textMuted : COLORS.textPrimary}
                  />
                  <Text
                    style={[
                      styles.navBtnText,
                      currentPage === 0 && { color: COLORS.textMuted },
                    ]}
                  >
                    Anterior
                  </Text>
                </TouchableOpacity>

                {/* Indicador central */}
                <View style={styles.pageIndicator}>
                  <Text style={styles.pageNum}>{currentPage + 1}</Text>
                  <Text style={styles.pageTotal}> / {MOCK_PAGES.length}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.navBtn, styles.navBtnRight,
                    currentPage === MOCK_PAGES.length - 1 && styles.navBtnDisabled,
                  ]}
                  onPress={() => goTo(currentPage + 1)}
                  disabled={currentPage === MOCK_PAGES.length - 1}
                >
                  <Text
                    style={[
                      styles.navBtnText,
                      currentPage === MOCK_PAGES.length - 1 && { color: COLORS.textMuted },
                    ]}
                  >
                    Próxima
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={
                      currentPage === MOCK_PAGES.length - 1
                        ? COLORS.textMuted
                        : COLORS.textPrimary
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  // Páginas mock
  page: {
    width,
    height,
    padding: 14,
    gap:     8,
  },
  panelArea:      { flex: 1, gap: 6 },
  panelRowTop:    { flex: 2.2, flexDirection: 'row', gap: 6 },
  panelRowBottom: { flex: 1,   flexDirection: 'row', gap: 6 },
  panel: {
    borderRadius:   3,
    borderWidth:    1,
    borderColor:    'rgba(255,255,255,0.04)',
    alignItems:     'center',
    justifyContent: 'center',
    overflow:       'hidden',
  },
  pageWatermark: {
    position:   'absolute',
    bottom:     20,
    alignSelf:  'center',
    fontSize:   12,
    color:      'rgba(255,255,255,0.1)',
    fontWeight: '700',
  },

  // Top bar
  topBar: {
    position:  'absolute',
    top:       0,
    left:      0,
    right:     0,
    zIndex:    10,
    overflow:  'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  topBarContent: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: SPACING.md,
    paddingBottom:     SPACING.sm,
    gap:               SPACING.sm,
  },
  overlayBtn: {
    width:           40,
    height:          40,
    borderRadius:    RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  topCenter:  { flex: 1, alignItems: 'center' },
  topTitle:   { fontSize: FONTS.md, fontWeight: '700', color: COLORS.textPrimary },
  topSub:     { fontSize: FONTS.xs, color: COLORS.textSecondary, marginTop: 2 },

  // Bottom bar
  bottomBar: {
    position:  'absolute',
    bottom:    0,
    left:      0,
    right:     0,
    zIndex:    10,
    overflow:  'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  bottomBarContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.md,
    gap:               SPACING.md,
  },

  // Progress
  progressArea: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.sm,
  },
  progressEdgeBtn: {
    padding: 4,
  },
  progressTrack: {
    flex:            1,
    height:          4,
    backgroundColor: COLORS.border,
    borderRadius:    RADIUS.full,
    overflow:        'visible',
    position:        'relative',
  },
  progressFill: {
    height:          '100%',
    backgroundColor: COLORS.accent,
    borderRadius:    RADIUS.full,
  },
  progressThumb: {
    position:        'absolute',
    top:             -6,
    width:           16,
    height:          16,
    borderRadius:    8,
    backgroundColor: COLORS.accent,
    marginLeft:      -8,
    borderWidth:     2.5,
    borderColor:     '#FFF',
    elevation:       4,
    shadowColor:     COLORS.accent,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.6,
    shadowRadius:    6,
  },
  progressPct: {
    fontSize:   FONTS.sm,
    color:      COLORS.accent,
    fontWeight: '700',
    minWidth:   34,
    textAlign:  'right',
  },

  // Controls
  controls: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    padding:       SPACING.sm,
  },
  navBtnRight:    { flexDirection: 'row-reverse' },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText:     { fontSize: FONTS.sm, color: COLORS.textPrimary, fontWeight: '500' },
  pageIndicator: {
    flexDirection:     'row',
    alignItems:        'baseline',
    backgroundColor:   COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.sm,
    borderRadius:      RADIUS.full,
    borderWidth:       1,
    borderColor:       COLORS.border,
  },
  pageNum:   { fontSize: FONTS.lg, fontWeight: '800', color: COLORS.textPrimary },
  pageTotal: { fontSize: FONTS.md, color: COLORS.textSecondary, fontWeight: '400' },
});