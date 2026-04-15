import { SubscriptionTier } from '../types';

export const API_BASE_URL = __DEV__
  ? 'http://localhost:4000/api'
  : 'https://api.detoxify.app/api';

export const TIER_FEATURES = {
  free: {
    maxBlockRules: 3,
    analyticsHistoryDays: 7,
    breathingExercises: ['box_breathing', 'calm_breathing'],
    meditationSessions: 3,
    maxActiveChallenges: 1,
    hasAds: true,
    hasAdvancedAnalytics: false,
    hasCustomPatterns: false,
    hasPDFExport: false,
    hasFamilyPlan: false,
    maxDevices: 1,
  },
  pro: {
    maxBlockRules: -1, // unlimited
    analyticsHistoryDays: -1, // unlimited
    breathingExercises: 'all' as const,
    meditationSessions: 20,
    maxActiveChallenges: -1,
    hasAds: false,
    hasAdvancedAnalytics: true,
    hasCustomPatterns: false,
    hasPDFExport: false,
    hasFamilyPlan: false,
    maxDevices: 2,
  },
  premium: {
    maxBlockRules: -1,
    analyticsHistoryDays: -1,
    breathingExercises: 'all' as const,
    meditationSessions: -1, // unlimited
    maxActiveChallenges: -1,
    hasAds: false,
    hasAdvancedAnalytics: true,
    hasCustomPatterns: true,
    hasPDFExport: true,
    hasFamilyPlan: true,
    maxDevices: -1,
  },
} as const;

export const SUBSCRIPTION_PRODUCTS = {
  pro_monthly: {
    id: 'detoxify_pro_monthly',
    tier: 'pro' as SubscriptionTier,
    price: '$6.99',
    period: 'month',
  },
  pro_yearly: {
    id: 'detoxify_pro_yearly',
    tier: 'pro' as SubscriptionTier,
    price: '$49.99',
    period: 'year',
  },
  premium_monthly: {
    id: 'detoxify_premium_monthly',
    tier: 'premium' as SubscriptionTier,
    price: '$14.99',
    period: 'month',
  },
  premium_yearly: {
    id: 'detoxify_premium_yearly',
    tier: 'premium' as SubscriptionTier,
    price: '$99.99',
    period: 'year',
  },
};

export const BREATHING_EXERCISES = {
  box_breathing: {
    id: 'box_breathing',
    name: 'Box Breathing',
    description: 'Equal inhale, hold, exhale, hold — calms the nervous system',
    category: 'calm',
    steps: [
      { phase: 'inhale' as const, durationSeconds: 4 },
      { phase: 'hold' as const, durationSeconds: 4 },
      { phase: 'exhale' as const, durationSeconds: 4 },
      { phase: 'hold' as const, durationSeconds: 4 },
    ],
    totalDurationSeconds: 16,
    tierRequired: 'free' as const,
    iconName: 'square-outline',
    color: '#3B82F6',
  },
  four_seven_eight: {
    id: 'four_seven_eight',
    name: '4-7-8 Relaxation',
    description: 'Deep relaxation technique — perfect before sleep',
    category: 'sleep',
    steps: [
      { phase: 'inhale' as const, durationSeconds: 4 },
      { phase: 'hold' as const, durationSeconds: 7 },
      { phase: 'exhale' as const, durationSeconds: 8 },
    ],
    totalDurationSeconds: 19,
    tierRequired: 'pro' as const,
    iconName: 'moon-outline',
    color: '#8B5CF6',
  },
  calm_breathing: {
    id: 'calm_breathing',
    name: 'Calm Breathing',
    description: 'Simple slow breathing — reduces stress in minutes',
    category: 'calm',
    steps: [
      { phase: 'inhale' as const, durationSeconds: 4 },
      { phase: 'exhale' as const, durationSeconds: 6 },
    ],
    totalDurationSeconds: 10,
    tierRequired: 'free' as const,
    iconName: 'water-outline',
    color: '#10B981',
  },
  energizing: {
    id: 'energizing',
    name: 'Energizing Breath',
    description: 'Quick cycles to boost energy and alertness',
    category: 'energy',
    steps: [
      { phase: 'inhale' as const, durationSeconds: 2 },
      { phase: 'exhale' as const, durationSeconds: 2 },
    ],
    totalDurationSeconds: 4,
    tierRequired: 'pro' as const,
    iconName: 'flash-outline',
    color: '#F97316',
  },
  deep_belly: {
    id: 'deep_belly',
    name: 'Deep Belly Breathing',
    description: 'Slow diaphragmatic breathing for deep relaxation',
    category: 'relax',
    steps: [
      { phase: 'inhale' as const, durationSeconds: 6 },
      { phase: 'hold' as const, durationSeconds: 2 },
      { phase: 'exhale' as const, durationSeconds: 7 },
    ],
    totalDurationSeconds: 15,
    tierRequired: 'pro' as const,
    iconName: 'leaf-outline',
    color: '#059669',
  },
};

export const XP_PER_LEVEL = 100;
export const XP_LEVEL_MULTIPLIER = 1.2;

export const XP_REWARDS = {
  detox_session_complete: 25,
  breathing_session_complete: 15,
  meditation_session_complete: 20,
  challenge_day_complete: 30,
  challenge_complete: 100,
  streak_milestone_7: 50,
  streak_milestone_30: 200,
  streak_milestone_100: 500,
};

export const SOCIAL_MEDIA_APPS = [
  { name: 'Instagram', packageName: 'com.instagram.android', icon: 'logo-instagram' },
  { name: 'Facebook', packageName: 'com.facebook.katana', icon: 'logo-facebook' },
  { name: 'Twitter / X', packageName: 'com.twitter.android', icon: 'logo-twitter' },
  { name: 'TikTok', packageName: 'com.zhiliaoapp.musically', icon: 'musical-notes' },
  { name: 'Snapchat', packageName: 'com.snapchat.android', icon: 'camera' },
  { name: 'YouTube', packageName: 'com.google.android.youtube', icon: 'logo-youtube' },
  { name: 'Reddit', packageName: 'com.reddit.frontpage', icon: 'logo-reddit' },
  { name: 'Pinterest', packageName: 'com.pinterest', icon: 'logo-pinterest' },
  { name: 'LinkedIn', packageName: 'com.linkedin.android', icon: 'logo-linkedin' },
  { name: 'WhatsApp', packageName: 'com.whatsapp', icon: 'logo-whatsapp' },
  { name: 'Telegram', packageName: 'org.telegram.messenger', icon: 'paper-plane' },
  { name: 'Discord', packageName: 'com.discord', icon: 'logo-discord' },
];
