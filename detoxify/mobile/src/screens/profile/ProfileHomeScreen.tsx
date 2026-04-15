import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { Card } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { setDarkMode, setHapticFeedback, setSoundEnabled, setNotificationsEnabled } from '../../store/slices/settingsSlice';

export function ProfileHomeScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const settings = useSelector((state: RootState) => state.settings);
  const { level, xp, xpToNextLevel, userBadges } = useSelector((state: RootState) => state.gamification);

  const xpProgress = xpToNextLevel > 0 ? (xp % xpToNextLevel) / xpToNextLevel : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>{user?.tier?.toUpperCase() || 'FREE'}</Text>
          </View>
        </View>

        {/* Level & XP */}
        <Card style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLevel}>Level {level}</Text>
            <Text style={styles.xpCount}>{xp} XP</Text>
          </View>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${xpProgress * 100}%` }]} />
          </View>
          <Text style={styles.xpNext}>{xpToNextLevel - (xp % xpToNextLevel)} XP to next level</Text>
        </Card>

        {/* Badges */}
        <Card style={styles.badgesCard}>
          <Text style={styles.sectionTitle}>Badges ({userBadges.length})</Text>
          {userBadges.length > 0 ? (
            <View style={styles.badgesGrid}>
              {userBadges.slice(0, 6).map((ub) => (
                <View key={ub.id} style={styles.badgeItem}>
                  <Text style={styles.badgeIcon}>🏅</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noBadges}>Complete challenges to earn badges!</Text>
          )}
        </Card>

        {/* Settings */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: spacing['2xl'], marginTop: spacing.lg }]}>
          Settings
        </Text>

        <Card style={styles.settingsCard}>
          <SettingRow
            label="Notifications"
            value={settings.notificationsEnabled}
            onToggle={(v) => dispatch(setNotificationsEnabled(v))}
          />
          <SettingRow
            label="Haptic Feedback"
            value={settings.hapticFeedback}
            onToggle={(v) => dispatch(setHapticFeedback(v))}
          />
          <SettingRow
            label="Sound Effects"
            value={settings.soundEnabled}
            onToggle={(v) => dispatch(setSoundEnabled(v))}
          />
        </Card>

        {/* Quick Links */}
        <Card style={styles.linksCard}>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Analytics')}>
            <Text style={styles.linkText}>📊 Analytics & Reports</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          {user?.tier === 'free' && (
            <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Paywall')}>
              <Text style={styles.linkText}>⭐ Upgrade to Pro</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => dispatch(logout())}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: (v: boolean) => void }) {
  return (
    <View style={settingStyles.row}>
      <Text style={settingStyles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.neutral[200], true: colors.primary[400] }}
        thumbColor={colors.neutral[0]}
      />
    </View>
  );
}

const settingStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  label: { ...typography.body, color: colors.neutral[700] },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing['4xl'] },
  header: { alignItems: 'center', paddingTop: spacing['3xl'], paddingBottom: spacing['2xl'] },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: colors.primary[600] },
  name: { ...typography.h2, color: colors.neutral[900] },
  email: { ...typography.body, color: colors.neutral[500], marginTop: spacing.xs },
  tierBadge: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
  },
  tierText: { ...typography.labelSmall, color: colors.primary[700], letterSpacing: 1 },
  xpCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  xpLevel: { ...typography.h4, color: colors.neutral[900] },
  xpCount: { ...typography.label, color: colors.primary[600] },
  xpBar: { height: 8, backgroundColor: colors.neutral[100], borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: colors.primary[500], borderRadius: 4 },
  xpNext: { ...typography.caption, color: colors.neutral[500], marginTop: spacing.sm },
  badgesCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { ...typography.h4, color: colors.neutral[800], marginBottom: spacing.md },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  badgeItem: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.warm[50], alignItems: 'center', justifyContent: 'center' },
  badgeIcon: { fontSize: 24 },
  noBadges: { ...typography.body, color: colors.neutral[500], textAlign: 'center' },
  settingsCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  linksCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  linkText: { ...typography.body, color: colors.neutral[700] },
  chevron: { fontSize: 20, color: colors.neutral[400] },
  logoutButton: { alignSelf: 'center', paddingVertical: spacing.lg, marginTop: spacing.lg },
  logoutText: { ...typography.label, color: colors.error },
});
