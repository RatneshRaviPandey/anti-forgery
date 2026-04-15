import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { Card, Button } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { formatMinutes } from '../../utils';

const QUICK_TIMERS = [
  { label: '15 min', minutes: 15, emoji: '⚡' },
  { label: '30 min', minutes: 30, emoji: '🎯' },
  { label: '1 hour', minutes: 60, emoji: '💪' },
  { label: '2 hours', minutes: 120, emoji: '🏆' },
];

export function DetoxHomeScreen() {
  const navigation = useNavigation<any>();
  const { activeSession, sessionHistory, challenges } = useSelector((state: RootState) => state.detox);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Detox</Text>
        <Text style={styles.pageSubtitle}>Take a break from the noise</Text>

        {/* Active Session Banner */}
        {activeSession && (
          <Card style={styles.activeCard} variant="elevated">
            <Text style={styles.activeLabel}>Session Active</Text>
            <Text style={styles.activeTime}>
              {formatMinutes(activeSession.targetMinutes - activeSession.actualMinutes)} remaining
            </Text>
            <Button
              title="View Session"
              onPress={() => navigation.navigate('DetoxTimer')}
              variant="outline"
              size="sm"
              style={{ marginTop: spacing.md }}
            />
          </Card>
        )}

        {/* Quick Start */}
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.timerGrid}>
          {QUICK_TIMERS.map((timer) => (
            <TouchableOpacity
              key={timer.minutes}
              style={styles.timerCard}
              onPress={() => navigation.navigate('DetoxTimer', { targetMinutes: timer.minutes })}
            >
              <Text style={styles.timerEmoji}>{timer.emoji}</Text>
              <Text style={styles.timerLabel}>{timer.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Timer */}
        <Button
          title="Custom Timer"
          onPress={() => navigation.navigate('DetoxTimer')}
          variant="outline"
          fullWidth
          style={{ marginHorizontal: spacing.lg, marginBottom: spacing['2xl'] }}
        />

        {/* Active Challenges */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Challenges</Text>
        {challenges.length > 0 ? (
          challenges.slice(0, 3).map((challenge) => (
            <Card key={challenge.id} style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
                  <Text style={styles.difficultyText}>{challenge.difficulty}</Text>
                </View>
                <Text style={styles.challengeDuration}>{challenge.durationDays} days</Text>
              </View>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <Text style={styles.challengeDesc}>{challenge.description}</Text>
              <Text style={styles.challengeParticipants}>
                {challenge.participantCount} people joined
              </Text>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No challenges available yet</Text>
            <Text style={styles.emptySubtext}>Check back soon for new challenges!</Text>
          </Card>
        )}

        {/* Recent Sessions */}
        {sessionHistory.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Recent Sessions</Text>
            {sessionHistory.slice(0, 5).map((session) => (
              <Card key={session.id} style={styles.historyCard} variant="outlined">
                <View style={styles.historyRow}>
                  <Text style={styles.historyEmoji}>
                    {session.completed ? '✅' : '⏸️'}
                  </Text>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyTitle}>
                      {formatMinutes(session.actualMinutes)} / {formatMinutes(session.targetMinutes)}
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(session.startedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return colors.secondary[100];
    case 'medium': return colors.warm[100];
    case 'hard': return '#FEE2E2';
    default: return colors.neutral[100];
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing['4xl'] },
  pageTitle: { ...typography.h1, color: colors.neutral[900], paddingHorizontal: spacing['2xl'], paddingTop: spacing.lg },
  pageSubtitle: { ...typography.body, color: colors.neutral[500], paddingHorizontal: spacing['2xl'], marginBottom: spacing['2xl'] },
  activeCard: { marginHorizontal: spacing.lg, marginBottom: spacing['2xl'], backgroundColor: colors.primary[50] },
  activeLabel: { ...typography.labelSmall, color: colors.primary[600], textTransform: 'uppercase' },
  activeTime: { ...typography.h3, color: colors.primary[700], marginTop: spacing.xs },
  sectionTitle: { ...typography.h4, color: colors.neutral[800], paddingHorizontal: spacing['2xl'], marginBottom: spacing.md },
  timerGrid: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.md, marginBottom: spacing.lg },
  timerCard: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  timerEmoji: { fontSize: 28, marginBottom: spacing.sm },
  timerLabel: { ...typography.label, color: colors.neutral[700] },
  challengeCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  challengeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  difficultyBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  difficultyText: { ...typography.caption, fontWeight: '600', textTransform: 'capitalize' },
  challengeDuration: { ...typography.caption, color: colors.neutral[500] },
  challengeTitle: { ...typography.h4, color: colors.neutral[900], marginBottom: spacing.xs },
  challengeDesc: { ...typography.body, color: colors.neutral[600], marginBottom: spacing.sm },
  challengeParticipants: { ...typography.caption, color: colors.neutral[500] },
  emptyCard: { marginHorizontal: spacing.lg, alignItems: 'center', paddingVertical: spacing['3xl'] },
  emptyText: { ...typography.label, color: colors.neutral[500] },
  emptySubtext: { ...typography.bodySmall, color: colors.neutral[400], marginTop: spacing.xs },
  historyCard: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  historyRow: { flexDirection: 'row', alignItems: 'center' },
  historyEmoji: { fontSize: 20, marginRight: spacing.md },
  historyInfo: { flex: 1 },
  historyTitle: { ...typography.label, color: colors.neutral[800] },
  historyDate: { ...typography.caption, color: colors.neutral[500] },
});
