import React from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, typography, spacing } from '../../theme';

interface StreakCounterProps {
  count: number;
  type?: 'detox' | 'meditation' | 'breathing';
  size?: 'sm' | 'md' | 'lg';
}

export function StreakCounter({ count, type = 'detox', size = 'md' }: StreakCounterProps) {
  const emoji = type === 'detox' ? '🔥' : type === 'meditation' ? '🧘' : '🌬️';

  const sizes = {
    sm: { emoji: 16, text: typography.labelSmall, container: { paddingHorizontal: spacing.sm, paddingVertical: 2 } },
    md: { emoji: 20, text: typography.h4, container: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs } },
    lg: { emoji: 28, text: typography.h2, container: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm } },
  };

  const s = sizes[size];

  return (
    <View style={[styles.container, s.container]}>
      <Text style={{ fontSize: s.emoji }}>{emoji}</Text>
      <Text style={[s.text, styles.count]}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warm[50],
    borderRadius: 20,
    gap: 4,
  },
  count: {
    color: colors.warm[700],
    fontWeight: '700',
  },
});
