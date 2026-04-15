export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  Paywall: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  SelectApps: undefined;
  SetGoal: undefined;
  Permissions: undefined;
  FirstExercise: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  DetoxTab: undefined;
  BreatheTab: undefined;
  CommunityTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  UsageDetail: { date: string };
  AppDetail: { packageName: string };
};

export type DetoxStackParamList = {
  DetoxHome: undefined;
  DetoxTimer: { targetMinutes?: number };
  BlockConfig: undefined;
  ChallengeDetail: { challengeId: string };
};

export type BreatheStackParamList = {
  BreatheHome: undefined;
  BreathingSession: { exerciseId: string };
  MeditationList: { category?: string };
  MeditationPlayer: { sessionId: string };
};

export type CommunityStackParamList = {
  CommunityHome: undefined;
  Leaderboard: undefined;
  ChallengeList: undefined;
  ChallengeDetail: { challengeId: string };
  FriendsList: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
  NotificationSettings: undefined;
  SubscriptionManagement: undefined;
  Analytics: undefined;
  About: undefined;
};
