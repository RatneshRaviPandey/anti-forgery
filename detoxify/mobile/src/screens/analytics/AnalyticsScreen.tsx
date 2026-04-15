import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchWeeklyTrend } from '../../store/slices/usageSlice';
import { Card } from '../../components/ui';
import { colors, typography, spacing } from '../../theme';
import { formatMinutes, percentChange } from '../../utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 160;

export function AnalyticsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { today, weeklyTrend } = useSelector((state: RootState) => state.usage);

  useEffect(() => {
    dispatch(fetchWeeklyTrend());
  }, [dispatch]);

  const data = weeklyTrend?.data || [];
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.backText} onPress={() => navigation.goBack()}>← Back</Text>
          <Text style={styles.pageTitle}>Analytics</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{formatMinutes(today?.totalMinutes || 0)}</Text>
            <Text style={styles.summaryLabel}>Today</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{formatMinutes(weeklyTrend?.averageMinutes || 0)}</Text>
            <Text style={styles.summaryLabel}>Daily Avg</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{formatMinutes(today?.savedMinutes || 0)}</Text>
            <Text style={styles.summaryLabel}>Saved</Text>
          </Card>
        </View>

        {/* Weekly Chart (Simple bar chart) */}
        <Card style={styles.chartCard} variant="elevated">
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.chart}>
            {data.map((d, i) => {
              const barHeight = maxMinutes > 0 ? (d.minutes / maxMinutes) * CHART_HEIGHT : 0;
              const dayLabel = new Date(d.date).toLocaleDateString('en', { weekday: 'short' }).slice(0, 2);
              return (
                <View key={i} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(barHeight, 4),
                          backgroundColor: d.minutes > (today?.goalMinutes || 120)
                            ? colors.warm[400]
                            : colors.primary[400],
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{dayLabel}</Text>
                  <Text style={styles.barValue}>{d.minutes}m</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Top Apps This Week */}
        <Card style={styles.appsCard}>
          <Text style={styles.sectionTitle}>Today's Breakdown</Text>
          {(today?.apps || []).map((app, index) => (
            <View key={app.packageName} style={styles.appRow}>
              <Text style={styles.appRank}>{index + 1}</Text>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>{app.appName}</Text>
                <View style={styles.appBarBg}>
                  <View style={[styles.appBarFill, { width: `${app.percentOfTotal}%` }]} />
                </View>
              </View>
              <Text style={styles.appTime}>{formatMinutes(app.durationMinutes)}</Text>
            </View>
          ))}
          {(!today?.apps || today.apps.length === 0) && (
            <Text style={styles.emptyText}>No usage data yet</Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing['4xl'] },
  header: { paddingHorizontal: spacing['2xl'], paddingTop: spacing.lg },
  backText: { ...typography.label, color: colors.primary[600], marginBottom: spacing.sm },
  pageTitle: { ...typography.h1, color: colors.neutral[900], marginBottom: spacing['2xl'] },
  summaryRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.md, marginBottom: spacing.lg },
  summaryCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
  summaryValue: { ...typography.h3, color: colors.primary[600] },
  summaryLabel: { ...typography.caption, color: colors.neutral[500], marginTop: spacing.xs },
  chartCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { ...typography.h4, color: colors.neutral[800], marginBottom: spacing.lg },
  chart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: CHART_HEIGHT + 40 },
  barContainer: { alignItems: 'center', flex: 1 },
  barWrapper: { height: CHART_HEIGHT, justifyContent: 'flex-end' },
  bar: { width: 24, borderRadius: 4 },
  barLabel: { ...typography.caption, color: colors.neutral[500], marginTop: spacing.xs },
  barValue: { ...typography.caption, color: colors.neutral[400], marginTop: 2 },
  appsCard: { marginHorizontal: spacing.lg },
  appRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  appRank: { ...typography.label, color: colors.neutral[400], width: 24 },
  appInfo: { flex: 1, marginHorizontal: spacing.md },
  appName: { ...typography.label, color: colors.neutral[700] },
  appBarBg: { height: 4, backgroundColor: colors.neutral[100], borderRadius: 2, marginTop: 4, overflow: 'hidden' },
  appBarFill: { height: '100%', backgroundColor: colors.primary[400], borderRadius: 2 },
  appTime: { ...typography.label, color: colors.neutral[600] },
  emptyText: { ...typography.body, color: colors.neutral[500], textAlign: 'center', paddingVertical: spacing.xl },
});
