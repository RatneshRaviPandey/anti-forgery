export type SubscriptionTier = 'free' | 'pro' | 'premium';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  tier: SubscriptionTier;
  dailyGoalMinutes: number;
  timezone: string;
  onboarded: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  platform: 'ios' | 'android';
  productId: string;
  startedAt: string;
  expiresAt: string;
  isActive: boolean;
}
