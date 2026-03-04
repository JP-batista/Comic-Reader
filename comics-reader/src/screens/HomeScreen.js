import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header / Logo ─────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIconWrapper}>
            <Ionicons name="albums" size={22} color={COLORS.accent} />
          </View>
          <Text style={styles.logoText}>ComicShelf</Text>
        </View>
      </View>

      {/* ── Conteúdo central ──────────────────────────── */}
      <View style={styles.body}>

        {/* Ilustração: livros empilhados */}
        <View style={styles.illustration}>
          {/* Sombra */}
          <View style={[styles.bookBase, {
            width: 110, height: 140,
            backgroundColor: COLORS.surfaceHigh,
            transform: [{ rotate: '-18deg' }, { translateX: -10 }],
            bottom: 0, position: 'absolute',
          }]} />
          <View style={[styles.bookBase, {
            width: 110, height: 140,
            backgroundColor: COLORS.surfaceElevated,
            transform: [{ rotate: '-8deg' }],
            bottom: 0, position: 'absolute',
          }]} />
          {/* Livro principal */}
          <View style={[styles.bookBase, styles.bookMain]}>
            <LinearGradient
              colors={[COLORS.surface, COLORS.surfaceElevated]}
              style={StyleSheet.absoluteFill}
            />
            {/* Spine */}
            <View style={styles.bookSpine} />
            <Ionicons name="book" size={52} color={COLORS.accent} style={{ opacity: 0.9 }} />
          </View>
        </View>

        {/* Textos */}
        <Text style={styles.emptyTitle}>Sua biblioteca está vazia</Text>
        <Text style={styles.emptySubtitle}>
          Selecione uma pasta do dispositivo para{'\n'}começar a organizar e ler suas HQs
        </Text>

        {/* Badges de formato suportado */}
        <View style={styles.formatsRow}>
          {[
            { label: 'CBR', color: COLORS.cbr },
            { label: 'CBZ', color: COLORS.cbz },
            { label: 'PDF', color: COLORS.pdf },
          ].map(({ label, color }) => (
            <View key={label} style={[styles.formatPill, { borderColor: color }]}>
              <View style={[styles.formatDot, { backgroundColor: color }]} />
              <Text style={[styles.formatLabel, { color }]}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Rodapé / Botão ────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.selectBtn}
          onPress={() => navigation.navigate('Library')}
          activeOpacity={0.82}
        >
          <LinearGradient
            colors={[COLORS.accentLight, COLORS.accent, COLORS.accentDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.selectBtnGradient}
          >
            <Ionicons name="folder-open" size={20} color="#FFFFFF" />
            <Text style={styles.selectBtnText}>Selecionar Pasta</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.hintRow}>
          <Ionicons name="information-circle-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.hintText}>
            Subpastas e estrutura de diretórios são mantidas
          </Text>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.sm,
  },
  logoIconWrapper: {
    width:           36,
    height:          36,
    borderRadius:    RADIUS.sm,
    backgroundColor: COLORS.accentMuted,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     COLORS.accent + '30',
  },
  logoText: {
    fontSize:      FONTS.xl,
    fontWeight:    '800',
    color:         COLORS.textPrimary,
    letterSpacing: 0.4,
  },

  // Body
  body: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
    gap:            SPACING.lg,
  },
  illustration: {
    width:          170,
    height:         170,
    alignItems:     'center',
    justifyContent: 'flex-end',
    marginBottom:   SPACING.md,
  },
  bookBase: {
    borderRadius: RADIUS.md,
    overflow:     'hidden',
    alignItems:   'center',
    justifyContent: 'center',
  },
  bookMain: {
    width:    110,
    height:   140,
    position: 'relative',
    bottom:   0,
    elevation: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius:  12,
  },
  bookSpine: {
    position:        'absolute',
    left:            0,
    top:             0,
    bottom:          0,
    width:           7,
    backgroundColor: COLORS.accent,
    opacity:         0.7,
  },

  emptyTitle: {
    fontSize:      FONTS.xl,
    fontWeight:    '700',
    color:         COLORS.textPrimary,
    textAlign:     'center',
    letterSpacing: 0.2,
  },
  emptySubtitle: {
    fontSize:      FONTS.md,
    color:         COLORS.textSecondary,
    textAlign:     'center',
    lineHeight:    22,
  },

  formatsRow: {
    flexDirection: 'row',
    gap:           SPACING.sm,
    marginTop:     SPACING.xs,
  },
  formatPill: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius:    RADIUS.full,
    borderWidth:     1,
    backgroundColor: COLORS.surface,
  },
  formatDot: {
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  formatLabel: {
    fontSize:   FONTS.sm,
    fontWeight: '700',
  },

  // Footer
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.xxl,
    gap:               SPACING.md,
    alignItems:        'center',
  },
  selectBtn: {
    width:        '100%',
    borderRadius: RADIUS.lg,
    overflow:     'hidden',
    elevation:    10,
    shadowColor:  COLORS.accent,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius:  14,
  },
  selectBtnGradient: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap:            SPACING.sm,
  },
  selectBtnText: {
    fontSize:      FONTS.lg,
    fontWeight:    '700',
    color:         '#FFFFFF',
    letterSpacing: 0.3,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.xs,
  },
  hintText: {
    fontSize: FONTS.sm,
    color:    COLORS.textMuted,
  },
});