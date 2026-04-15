import { pgTable, uuid, varchar, text, integer, boolean, timestamp, date, jsonb, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const tierEnum = pgEnum('tier', ['free', 'pro', 'premium']);
export const platformEnum = pgEnum('platform', ['ios', 'android']);
export const sessionTypeEnum = pgEnum('session_type', ['timer', 'block', 'challenge']);
export const sessionStatusEnum = pgEnum('session_status', ['active', 'paused', 'completed', 'cancelled']);
export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);
export const streakTypeEnum = pgEnum('streak_type', ['daily_detox', 'meditation', 'breathing']);
export const meditationCategoryEnum = pgEnum('meditation_category', [
  'sleep', 'focus', 'anxiety', 'stress', 'morning', 'digital_detox',
]);

// Users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  avatarUrl: text('avatar_url'),
  tier: tierEnum('tier').default('free').notNull(),
  dailyGoalMinutes: integer('daily_goal_minutes').default(120).notNull(),
  timezone: varchar('timezone', { length: 50 }).default('UTC').notNull(),
  onboarded: boolean('onboarded').default(false).notNull(),
  xp: integer('xp').default(0).notNull(),
  inviteCode: varchar('invite_code', { length: 8 }).unique(),
  pushToken: text('push_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Subscriptions
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tier: tierEnum('tier').notNull(),
  platform: platformEnum('platform').notNull(),
  productId: varchar('product_id', { length: 100 }).notNull(),
  purchaseToken: text('purchase_token'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Usage Records
export const usageRecords = pgTable('usage_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  appName: varchar('app_name', { length: 100 }).notNull(),
  packageName: varchar('package_name', { length: 200 }).notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  date: date('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Detox Sessions
export const detoxSessions = pgTable('detox_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: sessionTypeEnum('type').notNull(),
  status: sessionStatusEnum('status').default('active').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  targetMinutes: integer('target_minutes').notNull(),
  actualMinutes: integer('actual_minutes').default(0).notNull(),
  blockedApps: jsonb('blocked_apps').$type<string[]>().default([]),
  completed: boolean('completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Detox Challenges
export const detoxChallenges = pgTable('detox_challenges', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  durationDays: integer('duration_days').notNull(),
  difficulty: difficultyEnum('difficulty').default('medium').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  participantCount: integer('participant_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User Challenges (join table)
export const userChallenges = pgTable('user_challenges', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  challengeId: uuid('challenge_id').notNull().references(() => detoxChallenges.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  currentDay: integer('current_day').default(1).notNull(),
  progress: jsonb('progress').$type<{ day: number; completed: boolean }[]>().default([]),
  completed: boolean('completed').default(false).notNull(),
  completedAt: timestamp('completed_at'),
});

// Breathing Exercises
export const breathingExercises = pgTable('breathing_exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  steps: jsonb('steps').$type<{ phase: string; durationSeconds: number }[]>().notNull(),
  totalDurationSeconds: integer('total_duration_seconds').notNull(),
  tierRequired: tierEnum('tier_required').default('free').notNull(),
  iconName: varchar('icon_name', { length: 50 }).notNull(),
  color: varchar('color', { length: 7 }).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
});

// Breathing Sessions (user history)
export const breathingSessions = pgTable('breathing_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  exerciseId: uuid('exercise_id').notNull().references(() => breathingExercises.id),
  durationSeconds: integer('duration_seconds').notNull(),
  cyclesCompleted: integer('cycles_completed').notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});

// Meditation Sessions (content)
export const meditationSessions = pgTable('meditation_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  category: meditationCategoryEnum('category').notNull(),
  audioUrl: text('audio_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  durationSeconds: integer('duration_seconds').notNull(),
  tierRequired: tierEnum('tier_required').default('free').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Meditation Progress (user history)
export const meditationProgress = pgTable('meditation_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id').notNull().references(() => meditationSessions.id),
  durationListened: integer('duration_listened').notNull(),
  completed: boolean('completed').default(false).notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});

// Streaks
export const streaks = pgTable('streaks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: streakTypeEnum('type').notNull(),
  currentCount: integer('current_count').default(0).notNull(),
  longestCount: integer('longest_count').default(0).notNull(),
  lastActivityDate: date('last_activity_date'),
});

// Badges
export const badges = pgTable('badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  iconName: varchar('icon_name', { length: 50 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  criteria: jsonb('criteria').$type<{ type: string; target: number; streakType?: string }>().notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
});

// User Badges
export const userBadges = pgTable('user_badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  badgeId: uuid('badge_id').notNull().references(() => badges.id),
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
});

// Leaderboard (materialized/cached)
export const leaderboardEntries = pgTable('leaderboard_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  period: varchar('period', { length: 20 }).notNull(), // 'week:2026-W15', 'month:2026-04'
  score: integer('score').default(0).notNull(),
  rank: integer('rank').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notification Preferences
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  dailyReminder: boolean('daily_reminder').default(true).notNull(),
  dailyReminderTime: varchar('daily_reminder_time', { length: 5 }).default('09:00').notNull(),
  streakReminder: boolean('streak_reminder').default(true).notNull(),
  challengeUpdates: boolean('challenge_updates').default(true).notNull(),
  weeklyReport: boolean('weekly_report').default(true).notNull(),
});

// Friendships
export const friendships = pgTable('friendships', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  friendId: uuid('friend_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Refresh Tokens
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
