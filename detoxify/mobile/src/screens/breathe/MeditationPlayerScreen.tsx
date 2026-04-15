import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setIsPlaying, setCurrentSession, logMeditationProgress } from '../../store/slices/meditationSlice';
import { addXp } from '../../store/slices/gamificationSlice';
import { Button } from '../../components/ui';
import { colors, typography, spacing } from '../../theme';
import { formatSeconds, XP_REWARDS } from '../../utils';

export function MeditationPlayerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const sessionId = route.params?.sessionId;

  const { sessions, isPlaying } = useSelector((state: RootState) => state.meditation);
  const session = sessions.find((s) => s.id === sessionId);

  const [elapsed, setElapsed] = useState(0);
  const [playerState, setPlayerState] = useState<'ready' | 'playing' | 'paused' | 'completed'>('ready');

  // In a real app, this would use react-native-track-player
  // For now, simulating with a basic timer
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (playerState === 'playing') {
      interval = setInterval(() => {
        setElapsed((prev) => {
          if (session && prev >= session.durationSeconds) {
            setPlayerState('completed');
            dispatch(logMeditationProgress({
              sessionId: session.id,
              durationListened: session.durationSeconds,
              completed: true,
            }));
            dispatch(addXp(XP_REWARDS.meditation_session_complete));
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [playerState, session]);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Session not found</Text>
      </SafeAreaView>
    );
  }

  const progress = session.durationSeconds > 0 ? elapsed / session.durationSeconds : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Session Info */}
        <View style={styles.infoContainer}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageEmoji}>
              {session.category === 'sleep' ? '🌙' :
               session.category === 'focus' ? '🎯' :
               session.category === 'anxiety' ? '🌿' :
               session.category === 'stress' ? '🧘' :
               session.category === 'morning' ? '☀️' : '📵'}
            </Text>
          </View>
          <Text style={styles.sessionTitle}>{session.title}</Text>
          <Text style={styles.sessionCategory}>{session.category.replace('_', ' ')}</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatSeconds(elapsed)}</Text>
            <Text style={styles.timeText}>{formatSeconds(session.durationSeconds)}</Text>
          </View>
        </View>

        {/* Completed State */}
        {playerState === 'completed' && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedEmoji}>✨</Text>
            <Text style={styles.completedText}>Session Complete</Text>
            <Text style={styles.xpText}>+{XP_REWARDS.meditation_session_complete} XP</Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {playerState === 'ready' && (
            <Button
              title="▶ Play"
              onPress={() => setPlayerState('playing')}
              fullWidth
              size="lg"
            />
          )}
          {playerState === 'playing' && (
            <Button
              title="⏸ Pause"
              onPress={() => setPlayerState('paused')}
              variant="outline"
              fullWidth
              size="lg"
            />
          )}
          {playerState === 'paused' && (
            <Button
              title="▶ Resume"
              onPress={() => setPlayerState('playing')}
              fullWidth
              size="lg"
            />
          )}
          {playerState === 'completed' && (
            <Button
              title="Done"
              onPress={() => navigation.goBack()}
              fullWidth
              size="lg"
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[900] },
  content: { flex: 1, paddingHorizontal: spacing['2xl'] },
  closeButton: { alignSelf: 'flex-end', padding: spacing.lg },
  closeText: { fontSize: 24, color: colors.neutral[400] },
  infoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imagePlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 24,
    backgroundColor: colors.neutral[800],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  imageEmoji: { fontSize: 64 },
  sessionTitle: { ...typography.h2, color: colors.neutral[0], textAlign: 'center' },
  sessionCategory: { ...typography.label, color: colors.neutral[400], textTransform: 'capitalize', marginTop: spacing.sm },
  progressSection: { paddingVertical: spacing.xl },
  progressBar: { height: 4, backgroundColor: colors.neutral[700], borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary[400], borderRadius: 2 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  timeText: { ...typography.caption, color: colors.neutral[500] },
  completedContainer: { alignItems: 'center', paddingVertical: spacing.xl },
  completedEmoji: { fontSize: 40 },
  completedText: { ...typography.h3, color: colors.neutral[0], marginTop: spacing.md },
  xpText: { ...typography.label, color: colors.secondary[400], marginTop: spacing.sm },
  controls: { paddingBottom: spacing['4xl'] },
  errorText: { ...typography.bodyLarge, color: colors.error, textAlign: 'center', paddingTop: spacing['5xl'] },
});
