import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { startSession, endSession } from '../../store/slices/detoxSlice';
import { addXp } from '../../store/slices/gamificationSlice';
import { Button } from '../../components/ui';
import { colors, typography, spacing } from '../../theme';
import { formatSeconds, getMotivationalQuote, XP_REWARDS } from '../../utils';

type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export function DetoxTimerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();

  const targetMinutes = route.params?.targetMinutes || 30;
  const totalSeconds = targetMinutes * 60;

  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [quote, setQuote] = useState(getMotivationalQuote());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            setTimerState('completed');
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [timerState, clearTimer]);

  // Rotate quotes every 30 seconds
  useEffect(() => {
    if (timerState !== 'running') return;
    const quoteInterval = setInterval(() => {
      setQuote(getMotivationalQuote());
    }, 30000);
    return () => clearInterval(quoteInterval);
  }, [timerState]);

  const handleStart = async () => {
    setTimerState('running');
    try {
      const result = await dispatch(startSession({ targetMinutes, blockedApps: [] })).unwrap();
      setSessionId(result.id);
    } catch {
      // Continue with local timer even if API fails
    }
  };

  const handlePause = () => {
    setTimerState('paused');
  };

  const handleResume = () => {
    setTimerState('running');
  };

  const handleComplete = async () => {
    const elapsed = Math.round((totalSeconds - secondsRemaining) / 60);
    if (sessionId) {
      dispatch(endSession({ sessionId, actualMinutes: elapsed }));
    }
    dispatch(addXp(XP_REWARDS.detox_session_complete));
  };

  const handleCancel = () => {
    clearTimer();
    setTimerState('idle');
    setSecondsRemaining(totalSeconds);
    navigation.goBack();
  };

  const progress = 1 - secondsRemaining / totalSeconds;
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        {timerState === 'idle' && (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )}

        {/* Timer Display */}
        <View style={styles.timerContainer}>
          {timerState === 'completed' ? (
            <>
              <Text style={styles.celebrationEmoji}>🎉</Text>
              <Text style={styles.completedTitle}>Session Complete!</Text>
              <Text style={styles.completedSubtitle}>
                You stayed focused for {targetMinutes} minutes
              </Text>
              <Text style={styles.xpText}>+{XP_REWARDS.detox_session_complete} XP earned</Text>
            </>
          ) : (
            <>
              <Text style={styles.timerLabel}>
                {timerState === 'idle'
                  ? 'Ready to focus?'
                  : timerState === 'paused'
                  ? 'Paused'
                  : 'Stay focused...'}
              </Text>
              <Text style={styles.timerText}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </Text>
              <Text style={styles.targetText}>{targetMinutes} minute session</Text>

              {/* Progress bar */}
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
            </>
          )}
        </View>

        {/* Quote */}
        {timerState === 'running' && (
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>"{quote}"</Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {timerState === 'idle' && (
            <Button title="Start Session" onPress={handleStart} fullWidth size="lg" />
          )}
          {timerState === 'running' && (
            <>
              <Button title="Pause" onPress={handlePause} variant="outline" fullWidth size="lg" />
              <Button
                title="End Early"
                onPress={handleCancel}
                variant="ghost"
                fullWidth
                style={{ marginTop: spacing.md }}
              />
            </>
          )}
          {timerState === 'paused' && (
            <>
              <Button title="Resume" onPress={handleResume} fullWidth size="lg" />
              <Button
                title="End Session"
                onPress={handleCancel}
                variant="ghost"
                fullWidth
                style={{ marginTop: spacing.md }}
              />
            </>
          )}
          {timerState === 'completed' && (
            <Button title="Done" onPress={() => navigation.goBack()} fullWidth size="lg" />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[900] },
  content: { flex: 1, paddingHorizontal: spacing['2xl'] },
  backButton: { paddingVertical: spacing.md },
  backText: { ...typography.label, color: colors.neutral[400] },
  timerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  timerLabel: { ...typography.bodyLarge, color: colors.neutral[400], marginBottom: spacing.lg },
  timerText: {
    fontSize: 72,
    fontWeight: '200',
    color: colors.neutral[0],
    fontVariant: ['tabular-nums'],
  },
  targetText: { ...typography.body, color: colors.neutral[500], marginTop: spacing.md },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.neutral[700],
    borderRadius: 2,
    marginTop: spacing['2xl'],
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary[400], borderRadius: 2 },
  celebrationEmoji: { fontSize: 64, marginBottom: spacing.lg },
  completedTitle: { ...typography.h1, color: colors.neutral[0], marginBottom: spacing.sm },
  completedSubtitle: { ...typography.bodyLarge, color: colors.neutral[400], textAlign: 'center' },
  xpText: { ...typography.h4, color: colors.secondary[400], marginTop: spacing.lg },
  quoteContainer: { paddingVertical: spacing.xl },
  quoteText: { ...typography.body, color: colors.neutral[400], fontStyle: 'italic', textAlign: 'center' },
  controls: { paddingBottom: spacing['4xl'] },
});
