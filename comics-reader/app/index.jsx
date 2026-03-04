// app/index.jsx
// Ponto de entrada — verifica se há pastas salvas e redireciona.

import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useRouter }      from 'expo-router';
import { Ionicons }       from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLibrary }     from '../src/hooks/useLibrary';
import { COLORS, FONTS, SPACING, RADIUS } from '../src/constants/theme';

export default function IndexScreen() {
  const router             = useRouter();
  const { hasAnyFolder, loading } = useLibrary();

  // Redireciona automaticamente assim que o estado carrega
  useEffect(() => {
    if (!loading && hasAnyFolder) {
      router.replace('/library');
    }
  }, [loading, hasAnyFolder]);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.logoIcon}>
          <Ionicons name="albums" size={28} color={COLORS.accent} />
        </View>
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: SPACING.lg }} />
      </View>
    );
  }

  // Se já tem pastas → redireciona (acima). Se não → onboarding.
  return <OnboardingScreen router={router} />;
}

function OnboardingScreen({ router }) {
  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="albums" size={20} color={COLORS.accent} />
          </View>
          <Text style={styles.logoText}>ComicShelf</Text>
        </View>
      </View>

      {/* Conteúdo */}
      <View style={styles.body}>
        {/* Livros empilhados */}
        <View style={styles.illustrationWrap}>
          <View style={[styles.book, styles.bookBack]} />
          <View style={[styles.book, styles.bookMid]} />
          <View style={[styles.book, styles.bookFront]}>
            <LinearGradient colors={[COLORS.surface, COLORS.surfaceElevated]} style={StyleSheet.absoluteFill} />
            <LinearGradient colors={[COLORS.accent + 'CC', COLORS.accentDark + '55']} style={styles.bookSpine} />
            <Ionicons name="book" size={48} color={COLORS.accent} style={{ opacity: 0.9 }} />
          </View>
        </View>

        <Text style={styles.title}>Bem-vindo ao ComicShelf</Text>
        <Text style={styles.subtitle}>
          Seu leitor local de HQs.{'\n'}
          Adicione as pastas onde seus quadrinhos estão armazenados para começar.
        </Text>

        {/* Badges */}
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

        {/* Features */}
        <View style={styles.featureList}>
          {[
            { icon: 'folder-open-outline',    text: 'Múltiplas pastas suportadas' },
            { icon: 'git-branch-outline',     text: 'Subpastas mantidas automaticamente' },
            { icon: 'save-outline',           text: 'Progresso salvo localmente' },
            { icon: 'phone-portrait-outline', text: 'Nenhum dado sai do dispositivo' },
          ].map(({ icon, text }) => (
            <View key={text} style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <Ionicons name={icon} size={14} color={COLORS.accent} />
              </View>
              <Text style={styles.featureText}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.push('/settings')}
          activeOpacity={0.82}
        >
          <LinearGradient
            colors={[COLORS.accentLight, COLORS.accent, COLORS.accentDark]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.ctaBtnGradient}
          >
            <Ionicons name="folder-open" size={20} color="#FFF" />
            <Text style={styles.ctaBtnText}>Adicionar Pasta</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.hintRow}>
          <Ionicons name="lock-closed-outline" size={12} color={COLORS.textMuted} />
          <Text style={styles.hintText}>Seus arquivos nunca saem do dispositivo</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  container:    { flex: 1, backgroundColor: COLORS.bg },
  topBar: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  logoRow:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  logoIcon: {
    width: 34, height: 34, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accentMuted, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.accent + '30',
  },
  logoText:     { fontSize: FONTS.xl, fontWeight: '800', color: COLORS.textPrimary },
  body: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: SPACING.xl, gap: SPACING.lg,
  },
  illustrationWrap: { width: 160, height: 155, position: 'relative', marginBottom: SPACING.sm },
  book:             { position: 'absolute', borderRadius: RADIUS.md, overflow: 'hidden' },
  bookBack: {
    width: 104, height: 132, backgroundColor: COLORS.surfaceHigh,
    bottom: 0, left: 10, transform: [{ rotate: '-17deg' }],
  },
  bookMid: {
    width: 104, height: 132, backgroundColor: COLORS.surfaceElevated,
    bottom: 0, left: 6, transform: [{ rotate: '-8deg' }],
  },
  bookFront: {
    width: 106, height: 134, bottom: 0, left: 8,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12,
  },
  bookSpine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  title:    { fontSize: FONTS.xl, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: FONTS.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  formatsRow:   { flexDirection: 'row', gap: SPACING.sm },
  formatPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: SPACING.md, paddingVertical: 5,
    borderRadius: RADIUS.full, borderWidth: 1, backgroundColor: COLORS.surface,
  },
  formatDot:    { width: 6, height: 6, borderRadius: 3 },
  formatLabel:  { fontSize: FONTS.sm, fontWeight: '700' },
  featureList:  { width: '100%', gap: SPACING.sm },
  featureItem:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  featureIconWrap: {
    width: 26, height: 26, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accentMuted, alignItems: 'center', justifyContent: 'center',
  },
  featureText:  { fontSize: FONTS.sm, color: COLORS.textSecondary },
  footer: {
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl,
    gap: SPACING.md, alignItems: 'center',
  },
  ctaBtn: {
    width: '100%', borderRadius: RADIUS.lg, overflow: 'hidden',
    elevation: 10, shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.5, shadowRadius: 14,
  },
  ctaBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACING.lg, gap: SPACING.sm,
  },
  ctaBtnText: { fontSize: FONTS.lg, fontWeight: '700', color: '#FFF' },
  hintRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  hintText:   { fontSize: FONTS.sm, color: COLORS.textMuted },
});