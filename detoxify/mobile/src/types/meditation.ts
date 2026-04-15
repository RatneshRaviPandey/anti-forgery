export type BreathingPhase = 'inhale' | 'hold' | 'exhale';

export interface BreathingStep {
  phase: BreathingPhase;
  durationSeconds: number;
}

export interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: BreathingStep[];
  totalDurationSeconds: number;
  tierRequired: 'free' | 'pro' | 'premium';
  iconName: string;
  color: string;
}

export interface BreathingSession {
  id: string;
  exerciseId: string;
  completedAt: string;
  durationSeconds: number;
  cyclesCompleted: number;
}

export type MeditationCategory =
  | 'sleep'
  | 'focus'
  | 'anxiety'
  | 'stress'
  | 'morning'
  | 'digital_detox';

export interface MeditationSession {
  id: string;
  title: string;
  description: string;
  category: MeditationCategory;
  audioUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  tierRequired: 'free' | 'pro' | 'premium';
  isFavorite: boolean;
}

export interface MeditationProgress {
  id: string;
  sessionId: string;
  completedAt: string;
  durationListened: number;
  completed: boolean;
}

export interface MeditationState {
  categories: MeditationCategory[];
  sessions: MeditationSession[];
  currentSession: MeditationSession | null;
  progress: MeditationProgress[];
  favorites: string[]; // session IDs
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface BreathingState {
  exercises: BreathingExercise[];
  activeExercise: BreathingExercise | null;
  currentPhase: BreathingPhase | null;
  currentStep: number;
  isActive: boolean;
  history: BreathingSession[];
  isLoading: boolean;
  error: string | null;
}
