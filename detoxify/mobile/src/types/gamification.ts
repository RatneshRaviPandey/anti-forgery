export type StreakType = 'daily_detox' | 'meditation' | 'breathing';

export interface Streak {
  id: string;
  type: StreakType;
  currentCount: number;
  longestCount: number;
  lastActivityDate: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: string;
  criteria: BadgeCriteria;
}

export interface BadgeCriteria {
  type: 'streak' | 'sessions' | 'minutes' | 'challenge';
  target: number;
  streakType?: StreakType;
}

export interface UserBadge {
  id: string;
  badgeId: string;
  badge: Badge;
  earnedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  score: number;
  rank: number;
  streakDays: number;
}

export interface GamificationState {
  streaks: Streak[];
  badges: Badge[];
  userBadges: UserBadge[];
  xp: number;
  level: number;
  xpToNextLevel: number;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
}
