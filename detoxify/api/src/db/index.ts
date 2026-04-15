import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import * as schema from './schema';
import path from 'path';

// Use PGlite (embedded PostgreSQL) — no external DB server needed
const dataDir = process.env.PGLITE_DATA_DIR || path.join(__dirname, '../../.pglite-data');
const client = new PGlite(dataDir);
export const db = drizzlePglite(client, { schema });
export { schema };

// Initialize tables on startup
export async function initDatabase() {
  // Create enums
  await client.exec(`
    DO $$ BEGIN
      CREATE TYPE tier AS ENUM ('free', 'pro', 'premium');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
    DO $$ BEGIN
      CREATE TYPE platform AS ENUM ('ios', 'android');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
    DO $$ BEGIN
      CREATE TYPE session_type AS ENUM ('timer', 'block', 'challenge');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
    DO $$ BEGIN
      CREATE TYPE session_status AS ENUM ('active', 'paused', 'completed', 'cancelled');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
    DO $$ BEGIN
      CREATE TYPE difficulty AS ENUM ('easy', 'medium', 'hard');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
    DO $$ BEGIN
      CREATE TYPE streak_type AS ENUM ('daily_detox', 'meditation', 'breathing');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
    DO $$ BEGIN
      CREATE TYPE meditation_category AS ENUM ('sleep', 'focus', 'anxiety', 'stress', 'morning', 'digital_detox');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);

  // Create tables
  await client.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      avatar_url TEXT,
      tier tier NOT NULL DEFAULT 'free',
      daily_goal_minutes INTEGER NOT NULL DEFAULT 120,
      timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
      onboarded BOOLEAN NOT NULL DEFAULT false,
      xp INTEGER NOT NULL DEFAULT 0,
      invite_code VARCHAR(8) UNIQUE,
      push_token TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tier tier NOT NULL,
      platform platform NOT NULL,
      product_id VARCHAR(100) NOT NULL,
      purchase_token TEXT,
      started_at TIMESTAMP NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMP NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS usage_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      app_name VARCHAR(100) NOT NULL,
      package_name VARCHAR(200) NOT NULL,
      duration_seconds INTEGER NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS detox_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type session_type NOT NULL,
      status session_status NOT NULL DEFAULT 'active',
      started_at TIMESTAMP NOT NULL DEFAULT NOW(),
      ended_at TIMESTAMP,
      target_minutes INTEGER NOT NULL,
      actual_minutes INTEGER NOT NULL DEFAULT 0,
      blocked_apps JSONB DEFAULT '[]',
      completed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS detox_challenges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      difficulty difficulty NOT NULL DEFAULT 'medium',
      category VARCHAR(50) NOT NULL,
      participant_count INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true,
      image_url TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_challenges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      challenge_id UUID NOT NULL REFERENCES detox_challenges(id) ON DELETE CASCADE,
      started_at TIMESTAMP NOT NULL DEFAULT NOW(),
      current_day INTEGER NOT NULL DEFAULT 1,
      progress JSONB DEFAULT '[]',
      completed BOOLEAN NOT NULL DEFAULT false,
      completed_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS breathing_exercises (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      steps JSONB NOT NULL,
      total_duration_seconds INTEGER NOT NULL,
      tier_required tier NOT NULL DEFAULT 'free',
      icon_name VARCHAR(50) NOT NULL,
      color VARCHAR(7) NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS breathing_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      exercise_id UUID NOT NULL REFERENCES breathing_exercises(id),
      duration_seconds INTEGER NOT NULL,
      cycles_completed INTEGER NOT NULL,
      completed_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS meditation_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      category meditation_category NOT NULL,
      audio_url TEXT NOT NULL,
      thumbnail_url TEXT,
      duration_seconds INTEGER NOT NULL,
      tier_required tier NOT NULL DEFAULT 'free',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS meditation_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      session_id UUID NOT NULL REFERENCES meditation_sessions(id),
      duration_listened INTEGER NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT false,
      completed_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS streaks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type streak_type NOT NULL,
      current_count INTEGER NOT NULL DEFAULT 0,
      longest_count INTEGER NOT NULL DEFAULT 0,
      last_activity_date DATE
    );

    CREATE TABLE IF NOT EXISTS badges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      icon_name VARCHAR(50) NOT NULL,
      category VARCHAR(50) NOT NULL,
      criteria JSONB NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_badges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      badge_id UUID NOT NULL REFERENCES badges(id),
      earned_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS leaderboard_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      period VARCHAR(20) NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      rank INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notification_preferences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      daily_reminder BOOLEAN NOT NULL DEFAULT true,
      daily_reminder_time VARCHAR(5) NOT NULL DEFAULT '09:00',
      streak_reminder BOOLEAN NOT NULL DEFAULT true,
      challenge_updates BOOLEAN NOT NULL DEFAULT true,
      weekly_report BOOLEAN NOT NULL DEFAULT true
    );

    CREATE TABLE IF NOT EXISTS friendships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(500) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  console.log('[Database] PGlite initialized with all tables');
}
