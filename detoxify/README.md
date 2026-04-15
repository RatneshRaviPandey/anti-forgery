# Detoxify — Social Media Detox & Mindfulness App

A 3-tier (Free/Pro/Premium) React Native mobile application helping users reduce social media usage through screen time tracking, guided breathing exercises, meditation sessions, gamification, and community challenges.

## Architecture

- **Mobile**: React Native 0.77+ (bare workflow, TypeScript)
- **Backend**: Express.js + TypeScript + PostgreSQL (Drizzle ORM)
- **Auth**: JWT with refresh token rotation
- **State Management**: Redux Toolkit + RTK Query
- **Ads**: Google AdMob (Free tier)
- **IAP**: RevenueCat (subscription management)

## Project Structure

```
detoxify/
├── mobile/           # React Native app (iOS + Android)
│   └── src/
│       ├── app/          # Navigation & root component
│       ├── screens/      # All screen components
│       ├── components/   # Reusable UI & feature components
│       ├── store/        # Redux Toolkit slices
│       ├── services/     # API client, auth, ads, audio
│       ├── hooks/        # Custom React hooks
│       ├── theme/        # Colors, typography, spacing
│       ├── types/        # TypeScript type definitions
│       └── utils/        # Constants, formatters, helpers
├── api/              # Backend Express.js API
│   └── src/
│       ├── config/       # Environment & database config
│       ├── db/           # Drizzle schema & migrations
│       ├── routes/       # API route handlers
│       └── middleware/   # Auth, rate limiting, error handling
└── docker-compose.yml  # PostgreSQL + Redis for local dev
```

## Getting Started

### Prerequisites
- Node.js v18+
- Docker & Docker Compose
- Android Studio (for Android) / Xcode (for iOS)
- React Native CLI: `npm install -g @react-native-community/cli`

### Setup

```bash
# 1. Start database
cd detoxify
npm run db:up

# 2. Install dependencies
npm run install-all

# 3. Set up environment
cp api/.env.example api/.env

# 4. Run database migrations
npm run db:migrate

# 5. Start the API server
npm run api:dev

# 6. Start Metro bundler (separate terminal)
npm run mobile:start

# 7. Run on device/emulator (separate terminal)
npm run mobile:android  # or mobile:ios
```

## 3-Tier Subscription Model

| Feature | Free | Pro ($6.99/mo) | Premium ($14.99/mo) |
|---------|------|--------|---------|
| Screen time tracking | ✅ | ✅ | ✅ |
| Analytics history | 7 days | Unlimited | Unlimited |
| Breathing exercises | 2 | All 5 | All 5 + Custom |
| Meditation sessions | 3 | 20 | 100+ |
| Active challenges | 1 | Unlimited | Unlimited |
| Ads | Banner + Interstitial | None | None |
| Advanced analytics | ❌ | ✅ | ✅ |
| PDF reports | ❌ | ❌ | ✅ |
| Family plan | ❌ | ❌ | ✅ (5 accounts) |
| Devices | 1 | 2 | Unlimited |

## Key Screens

1. **Home Dashboard** — Daily usage ring, top apps, streak counter, quick actions
2. **Detox Timer** — Focus countdown with motivational quotes, dark theme
3. **Breathing Exercises** — Animated circle (expand/contract), 5 patterns, haptics
4. **Meditation Player** — Audio playback, category browsing, progress tracking
5. **Community** — Leaderboard, friend invites, social proof
6. **Analytics** — Weekly bar chart, per-app breakdown, trends
7. **Profile** — Settings, XP/level, badges, subscription management
8. **Onboarding** — Welcome, app selection, goal setting
9. **Paywall** — 3-tier comparison with feature details

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Sign in |
| POST | /api/auth/refresh | Refresh tokens |
| GET | /api/auth/profile | Get user profile |
| POST | /api/usage/sync | Sync usage data from device |
| GET | /api/usage/summary | Daily usage summary |
| GET | /api/usage/trend | Weekly/monthly trend |
| POST | /api/detox/sessions | Start detox session |
| PATCH | /api/detox/sessions/:id | End detox session |
| GET | /api/detox/challenges | List challenges |
| POST | /api/detox/challenges/:id/join | Join challenge |
| GET | /api/breathing/exercises | List exercises |
| POST | /api/breathing/sessions | Log breathing session |
| GET | /api/meditation/sessions | List meditations |
| POST | /api/meditation/progress | Log meditation progress |
| GET | /api/gamification/streaks | User streaks & XP |
| GET | /api/gamification/badges | All & earned badges |
| GET | /api/gamification/leaderboard | Weekly/monthly leaderboard |
| GET | /api/community/feed | Social proof & feed |
| POST | /api/community/friends | Add friend by invite code |

## Database Schema

15 tables: users, subscriptions, usage_records, detox_sessions, detox_challenges, user_challenges, breathing_exercises, breathing_sessions, meditation_sessions, meditation_progress, streaks, badges, user_badges, leaderboard_entries, friendships, notification_preferences, refresh_tokens

## Future Roadmap

- [ ] Native screen time modules (Android UsageStatsManager, iOS FamilyControls)
- [ ] Push notifications (FCM + APNs)
- [ ] RevenueCat IAP integration
- [ ] Actual meditation audio content (CDN)
- [ ] Background sync (WorkManager / BGTaskScheduler)
- [ ] Offline SQLite caching
- [ ] CI/CD with Fastlane + GitHub Actions
- [ ] App Store / Google Play submission
