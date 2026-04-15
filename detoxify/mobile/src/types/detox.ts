export type DetoxSessionType = 'timer' | 'block' | 'challenge';
export type DetoxSessionStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface DetoxSession {
  id: string;
  type: DetoxSessionType;
  status: DetoxSessionStatus;
  startedAt: string;
  endedAt: string | null;
  targetMinutes: number;
  actualMinutes: number;
  blockedApps: string[];
  completed: boolean;
}

export interface DetoxChallenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  participantCount: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface UserChallenge {
  id: string;
  challengeId: string;
  challenge: DetoxChallenge;
  startedAt: string;
  currentDay: number;
  progress: { day: number; completed: boolean }[];
  completed: boolean;
}

export interface BlockRule {
  id: string;
  appName: string;
  packageName: string;
  enabled: boolean;
  schedule: BlockSchedule | null; // null = always when detox active
}

export interface BlockSchedule {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  daysOfWeek: number[]; // 0=Sun, 6=Sat
}

export interface DetoxState {
  activeSession: DetoxSession | null;
  sessionHistory: DetoxSession[];
  blockRules: BlockRule[];
  challenges: DetoxChallenge[];
  userChallenges: UserChallenge[];
  isLoading: boolean;
  error: string | null;
}
