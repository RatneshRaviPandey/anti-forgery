import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { setDailyGoal } from '../../store/slices/settingsSlice';
import { setUser } from '../../store/slices/authSlice';
import { Button } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';

const GOAL_OPTIONS = [
  { minutes: 60, label: '1 hour', desc: 'Ambitious goal', emoji: '🏆' },
  { minutes: 120, label: '2 hours', desc: 'Recommended', emoji: '🎯' },
  { minutes: 180, label: '3 hours', desc: 'Moderate', emoji: '👌' },
  { minutes: 240, label: '4 hours', desc: 'Easy start', emoji: '🌱' },
];

export function SetGoalScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedGoal, setSelectedGoal] = useState(120);

  const handleComplete = () => {
    dispatch(setDailyGoal(selectedGoal));
    // Mark onboarding complete — in real app, would call API
    // For now dispatch a local user update
    dispatch(setUser({ onboarded: true } as any));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Set your daily{'\n'}screen time goal</Text>
        <Text style={styles.subtitle}>Don't worry — you can change this anytime</Text>

        <View style={styles.options}>
          {GOAL_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.minutes}
              style={[
                styles.optionCard,
                selectedGoal === option.minutes && styles.optionSelected,
              ]}
              onPress={() => setSelectedGoal(option.minutes)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDesc}>{option.desc}</Text>
              </View>
              <View style={[
                styles.radio,
                selectedGoal === option.minutes && styles.radioSelected,
              ]}>
                {selectedGoal === option.minutes && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            title="Start My Journey"
            onPress={handleComplete}
            fullWidth
            size="lg"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light },
  content: { flex: 1, paddingHorizontal: spacing['2xl'] },
  title: { ...typography.h1, color: colors.neutral[900], paddingTop: spacing['3xl'] },
  subtitle: { ...typography.body, color: colors.neutral[500], marginTop: spacing.sm, marginBottom: spacing['3xl'] },
  options: { flex: 1 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface.light,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[100],
  },
  optionSelected: { borderColor: colors.primary[400], backgroundColor: colors.primary[50] },
  optionEmoji: { fontSize: 28, marginRight: spacing.lg },
  optionInfo: { flex: 1 },
  optionLabel: { ...typography.h4, color: colors.neutral[900] },
  optionDesc: { ...typography.bodySmall, color: colors.neutral[500], marginTop: 2 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.primary[500] },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary[500] },
  footer: { paddingVertical: spacing['3xl'] },
});
