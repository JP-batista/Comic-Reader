// src/components/FolderCard.jsx
// Card de pasta com efeito de pilha.
// Suporta coverImages reais (URIs extraídas) ou placeholder colorido.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

function CoverLayer({ uri, cover, style }) {
  if (uri) {
    return <Image source={{ uri }} style={[styles.coverImg, style]} resizeMode="cover" />;
  }
  // Placeholder
  return (
    <View style={[styles.coverMock, { backgroundColor: cover?.bg ?? COLORS.surface }, style]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: cover?.accent ?? COLORS.surfaceElevated, opacity: 0.5 }]} />
      <Text style={styles.coverLetter}>{cover?.letter ?? '?'}</Text>
    </View>
  );
}

export default function FolderCard({ folder, cardWidth, coverUris = [], onPress }) {
  const coverH = cardWidth * 1.42;
  // coverUris[0] = frente, [1] = meio, [2] = trás
  const u0 = coverUris[0] ?? null;
  const u1 = coverUris[1] ?? null;
  const u2 = coverUris[2] ?? null;
  // Placeholder colors
  const cv = folder.coverImages ?? [];
  const c0 = cv[0] ?? { bg: COLORS.surface, accent: COLORS.surfaceElevated, letter: folder.name?.[0] ?? '?' };
  const c1 = cv[1] ?? c0;
  const c2 = cv[2] ?? c0;

  const off = Math.max(cardWidth * 0.06, 4);

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={[styles.stackWrapper, { height: coverH + off * 2.5 }]}>
        {/* Trás */}
        <View style={[styles.stackItem, {
          width: cardWidth - off * 1.5, height: coverH,
          transform: [{ rotate: '7deg' }, { translateX: off * 0.8 }, { translateY: off * 0.5 }],
          zIndex: 1,
        }]}>
          <CoverLayer uri={u2} cover={c2} style={StyleSheet.absoluteFill} />
        </View>

        {/* Meio */}
        <View style={[styles.stackItem, {
          width: cardWidth - off * 0.8, height: coverH,
          transform: [{ rotate: '3.5deg' }, { translateX: off * 0.4 }, { translateY: off * 0.25 }],
          zIndex: 2,
        }]}>
          <CoverLayer uri={u1} cover={c1} style={StyleSheet.absoluteFill} />
        </View>

        {/* Frente */}
        <View style={[styles.stackItem, { width: cardWidth, height: coverH, zIndex: 3 }]}>
          <CoverLayer uri={u0} cover={c0} style={StyleSheet.absoluteFill} />
        </View>
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { fontSize: cardWidth < 90 ? 10 : FONTS.sm }]} numberOfLines={2}>
          {folder.name}
        </Text>
        <Text style={[styles.count, { fontSize: cardWidth < 90 ? 9 : FONTS.xs }]}>
          {(folder.comicCount ?? 0).toLocaleString('pt-BR')} quadrinho{folder.comicCount !== 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container:    { alignItems: 'center' },
  stackWrapper: { position: 'relative', width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  stackItem: {
    position: 'absolute', bottom: 0,
    borderRadius: RADIUS.xs, overflow: 'hidden',
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.5, shadowRadius: 6,
  },
  coverMock:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coverImg:    { flex: 1, width: '100%' },
  coverLetter: { fontSize: 36, fontWeight: '900', color: 'rgba(255,255,255,0.07)', letterSpacing: -2 },
  info:        { width: '100%', marginTop: SPACING.sm, paddingHorizontal: 1 },
  name:        { fontWeight: '600', color: COLORS.textPrimary, lineHeight: 15, marginBottom: 2 },
  count:       { color: COLORS.textSecondary },
});