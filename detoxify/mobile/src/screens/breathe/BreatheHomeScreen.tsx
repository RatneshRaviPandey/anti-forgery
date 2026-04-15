import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { canAccessFeature } from '../../utils';

export function BreatheHomeScreen() {
  const navigation = useNavigation<any>();
  const { exercises, history } = useSelector((state: RootState) => state.breathe);
  const { user } = useSelector((state: RootState) => state.auth);
  const tier = user?.tier || 'free';

  const totalSessions = history.length;
  const totalMinutes = Math.round(history.reduce((sum, s) => sum + s.durationSeconds, 0) / 60);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Breathe</Text>
        <Text style={styles.pageSubtitle}>Find your calm</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{totalMinutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </Card>
        </View>

        {/* Breathing Exercises */}
        <Text style={styles.sectionTitle}>Breathing Exercises</Text>
        {exercises.map((exercise) => {
          const isLocked = exercise.tierRequired !== 'free' && exercise.tierRequired !== tier;
          return (
            <TouchableOpacity
              key={exercise.id}
              style={styles.exerciseCard}
              onPress={() => {
                if (isLocked) {
                  navigation.navigate('Paywall');
                } else {
                  navigation.navigate('BreathingSession', { exerciseId: exercise.id });
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.exerciseIcon, { backgroundColor: exercise.color + '20' }]}>
                <Text style={styles.exerciseEmoji}>
                  {exercise.id === 'box_breathing' ? '⬜' :
                   exercise.id === 'four_seven_eight' ? '🌙' :
                   exercise.id === 'calm_breathing' ? '🌊' :
                   exercise.id === 'energizing' ? '⚡' : '🍃'}
                </Text>
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDesc} numberOfLines={1}>
                  {exercise.description}
                </Text>
                <Text style={styles.exerciseDuration}>
                  {exercise.steps.map((s) => `${s.durationSeconds}s`).join(' - ')}
                </Text>
              </View>
              {isLocked && (
                <View style={styles.lockBadge}>
                  <Text style={styles.lockText}>PRO</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Meditation Section */}
        <Text style={[styles.sectionTitle, { marginTop: spacing['2xl'] }]}>Meditation</Text>
        <TouchableOpacity
          style={styles.meditationBanner}
          onPress={() => navigation.navigate('MeditationList')}
        >
          <View style={styles.meditationBannerContent}>
            <Text style={styles.meditationEmoji}>🧘‍♀️</Text>
            <View style={styles.meditationBannerText}>
              <Text style={styles.meditationTitle}>Guided Meditation</Text>
              <Text style={styles.meditationSubtitle}>
                Sleep, focus, anxiety relief & more
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing['4xl'] },
  pageTitle: { ...typography.h1, color: colors.neutral[900], paddingHorizontal: spacing['2xl'], paddingTop: spacing.lg },
  pageSubtitle: { ...typography.body, color: colors.neutral[500], paddingHorizontal: spacing['2xl'], marginBottom: spacing['2xl'] },
  statsRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.md, marginBottom: spacing['2xl'] },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
  statValue: { ...typography.h2, color: colors.primary[600] },
  statLabel: { ...typography.caption, color: colors.neutral[500], marginTop: spacing.xs },
  sectionTitle: { ...typography.h4, color: colors.neutral[800], paddingHorizontal: spacing['2xl'], marginBottom: spacing.md },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface.light,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  exerciseIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  exerciseEmoji: { fontSize: 22 },
  exerciseInfo: { flex: 1 },
  exerciseName: { ...typography.label, color: colors.neutral[900] },
  exerciseDesc: { ...typography.bodySmall, color: colors.neutral[500], marginTop: 2 },
  exerciseDuration: { ...typography.caption, color: colors.neutral[400], marginTop: 4 },
  lockBadge: { backgroundColor: colors.accent[100], paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  lockText: { ...typography.caption, color: colors.accent[700], fontWeight: '700' },
  meditationBanner: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.accent[50],
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  meditationBannerContent: { flexDirection: 'row', alignItems: 'center', padding: spacing.xl },
  meditationEmoji: { fontSize: 36, marginRight: spacing.lg },
  meditationBannerText: { flex: 1 },
  meditationTitle: { ...typography.h4, color: colors.accent[900] },
  meditationSubtitle: { ...typography.bodySmall, color: colors.accent[600], marginTop: 2 },
  chevron: { fontSize: 28, color: colors.accent[400] },
});
