// src/components/FolderCard.jsx
// Card de PASTA — efeito de pilha de 3 capas, otimizado para 4+ por fileira

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

function CoverLayer({ cover, style }) {
  // Em produção: if (cover.uri) return <Image source={{ uri: cover.uri }} style={[styles.coverImg, style]} resizeMode="cover" />
  return (
    <View style={[styles.coverMock, { backgroundColor: cover.bg }, style]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: cover.accent, opacity: 0.5 }]} />
      <Text style={styles.coverLetter}>{cover.letter}</Text>
    </View>
  );
}

export default function FolderCard({ folder, cardWidth, onPress }) {
  const coverH = cardWidth * 1.42;
  const covers = folder.coverImages ?? [];
  const c0     = covers[0] ?? { bg: COLORS.surface,         accent: COLORS.surfaceElevated, letter: '?' };
  const c1     = covers[1] ?? c0;
  const c2     = covers[2] ?? c0;

  // Offsets escalam com o tamanho do card para manter proporção visual
  const off = Math.max(cardWidth * 0.06, 4);

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      {/* ── Pilha de capas ── */}
      <View style={[styles.stackWrapper, { height: coverH + off * 2.5 }]}>

        {/* Capa traseira */}
        <View
          style={[
            styles.stackItem,
            {
              width:     cardWidth - off * 1.5,
              height:    coverH,
              transform: [
                { rotate: '7deg' },
                { translateX: off * 0.8 },
                { translateY: off * 0.5 },
              ],
              zIndex: 1,
            },
          ]}
        >
          <CoverLayer cover={c2} style={StyleSheet.absoluteFill} />
        </View>

        {/* Capa do meio */}
        <View
          style={[
            styles.stackItem,
            {
              width:     cardWidth - off * 0.8,
              height:    coverH,
              transform: [
                { rotate: '3.5deg' },
                { translateX: off * 0.4 },
                { translateY: off * 0.25 },
              ],
              zIndex: 2,
            },
          ]}
        >
          <CoverLayer cover={c1} style={StyleSheet.absoluteFill} />
        </View>

        {/* Capa principal */}
        <View
          style={[
            styles.stackItem,
            {
              width:  cardWidth,
              height: coverH,
              zIndex: 3,
            },
          ]}
        >
          <CoverLayer cover={c0} style={StyleSheet.absoluteFill} />
        </View>
      </View>

      {/* ── Info ── */}
      <View style={styles.info}>
        <Text
          style={[styles.name, { fontSize: cardWidth < 90 ? 10 : FONTS.sm }]}
          numberOfLines={2}
        >
          {folder.name}
        </Text>
        <Text style={[styles.count, { fontSize: cardWidth < 90 ? 9 : FONTS.xs }]}>
          {folder.comicCount.toLocaleString('pt-BR')} quadrinho{folder.comicCount !== 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  stackWrapper: {
    position:       'relative',
    width:          '100%',
    alignItems:     'center',
    justifyContent: 'flex-end',
  },
  stackItem: {
    position:      'absolute',
    bottom:        0,
    borderRadius:  RADIUS.xs,
    overflow:      'hidden',
    elevation:     4,
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius:  6,
  },
  coverMock: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  coverImg: {
    flex:       1,
    resizeMode: 'cover',
  },
  coverLetter: {
    fontSize:      36,
    fontWeight:    '900',
    color:         'rgba(255,255,255,0.07)',
    letterSpacing: -2,
  },
  info: {
    width:             '100%',
    marginTop:         SPACING.sm,
    paddingHorizontal: 1,
  },
  name: {
    fontWeight:   '600',
    color:        COLORS.textPrimary,
    lineHeight:   15,
    marginBottom: 2,
  },
  count: {
    color: COLORS.textSecondary,
  },
});