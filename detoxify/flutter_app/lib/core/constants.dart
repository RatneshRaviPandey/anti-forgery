typedef SubscriptionTier = String;
const tierFree = 'free';
const tierPro = 'pro';
const tierPremium = 'premium';

const Map<String, Map<String, dynamic>> tierFeatures = {
  tierFree: {
    'maxBlockRules': 3,
    'analyticsHistoryDays': 7,
    'breathingExerciseIds': ['box_breathing', 'calm_breathing'],
    'meditationSessions': 3,
    'maxActiveChallenges': 1,
    'hasAds': true,
  },
  tierPro: {
    'maxBlockRules': -1,
    'analyticsHistoryDays': -1,
    'breathingExerciseIds': 'all',
    'meditationSessions': 20,
    'maxActiveChallenges': -1,
    'hasAds': false,
  },
  tierPremium: {
    'maxBlockRules': -1,
    'analyticsHistoryDays': -1,
    'breathingExerciseIds': 'all',
    'meditationSessions': -1,
    'maxActiveChallenges': -1,
    'hasAds': false,
  },
};

// ─── Breathing Exercises ───
class BreathingStep {
  final String phase; // inhale, hold, exhale
  final int durationSeconds;
  const BreathingStep(this.phase, this.durationSeconds);
}

class BreathingExerciseData {
  final String id, name, description, category;
  final List<BreathingStep> steps;
  final String tierRequired;
  final int colorValue;

  const BreathingExerciseData({
    required this.id, required this.name, required this.description,
    required this.category, required this.steps, required this.tierRequired,
    required this.colorValue,
  });

  int get cycleDuration => steps.fold(0, (s, e) => s + e.durationSeconds);
}

const breathingExercises = [
  BreathingExerciseData(
    id: 'box_breathing', name: 'Box Breathing',
    description: 'Equal inhale, hold, exhale, hold — calms the nervous system',
    category: 'calm', tierRequired: tierFree, colorValue: 0xFF3B82F6,
    steps: [BreathingStep('inhale', 4), BreathingStep('hold', 4), BreathingStep('exhale', 4), BreathingStep('hold', 4)],
  ),
  BreathingExerciseData(
    id: 'four_seven_eight', name: '4-7-8 Relaxation',
    description: 'Deep relaxation technique — perfect before sleep',
    category: 'sleep', tierRequired: tierPro, colorValue: 0xFF8B5CF6,
    steps: [BreathingStep('inhale', 4), BreathingStep('hold', 7), BreathingStep('exhale', 8)],
  ),
  BreathingExerciseData(
    id: 'calm_breathing', name: 'Calm Breathing',
    description: 'Simple slow breathing — reduces stress in minutes',
    category: 'calm', tierRequired: tierFree, colorValue: 0xFF10B981,
    steps: [BreathingStep('inhale', 4), BreathingStep('exhale', 6)],
  ),
  BreathingExerciseData(
    id: 'energizing', name: 'Energizing Breath',
    description: 'Quick cycles to boost energy and alertness',
    category: 'energy', tierRequired: tierPro, colorValue: 0xFFF97316,
    steps: [BreathingStep('inhale', 2), BreathingStep('exhale', 2)],
  ),
  BreathingExerciseData(
    id: 'deep_belly', name: 'Deep Belly Breathing',
    description: 'Slow diaphragmatic breathing for deep relaxation',
    category: 'relax', tierRequired: tierPro, colorValue: 0xFF059669,
    steps: [BreathingStep('inhale', 6), BreathingStep('hold', 2), BreathingStep('exhale', 7)],
  ),
];

const xpRewards = {
  'detox_session': 25,
  'breathing_session': 15,
  'meditation_session': 20,
  'challenge_day': 30,
  'challenge_complete': 100,
};

const socialMediaApps = [
  {'name': 'Instagram', 'package': 'com.instagram.android'},
  {'name': 'Facebook', 'package': 'com.facebook.katana'},
  {'name': 'Twitter / X', 'package': 'com.twitter.android'},
  {'name': 'TikTok', 'package': 'com.zhiliaoapp.musically'},
  {'name': 'Snapchat', 'package': 'com.snapchat.android'},
  {'name': 'YouTube', 'package': 'com.google.android.youtube'},
  {'name': 'Reddit', 'package': 'com.reddit.frontpage'},
  {'name': 'Pinterest', 'package': 'com.pinterest'},
  {'name': 'LinkedIn', 'package': 'com.linkedin.android'},
  {'name': 'WhatsApp', 'package': 'com.whatsapp'},
  {'name': 'Telegram', 'package': 'org.telegram.messenger'},
  {'name': 'Discord', 'package': 'com.discord'},
];
