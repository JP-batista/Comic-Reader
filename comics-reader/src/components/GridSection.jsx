// src/components/GridSection.jsx
// Grid responsivo reutilizável — aceita rowGap separado do gap entre colunas

import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function GridSection({ items, cols, gap, rowGap, renderItem }) {
  const rows = [];
  for (let i = 0; i < items.length; i += cols) {
    rows.push(items.slice(i, i + cols));
  }

  return (
    <View style={[styles.grid, { gap: rowGap ?? gap }]}>
      {rows.map((row, ri) => (
        <View key={ri} style={[styles.row, { gap }]}>
          {row.map((item) => renderItem(item))}
          {/* Preenche células vazias na última linha incompleta */}
          {row.length < cols &&
            Array.from({ length: cols - row.length }).map((_, ei) => (
              <View key={`fill-${ei}`} style={{ flex: 1 }} />
            ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {},
  row:  { flexDirection: 'row', alignItems: 'flex-start' },
});