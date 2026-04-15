import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { startExercise, nextStep, stopExercise } from '../../store/slices/breatheSlice';
import { logBreathingSession } from '../../store/slices/breatheSlice';
import { addXp } from '../../store/slices/gamificationSlice';
import { Button } from '../../components/ui';
import { colors, typography, spacing } from '../../theme';
import { XP_REWARDS } from '../../utils';

export function BreathingSessionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();

  const exerciseId = route.params?.exerciseId;
  const { exercises, activeExercise, currentStep, currentPhase, isActive } = useSelector(
    (state: RootState) => state.breathe,
  );

  const exercise = exercises.find((e) => e.id === exerciseId);
  const [sessionState, setSessionState] = useState<'ready' | 'active' | 'completed'>('ready');
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [targetCycles] = useState(6); // Default 6 cycles

  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
      dispatch(stopExercise());
    };
  }, [cleanup, dispatch]);

  // Animate breathing circle based on current phase
  useEffect(() => {
    if (!isActive || !activeExercise) return;

    const step = activeExercise.steps[currentStep];
    if (!step) return;

    let toValue: number;
    switch (step.phase) {
      case 'inhale':
        toValue = 1;
        break;
      case 'exhale':
        toValue = 0.5;
        break;
      case 'hold':
      default:
        toValue = scaleAnim._value || 0.75;
        break;
    }

    Animated.timing(scaleAnim, {
      toValue,
      duration: step.durationSeconds * 1000,
      useNativeDriver: true,
    }).start();

    // Schedule next step
    stepTimerRef.current = setTimeout(() => {
      const nextIdx = currentStep + 1;
      if (nextIdx >= activeExercise.steps.length) {
        // Completed one cycle
        setCyclesCompleted((prev) => {
          const newCount = prev + 1;
          if (newCount >= targetCycles) {
            handleComplete(newCount);
            return newCount;
          }
          return newCount;
        });
      }
      dispatch(nextStep());
    }, step.durationSeconds * 1000);

    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    };
  }, [isActive, currentStep, activeExercise]);

  const handleStart = () => {
    if (!exercise) return;
    setSessionState('active');
    setCyclesCompleted(0);
    setTotalDuration(0);
    dispatch(startExercise(exercise));

    // Track duration
    durationTimerRef.current = setInterval(() => {
      setTotalDuration((prev) => prev + 1);
    }, 1000);
  };

  const handleComplete = (cycles?: number) => {
    cleanup();
    setSessionState('completed');
    dispatch(stopExercise());

    const finalCycles = cycles || cyclesCompleted;
    if (exerciseId) {
      dispatch(logBreathingSession({
        exerciseId,
        durationSeconds: totalDuration,
        cycles: finalCycles,
      }));
    }
    dispatch(addXp(XP_REWARDS.breathing_session_complete));
  };

  const handleStop = () => {
    handleComplete();
  };

  const getPhaseLabel = (): string => {
    switch (currentPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      default: return '';
    }
  };

  const getPhaseColor = (): string => {
    switch (currentPhase) {
      case 'inhale': return colors.primary[400];
      case 'hold': return colors.accent[400];
      case 'exhale': return colors.secondary[400];
      default: return colors.primary[400];
    }
  };

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Exercise not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.cycleCounter}>
            {sessionState === 'active'
              ? `Cycle ${cyclesCompleted + 1} of ${targetCycles}`
              : exercise.description}
          </Text>
        </View>

        {/* Breathing Circle */}
        <View style={styles.circleContainer}>
          {sessionState === 'completed' ? (
            <>
              <Text style={styles.completedEmoji}>✨</Text>
              <Text style={styles.completedTitle}>Well Done!</Text>
              <Text style={styles.completedStats}>
                {cyclesCompleted} cycles • {Math.round(totalDuration / 60)} min
              </Text>
              <Text style={styles.xpText}>+{XP_REWARDS.breathing_session_complete} XP</Text>
            </>
          ) : (
            <>
              <Animated.View
                style={[
                  styles.breathCircle,
                  {
                    backgroundColor: getPhaseColor(),
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              />
              {sessionState === 'active' && (
                <Text style={styles.phaseLabel}>{getPhaseLabel()}</Text>
              )}
              {sessionState === 'ready' && (
                <Text style={styles.readyText}>Tap Start to begin</Text>
              )}
            </>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {sessionState === 'ready' && (
            <>
              <Button title="Start" onPress={handleStart} fullWidth size="lg" />
              <Button
                title="Back"
                onPress={() => navigation.goBack()}
                variant="ghost"
                fullWidth
                style={{ marginTop: spacing.md }}
              />
            </>
          )}
          {sessionState === 'active' && (
            <Button title="Stop" onPress={handleStop} variant="outline" fullWidth size="lg" />
          )}
          {sessionState === 'completed' && (
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
  header: { alignItems: 'center', paddingTop: spacing['3xl'] },
  exerciseName: { ...typography.h2, color: colors.neutral[0] },
  cycleCounter: { ...typography.body, color: colors.neutral[400], marginTop: spacing.sm, textAlign: 'center' },
  circleContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  breathCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.6,
  },
  phaseLabel: {
    ...typography.h2,
    color: colors.neutral[0],
    position: 'absolute',
  },
  readyText: { ...typography.bodyLarge, color: colors.neutral[500] },
  completedEmoji: { fontSize: 56, marginBottom: spacing.lg },
  completedTitle: { ...typography.h1, color: colors.neutral[0], marginBottom: spacing.md },
  completedStats: { ...typography.bodyLarge, color: colors.neutral[400] },
  xpText: { ...typography.h4, color: colors.secondary[400], marginTop: spacing.lg },
  controls: { paddingBottom: spacing['4xl'] },
  errorText: { ...typography.bodyLarge, color: colors.error, textAlign: 'center', paddingTop: spacing['5xl'] },
});
