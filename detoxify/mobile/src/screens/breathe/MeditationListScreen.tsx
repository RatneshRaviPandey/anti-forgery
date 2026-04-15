import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchMeditations } from '../../store/slices/meditationSlice';
import { Card } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { formatMinutes } from '../../utils';

const CATEGORIES = [
  { key: 'all', label: 'All', emoji: '🎵' },
  { key: 'sleep', label: 'Sleep', emoji: '😴' },
  { key: 'focus', label: 'Focus', emoji: '🎯' },
  { key: 'anxiety', label: 'Anxiety', emoji: '🌿' },
  { key: 'stress', label: 'Stress', emoji: '🧘' },
  { key: 'morning', label: 'Morning', emoji: '🌅' },
  { key: 'digital_detox', label: 'Detox', emoji: '📵' },
];

export function MeditationListScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { sessions, isLoading } = useSelector((state: RootState) => state.meditation);
  const { user } = useSelector((state: RootState) => state.auth);
  const tier = user?.tier || 'free';

  const [selectedCategory, setSelectedCategory] = React.useState('all');

  useEffect(() => {
    dispatch(fetchMeditations(selectedCategory === 'all' ? undefined : selectedCategory));
  }, [dispatch, selectedCategory]);

  const renderSession = ({ item }: { item: typeof sessions[0] }) => {
    const isLocked = item.tierRequired !== 'free' && item.tierRequired !== tier;

    return (
      <TouchableOpacity
        style={styles.sessionCard}
        onPress={() => {
          if (isLocked) {
            navigation.navigate('Paywall');
          } else {
            navigation.navigate('MeditationPlayer', { sessionId: item.id });
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.sessionThumbnail}>
          <Text style={styles.sessionEmoji}>
            {item.category === 'sleep' ? '🌙' :
             item.category === 'focus' ? '🎯' :
             item.category === 'anxiety' ? '🌿' :
             item.category === 'stress' ? '🧘' :
             item.category === 'morning' ? '☀️' : '📵'}
          </Text>
        </View>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>{item.title}</Text>
          <Text style={styles.sessionDesc} numberOfLines={1}>{item.description}</Text>
          <Text style={styles.sessionDuration}>
            {formatMinutes(Math.round(item.durationSeconds / 60))}
          </Text>
        </View>
        {isLocked && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockText}>
              {item.tierRequired === 'premium' ? 'PREMIUM' : 'PRO'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Meditation</Text>
      </View>

      {/* Category Chips */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, selectedCategory === item.key && styles.chipActive]}
            onPress={() => setSelectedCategory(item.key)}
          >
            <Text style={styles.chipEmoji}>{item.emoji}</Text>
            <Text style={[styles.chipText, selectedCategory === item.key && styles.chipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Session List */}
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading...' : 'No meditation sessions available'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light },
  header: { paddingHorizontal: spacing['2xl'], paddingTop: spacing.lg, paddingBottom: spacing.md },
  backText: { ...typography.label, color: colors.primary[600], marginBottom: spacing.sm },
  pageTitle: { ...typography.h1, color: colors.neutral[900] },
  chipContainer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary[100] },
  chipEmoji: { fontSize: 14, marginRight: 4 },
  chipText: { ...typography.labelSmall, color: colors.neutral[600] },
  chipTextActive: { color: colors.primary[700] },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing['4xl'] },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.light,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  sessionThumbnail: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.accent[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sessionEmoji: { fontSize: 24 },
  sessionInfo: { flex: 1 },
  sessionTitle: { ...typography.label, color: colors.neutral[900] },
  sessionDesc: { ...typography.bodySmall, color: colors.neutral[500], marginTop: 2 },
  sessionDuration: { ...typography.caption, color: colors.neutral[400], marginTop: 4 },
  lockBadge: {
    backgroundColor: colors.accent[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  lockText: { ...typography.caption, color: colors.accent[700], fontWeight: '700', fontSize: 9 },
  emptyContainer: { paddingVertical: spacing['5xl'], alignItems: 'center' },
  emptyText: { ...typography.body, color: colors.neutral[500] },
});
