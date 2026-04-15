import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleTrackedApp } from '../../store/slices/settingsSlice';
import { Button } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { SOCIAL_MEDIA_APPS } from '../../utils';

export function SelectAppsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { trackedApps } = useSelector((state: RootState) => state.settings);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Which apps do you{'\n'}want to track?</Text>
        <Text style={styles.subtitle}>Select the apps you'd like to monitor</Text>

        <ScrollView style={styles.appList} showsVerticalScrollIndicator={false}>
          {SOCIAL_MEDIA_APPS.map((app) => {
            const isSelected = trackedApps.includes(app.packageName);
            return (
              <TouchableOpacity
                key={app.packageName}
                style={[styles.appRow, isSelected && styles.appRowSelected]}
                onPress={() => dispatch(toggleTrackedApp(app.packageName))}
                activeOpacity={0.7}
              >
                <View style={styles.appIcon}>
                  <Text style={styles.appIconText}>
                    {app.name.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.appName}>{app.name}</Text>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={`Continue (${trackedApps.length} selected)`}
            onPress={() => navigation.navigate('SetGoal')}
            fullWidth
            size="lg"
            disabled={trackedApps.length === 0}
          />
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('SetGoal')}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light },
  content: { flex: 1, paddingHorizontal: spacing['2xl'] },
  title: { ...typography.h1, color: colors.neutral[900], paddingTop: spacing['3xl'] },
  subtitle: { ...typography.body, color: colors.neutral[500], marginTop: spacing.sm, marginBottom: spacing['2xl'] },
  appList: { flex: 1 },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface.light,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.neutral[100],
  },
  appRowSelected: { borderColor: colors.primary[400], backgroundColor: colors.primary[50] },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  appIconText: { ...typography.h4, color: colors.neutral[600] },
  appName: { ...typography.label, color: colors.neutral[800], flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  checkmark: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  footer: { paddingVertical: spacing['2xl'] },
  skipButton: { alignSelf: 'center', marginTop: spacing.md, padding: spacing.sm },
  skipText: { ...typography.label, color: colors.neutral[500] },
});
