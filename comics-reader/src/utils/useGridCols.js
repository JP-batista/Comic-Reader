// src/utils/useGridCols.js
// Hook responsivo: calcula colunas baseado na largura da tela
// Mobile pequeno (<380px):  4 colunas
// Mobile normal (380-600):  4 colunas
// Tablet pequeno (600-900): 6 colunas
// Tablet grande (>900):     8 colunas

import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { SPACING } from '../constants/theme';

const H_PAD = SPACING.lg; // 16px de cada lado
const GAP   = SPACING.sm; // 8px entre cards

export function useGridCols() {
  const { width } = useWindowDimensions();

  const cols = useMemo(() => {
    if (width >= 900) return 8;
    if (width >= 600) return 6;
    return 4;
  }, [width]);

  const cardWidth = useMemo(() => {
    return (width - H_PAD * 2 - GAP * (cols - 1)) / cols;
  }, [width, cols]);

  return { cols, cardWidth, hPad: H_PAD, gap: GAP, screenWidth: width };
}