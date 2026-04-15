import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchLeaderboard } from '../../store/slices/gamificationSlice';
import { Card } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';

export function CommunityHomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { leaderboard, streaks, level, xp } = useSelector((state: RootState) => state.gamification);
  const { user } = useSelector((state: RootState) => state.auth);
  const [period, setPeriod] = React.useState<'week' | 'month'>('week');

  useEffect(() => {
    dispatch(fetchLeaderboard(period));
  }, [dispatch, period]);

  const detoxStreak = streaks.find((s) => s.type === 'daily_detox');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Community</Text>
        <Text style={styles.pageSubtitle}>You're not alone on this journey</Text>

        {/* Social Proof */}
        <Card style={styles.socialProofCard} variant="elevated">
          <Text style={styles.socialEmoji}>🌍</Text>
          <Text style={styles.socialText}>Join thousands of people detoxing today</Text>
        </Card>

        {/* Your Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridValue}>🔥 {detoxStreak?.currentCount || 0}</Text>
              <Text style={styles.gridLabel}>Day Streak</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridValue}>⭐ Lv.{level}</Text>
              <Text style={styles.gridLabel}>{xp} XP</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridValue}>🏆 {detoxStreak?.longestCount || 0}</Text>
              <Text style={styles.gridLabel}>Best Streak</Text>
            </View>
          </View>
        </Card>

        {/* Invite Code */}
        <Card style={styles.inviteCard}>
          <Text style={styles.inviteTitle}>Invite Friends</Text>
          <Text style={styles.inviteCode}>{user?.inviteCode || '---'}</Text>
          <Text style={styles.inviteHint}>Share your code to connect with friends</Text>
        </Card>

        {/* Leaderboard */}
        <View style={styles.leaderboardHeader}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          <View style={styles.periodToggle}>
            <TouchableOpacity
              style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
              onPress={() => setPeriod('week')}
            >
              <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
              onPress={() => setPeriod('month')}
            >
              <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>
                Month
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {leaderboard.length > 0 ? (
          leaderboard.map((entry, index) => (
            <View key={entry.userId} style={styles.leaderboardRow}>
              <Text style={styles.rank}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </Text>
              <View style={styles.entryAvatar}>
                <Text style={styles.avatarText}>
                  {entry.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.entryInfo}>
                <Text style={styles.entryName}>{entry.displayName}</Text>
                <Text style={styles.entryStreak}>🔥 {entry.streakDays || 0} days</Text>
              </View>
              <Text style={styles.entryScore}>{entry.score} pts</Text>
            </View>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No leaderboard data yet</Text>
            <Text style={styles.emptySubtext}>Complete detox sessions to earn points!</Text>
          </Card>
        )}
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
  socialProofCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, alignItems: 'center', backgroundColor: colors.secondary[50] },
  socialEmoji: { fontSize: 32, marginBottom: spacing.sm },
  socialText: { ...typography.label, color: colors.secondary[700], textAlign: 'center' },
  statsCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { ...typography.h4, color: colors.neutral[800], marginBottom: spacing.md },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  gridItem: { alignItems: 'center' },
  gridValue: { ...typography.h4, color: colors.neutral[900] },
  gridLabel: { ...typography.caption, color: colors.neutral[500], marginTop: 2 },
  inviteCard: { marginHorizontal: spacing.lg, marginBottom: spacing['2xl'], alignItems: 'center' },
  inviteTitle: { ...typography.label, color: colors.neutral[700], marginBottom: spacing.sm },
  inviteCode: {
    ...typography.h2,
    color: colors.primary[600],
    letterSpacing: 4,
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  inviteHint: { ...typography.caption, color: colors.neutral[500], marginTop: spacing.sm },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.md,
  },
  periodToggle: { flexDirection: 'row', gap: spacing.xs },
  periodButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  periodButtonActive: { backgroundColor: colors.primary[100] },
  periodText: { ...typography.labelSmall, color: colors.neutral[500] },
  periodTextActive: { color: colors.primary[700] },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface.light,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  rank: { width: 30, fontSize: 16, textAlign: 'center' },
  entryAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    marginRight: spacing.md,
  },
  avatarText: { ...typography.label, color: colors.primary[600] },
  entryInfo: { flex: 1 },
  entryName: { ...typography.label, color: colors.neutral[800] },
  entryStreak: { ...typography.caption, color: colors.neutral[500] },
  entryScore: { ...typography.label, color: colors.primary[600] },
  emptyCard: { marginHorizontal: spacing.lg, alignItems: 'center', paddingVertical: spacing['3xl'] },
  emptyText: { ...typography.label, color: colors.neutral[500] },
  emptySubtext: { ...typography.bodySmall, color: colors.neutral[400], marginTop: spacing.xs },
});
