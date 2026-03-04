// src/components/LongPressMenu.jsx
// Menu de contexto que aparece ao segurar um card de HQ.
// Opções: Definir como capa da pasta | Marcar como lido | Marcar como não lido

import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  TouchableWithoutFeedback, Animated, Dimensions,
} from 'react-native';
import { Ionicons }     from '@expo/vector-icons';
import { BlurView }     from 'expo-blur';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const MENU_W = 230;

const MENU_ITEMS = [
  {
    id:    'set_cover',
    label: 'Definir como capa da pasta',
    icon:  'image-outline',
    color: COLORS.textPrimary,
  },
  {
    id:    'mark_read',
    label: 'Marcar como lida',
    icon:  'checkmark-circle-outline',
    color: COLORS.cbz,
  },
  {
    id:    'mark_unread',
    label: 'Marcar como não lida',
    icon:  'ellipse-outline',
    color: COLORS.textSecondary,
  },
];

export default function LongPressMenu({ visible, comic, position, onAction, onClose }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(anim, {
        toValue:  1,
        tension:  80,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue:  0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible && !comic) return null;

  // Calcula posição do menu (evita sair da tela)
  const posX = position
    ? Math.min(Math.max(position.x, SPACING.lg), SCREEN_W - MENU_W - SPACING.lg)
    : (SCREEN_W - MENU_W) / 2;
  const posY = position
    ? Math.min(position.y, SCREEN_H - MENU_ITEMS.length * 52 - 100)
    : SCREEN_H / 2 - 100;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Fundo semi-transparente — toca para fechar */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Menu */}
      <Animated.View
        style={[
          styles.menu,
          { left: posX, top: posY },
          {
            opacity:   anim,
            transform: [
              { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) },
            ],
          },
        ]}
      >
        {/* Cabeçalho com info do arquivo */}
        {comic && (
          <View style={styles.menuHeader}>
            <View style={[styles.menuCoverDot, { backgroundColor: comic.coverBg ?? COLORS.surface }]} />
            <Text style={styles.menuTitle} numberOfLines={2}>{comic.title ?? comic.name}</Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Itens */}
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              index === MENU_ITEMS.length - 1 && styles.menuItemLast,
            ]}
            onPress={() => {
              onAction(item.id, comic);
              onClose();
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.menuItemIcon, { backgroundColor: item.color + '18' }]}>
              <Ionicons name={item.icon} size={17} color={item.color} />
            </View>
            <Text style={[styles.menuItemLabel, { color: item.color }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  menu: {
    position:        'absolute',
    width:           MENU_W,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius:    RADIUS.lg,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     COLORS.borderLight,
    elevation:       20,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 8 },
    shadowOpacity:   0.6,
    shadowRadius:    16,
  },

  menuHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    padding:       SPACING.md,
    gap:           SPACING.sm,
  },
  menuCoverDot: {
    width:        30,
    height:       30,
    borderRadius: RADIUS.xs,
    flexShrink:   0,
    borderWidth:  1,
    borderColor:  COLORS.border,
  },
  menuTitle: {
    flex:       1,
    fontSize:   FONTS.sm,
    fontWeight: '600',
    color:      COLORS.textPrimary,
    lineHeight: 17,
  },

  divider: {
    height:          1,
    backgroundColor: COLORS.border,
  },

  menuItem: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap:             SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemIcon: {
    width:          32,
    height:         32,
    borderRadius:   RADIUS.sm,
    alignItems:     'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    flex:       1,
    fontSize:   FONTS.sm,
    fontWeight: '500',
  },
});