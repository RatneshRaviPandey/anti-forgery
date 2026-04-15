import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchTodaySummary } from '../../store/slices/usageSlice';
import { fetchStreaks } from '../../store/slices/gamificationSlice';
import { Card, ProgressRing } from '../../components/ui';
import { colors, typography, spacing } from '../../theme';
import { formatMinutes, getGreeting, getMotivationalQuote } from '../../utils';

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { today, isLoading } = useSelector((state: RootState) => state.usage);
  const { streaks, level, xp, xpToNextLevel } = useSelector((state: RootState) => state.gamification);
  const { dailyGoalMinutes } = useSelector((state: RootState) => state.settings);

  const detoxStreak = streaks.find((s) => s.type === 'daily_detox');

  useEffect(() => {
    dispatch(fetchTodaySummary());
    dispatch(fetchStreaks());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchTodaySummary());
    dispatch(fetchStreaks());
  };

  const totalMinutes = today?.totalMinutes || 0;
  const goalMinutes = today?.goalMinutes || dailyGoalMinutes;
  const progress = goalMinutes > 0 ? Math.min(totalMinutes / goalMinutes, 1) : 0;
  const isUnderGoal = totalMinutes <= goalMinutes;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{user?.displayName || 'Friend'}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakCount}>{detoxStreak?.currentCount || 0}</Text>
          </View>
        </View>

        {/* Motivational Quote */}
        <Card style={styles.quoteCard}>
          <Text style={styles.quoteText}>{getMotivationalQuote()}</Text>
        </Card>

        {/* Daily Progress Ring */}
        <Card style={styles.progressCard} variant="elevated">
          <Text style={styles.sectionTitle}>Today's Screen Time</Text>
          <View style={styles.progressContainer}>
            <ProgressRing
              progress={progress}
              size={160}
              strokeWidth={14}
              color={isUnderGoal ? colors.secondary[500] : colors.warm[500]}
              label={formatMinutes(totalMinutes)}
              sublabel={`of ${formatMinutes(goalMinutes)} goal`}
            />
          </View>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {formatMinutes(Math.max(0, goalMinutes - totalMinutes))}
              </Text>
              <Text style={styles.statLabel}>
                {isUnderGoal ? 'Under goal' : 'Over goal'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{today?.apps?.length || 0}</Text>
              <Text style={styles.statLabel}>Apps tracked</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>Lv.{level}</Text>
              <Text style={styles.statLabel}>{xp} XP</Text>
            </View>
          </View>
        </Card>

        {/* Top Apps */}
        {today?.apps && today.apps.length > 0 && (
          <Card style={styles.appsCard}>
            <Text style={styles.sectionTitle}>Most Used Apps</Text>
            {today.apps.slice(0, 5).map((app, index) => (
              <View key={app.packageName} style={styles.appRow}>
                <View style={styles.appRank}>
                  <Text style={styles.appRankText}>{index + 1}</Text>
                </View>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{app.appName}</Text>
                  <View style={styles.appBar}>
                    <View
                      style={[
                        styles.appBarFill,
                        { width: `${app.percentOfTotal}%` },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.appTime}>{formatMinutes(app.durationMinutes)}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { marginLeft: spacing.lg, marginTop: spacing.lg }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.primary[50] }]}
            onPress={() => navigation.navigate('DetoxTab')}
          >
            <Text style={styles.actionEmoji}>⏱️</Text>
            <Text style={styles.actionTitle}>Start Detox</Text>
            <Text style={styles.actionDesc}>Focus timer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.secondary[50] }]}
            onPress={() => navigation.navigate('BreatheTab')}
          >
            <Text style={styles.actionEmoji}>🌬️</Text>
            <Text style={styles.actionTitle}>Breathe</Text>
            <Text style={styles.actionDesc}>Calm your mind</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.accent[50] }]}
            onPress={() => navigation.navigate('BreatheTab', { screen: 'MeditationList' })}
          >
            <Text style={styles.actionEmoji}>🧘</Text>
            <Text style={styles.actionTitle}>Meditate</Text>
            <Text style={styles.actionDesc}>Find peace</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing['4xl'] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: { ...typography.body, color: colors.neutral[500] },
  name: { ...typography.h2, color: colors.neutral[900] },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warm[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  streakEmoji: { fontSize: 18 },
  streakCount: { ...typography.h4, color: colors.warm[600], marginLeft: 4 },
  quoteCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.primary[50],
  },
  quoteText: { ...typography.body, color: colors.primary[700], fontStyle: 'italic', textAlign: 'center' },
  progressCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { ...typography.h4, color: colors.neutral[800], marginBottom: spacing.md },
  progressContainer: { alignItems: 'center', paddingVertical: spacing.xl },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: spacing.lg },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { ...typography.h4, color: colors.neutral[900] },
  statLabel: { ...typography.caption, color: colors.neutral[500], marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.neutral[200] },
  appsCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  appRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  appRankText: { ...typography.caption, color: colors.neutral[600], fontWeight: '600' },
  appInfo: { flex: 1, marginRight: spacing.md },
  appName: { ...typography.label, color: colors.neutral[800] },
  appBar: {
    height: 4,
    backgroundColor: colors.neutral[100],
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  appBarFill: { height: '100%', backgroundColor: colors.primary[400], borderRadius: 2 },
  appTime: { ...typography.label, color: colors.neutral[600] },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionEmoji: { fontSize: 28, marginBottom: spacing.sm },
  actionTitle: { ...typography.label, color: colors.neutral[800] },
  actionDesc: { ...typography.caption, color: colors.neutral[500], marginTop: 2 },
});
