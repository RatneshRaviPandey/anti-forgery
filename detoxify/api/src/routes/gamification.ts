import { Router, Response } from 'express';
import { db, schema } from '../db';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /gamification/streaks
router.get('/streaks', async (req: AuthRequest, res: Response) => {
  const streaks = await db.select()
    .from(schema.streaks)
    .where(eq(schema.streaks.userId, req.userId!));

  const [user] = await db.select({ xp: schema.users.xp })
    .from(schema.users)
    .where(eq(schema.users.id, req.userId!))
    .limit(1);

  res.json({ streaks, xp: user?.xp || 0 });
});

// GET /gamification/badges
router.get('/badges', async (req: AuthRequest, res: Response) => {
  const allBadges = await db.select().from(schema.badges).orderBy(schema.badges.sortOrder);

  const userBadgesList = await db.select()
    .from(schema.userBadges)
    .where(eq(schema.userBadges.userId, req.userId!));

  res.json({ allBadges, userBadges: userBadgesList });
});

// GET /gamification/leaderboard?period=week|month
router.get('/leaderboard', async (req: AuthRequest, res: Response) => {
  const period = (req.query.period as string) || 'week';

  // Get current period key
  const now = new Date();
  let periodKey: string;

  if (period === 'week') {
    const weekNum = getWeekNumber(now);
    periodKey = `week:${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  } else {
    periodKey = `month:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  const entries = await db.select({
    userId: schema.leaderboardEntries.userId,
    score: schema.leaderboardEntries.score,
    rank: schema.leaderboardEntries.rank,
    displayName: schema.users.displayName,
    avatarUrl: schema.users.avatarUrl,
  })
    .from(schema.leaderboardEntries)
    .innerJoin(schema.users, eq(schema.leaderboardEntries.userId, schema.users.id))
    .where(eq(schema.leaderboardEntries.period, periodKey))
    .orderBy(schema.leaderboardEntries.rank)
    .limit(50);

  res.json({ entries, period: periodKey });
});

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default router;
