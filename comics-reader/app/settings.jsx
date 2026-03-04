// app/settings.jsx
// Configurações — gerencia pastas reais com expo-file-system + AsyncStorage

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter }      from 'expo-router';
import { Ionicons }       from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLibrary }     from '../src/hooks/useLibrary';
import { COLORS, FONTS, SPACING, RADIUS } from '../src/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    rootFolders,
    addFolder,
    removeFolder,
    rescanFolder,
    hasAnyFolder,
    scanning,
    scanProgress,
  } = useLibrary();

  const [rescanningId, setRescanningId] = useState(null);

  // ── Adicionar pasta real ────────────────────────────────────────
  const handleAdd = async () => {
    const result = await addFolder();
    if (result.success && !hasAnyFolder) {
      // Primeira pasta adicionada → vai para biblioteca
      router.replace('/library');
    } else if (!result.success && result.error) {
      if (result.error !== 'Cancelado' && result.error !== 'Permissão negada') {
        Alert.alert('Erro', result.error);
      } else if (result.error === 'Pasta já adicionada') {
        Alert.alert('Aviso', 'Esta pasta já está na biblioteca.');
      }
    }
  };

  // ── Remover pasta ───────────────────────────────────────────────
  const handleRemove = (folder) => {
    Alert.alert(
      'Remover pasta',
      `"${folder.name}" será removida da biblioteca.\nOs arquivos NÃO serão deletados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeFolder(folder.id),
        },
      ],
    );
  };

  // ── Reescanear pasta ────────────────────────────────────────────
  const handleRescan = async (folder) => {
    setRescanningId(folder.id);
    await rescanFolder(folder.id);
    setRescanningId(null);
  };

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Banner de scan em progresso */}
      {scanning && (
        <View style={styles.scanBanner}>
          <ActivityIndicator size="small" color={COLORS.accent} />
          <View style={styles.scanBannerText}>
            <Text style={styles.scanBannerTitle}>Escaneando pasta...</Text>
            {scanProgress.total > 0 && (
              <Text style={styles.scanBannerSub}>
                Extraindo capas: {scanProgress.current} / {scanProgress.total}
              </Text>
            )}
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Seção Pastas ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="folder-open" size={16} color={COLORS.accent} />
            </View>
            <Text style={styles.sectionTitle}>Pastas da Biblioteca</Text>
          </View>

          <Text style={styles.sectionDesc}>
            Adicione quantas pastas quiser. Subpastas e arquivos CBR, CBZ e PDF são carregados automaticamente.
          </Text>

          {/* Lista de pastas */}
          {rootFolders.length > 0 ? (
            <View style={styles.folderList}>
              {rootFolders.map((folder, index) => (
                <View
                  key={folder.id}
                  style={[
                    styles.folderItem,
                    index === 0 && styles.folderItemFirst,
                    index === rootFolders.length - 1 && styles.folderItemLast,
                    index > 0 && styles.folderItemBorder,
                  ]}
                >
                  {/* Ícone de pasta */}
                  <View style={styles.folderIcon}>
                    <Ionicons name="folder" size={20} color={COLORS.accent} />
                  </View>

                  {/* Info */}
                  <View style={styles.folderInfo}>
                    <Text style={styles.folderName} numberOfLines={1}>{folder.name}</Text>
                    <Text style={styles.folderPath} numberOfLines={1}>{folder.uri}</Text>
                    <Text style={styles.folderCount}>
                      {(folder.comicCount ?? 0).toLocaleString('pt-BR')} quadrinho{folder.comicCount !== 1 ? 's' : ''}
                      {folder.folderCount > 0 ? ` · ${folder.folderCount} subpasta${folder.folderCount !== 1 ? 's' : ''}` : ''}
                    </Text>
                  </View>

                  {/* Ações */}
                  <View style={styles.folderActions}>
                    {/* Reescanear */}
                    <TouchableOpacity
                      style={styles.folderActionBtn}
                      onPress={() => handleRescan(folder)}
                      disabled={rescanningId === folder.id || scanning}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {rescanningId === folder.id ? (
                        <ActivityIndicator size="small" color={COLORS.accent} />
                      ) : (
                        <Ionicons name="refresh-outline" size={18} color={COLORS.textSecondary} />
                      )}
                    </TouchableOpacity>

                    {/* Remover */}
                    <TouchableOpacity
                      style={styles.folderActionBtn}
                      onPress={() => handleRemove(folder)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyFolders}>
              <Ionicons name="folder-open-outline" size={36} color={COLORS.textMuted} />
              <Text style={styles.emptyFoldersTitle}>Nenhuma pasta adicionada</Text>
              <Text style={styles.emptyFoldersDesc}>
                Toque em "Adicionar Pasta" para selecionar uma pasta do seu dispositivo
              </Text>
            </View>
          )}

          {/* Botão Adicionar */}
          <TouchableOpacity
            style={[styles.addBtn, scanning && styles.addBtnDisabled]}
            onPress={handleAdd}
            disabled={scanning}
            activeOpacity={0.80}
          >
            <LinearGradient
              colors={scanning
                ? [COLORS.surfaceHigh, COLORS.surfaceHigh]
                : [COLORS.accentLight, COLORS.accent, COLORS.accentDark]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.addBtnGradient}
            >
              {scanning ? (
                <ActivityIndicator size="small" color={COLORS.textMuted} />
              ) : (
                <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              )}
              <Text style={[styles.addBtnText, scanning && { color: COLORS.textMuted }]}>
                {scanning ? 'Escaneando...' : 'Adicionar Pasta'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Sobre ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="information-circle" size={16} color={COLORS.accent} />
            </View>
            <Text style={styles.sectionTitle}>Sobre</Text>
          </View>

          <View style={styles.aboutCard}>
            <View style={styles.logoRow}>
              <View style={styles.logoIconBox}>
                <Ionicons name="albums" size={22} color={COLORS.accent} />
              </View>
              <View>
                <Text style={styles.appName}>ComicShelf</Text>
                <Text style={styles.appVersion}>Versão 1.0.0 · Formatos: CBR, CBZ, PDF</Text>
              </View>
            </View>
            <Text style={styles.aboutDesc}>
              Leitor local de quadrinhos. Todos os dados ficam armazenados no seu dispositivo.
            </Text>
          </View>
        </View>

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: FONTS.lg, fontWeight: '700', color: COLORS.textPrimary },

  // Scan banner
  scanBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.accentMuted, paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.accent + '30',
  },
  scanBannerText: { flex: 1 },
  scanBannerTitle: { fontSize: FONTS.sm, fontWeight: '700', color: COLORS.textPrimary },
  scanBannerSub:   { fontSize: FONTS.xs, color: COLORS.textSecondary, marginTop: 1 },

  scroll:        { flex: 1 },
  scrollContent: { padding: SPACING.lg, gap: SPACING.xl },

  section:      { gap: SPACING.md },
  sectionHeader:{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  sectionIconWrap: {
    width: 28, height: 28, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accentMuted, alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: FONTS.md, fontWeight: '700', color: COLORS.textPrimary },
  sectionDesc:  { fontSize: FONTS.sm, color: COLORS.textSecondary, lineHeight: 20 },

  // Folder list
  folderList:   { borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  folderItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  folderItemFirst:  { borderTopLeftRadius: RADIUS.md, borderTopRightRadius: RADIUS.md },
  folderItemLast:   { borderBottomLeftRadius: RADIUS.md, borderBottomRightRadius: RADIUS.md },
  folderItemBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  folderIcon: {
    width: 38, height: 38, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accentMuted, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  folderInfo:    { flex: 1, gap: 2 },
  folderName:    { fontSize: FONTS.md, fontWeight: '600', color: COLORS.textPrimary },
  folderPath:    { fontSize: FONTS.xs, color: COLORS.textMuted },
  folderCount:   { fontSize: FONTS.xs, color: COLORS.textSecondary },
  folderActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flexShrink: 0 },
  folderActionBtn: { padding: SPACING.xs, borderRadius: RADIUS.sm, minWidth: 28, alignItems: 'center' },

  // Empty state
  emptyFolders: {
    alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.sm,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  emptyFoldersTitle: { fontSize: FONTS.md, fontWeight: '600', color: COLORS.textPrimary },
  emptyFoldersDesc:  { fontSize: FONTS.sm, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: SPACING.lg },

  // Add button
  addBtn: {
    borderRadius: RADIUS.md, overflow: 'hidden',
    elevation: 6, shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  addBtnDisabled: { elevation: 0, shadowOpacity: 0 },
  addBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACING.md, gap: SPACING.sm,
  },
  addBtnText: { fontSize: FONTS.md, fontWeight: '700', color: '#FFF' },

  // About
  aboutCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.lg, gap: SPACING.md,
  },
  logoRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  logoIconBox: {
    width: 42, height: 42, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accentMuted, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.accent + '30',
  },
  appName:    { fontSize: FONTS.lg, fontWeight: '800', color: COLORS.textPrimary },
  appVersion: { fontSize: FONTS.xs, color: COLORS.textMuted },
  aboutDesc:  { fontSize: FONTS.sm, color: COLORS.textSecondary, lineHeight: 20 },
});