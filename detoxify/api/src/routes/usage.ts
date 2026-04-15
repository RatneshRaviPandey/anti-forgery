import { Router, Response } from 'express';
import { z } from 'zod';
import { db, schema } from '../db';
import { eq, and, sql, desc } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const syncSchema = z.object({
  records: z.array(z.object({
    appName: z.string(),
    packageName: z.string(),
    durationSeconds: z.number().int().min(0),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })),
});

// POST /usage/sync — Sync usage data from device
router.post('/sync', async (req: AuthRequest, res: Response) => {
  try {
    const { records } = syncSchema.parse(req.body);

    if (records.length === 0) {
      res.json({ synced: 0 });
      return;
    }

    const values = records.map((r) => ({
      userId: req.userId!,
      appName: r.appName,
      packageName: r.packageName,
      durationSeconds: r.durationSeconds,
      date: r.date,
    }));

    await db.insert(schema.usageRecords).values(values);

    res.json({ synced: records.length });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    throw error;
  }
});

// GET /usage/summary?date=YYYY-MM-DD
router.get('/summary', async (req: AuthRequest, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

  const records = await db.select()
    .from(schema.usageRecords)
    .where(
      and(
        eq(schema.usageRecords.userId, req.userId!),
        eq(schema.usageRecords.date, date),
      ),
    );

  const totalSeconds = records.reduce((sum, r) => sum + r.durationSeconds, 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  // Get user's goal
  const [user] = await db.select({ dailyGoalMinutes: schema.users.dailyGoalMinutes })
    .from(schema.users)
    .where(eq(schema.users.id, req.userId!))
    .limit(1);

  const goalMinutes = user?.dailyGoalMinutes || 120;

  // Group by app
  const appMap = new Map<string, { appName: string; packageName: string; totalSeconds: number }>();
  for (const r of records) {
    const existing = appMap.get(r.packageName);
    if (existing) {
      existing.totalSeconds += r.durationSeconds;
    } else {
      appMap.set(r.packageName, { appName: r.appName, packageName: r.packageName, totalSeconds: r.durationSeconds });
    }
  }

  const apps = Array.from(appMap.values())
    .sort((a, b) => b.totalSeconds - a.totalSeconds)
    .map((a) => ({
      appName: a.appName,
      packageName: a.packageName,
      durationMinutes: Math.round(a.totalSeconds / 60),
      percentOfTotal: totalSeconds > 0 ? Math.round((a.totalSeconds / totalSeconds) * 100) : 0,
    }));

  res.json({
    date,
    totalMinutes,
    goalMinutes,
    apps,
    savedMinutes: Math.max(0, goalMinutes - totalMinutes),
  });
});

// GET /usage/trend?period=week|month
router.get('/trend', async (req: AuthRequest, res: Response) => {
  const period = (req.query.period as string) || 'week';
  const days = period === 'month' ? 30 : 7;

  const results = await db
    .select({
      date: schema.usageRecords.date,
      totalSeconds: sql<number>`SUM(${schema.usageRecords.durationSeconds})`,
    })
    .from(schema.usageRecords)
    .where(
      and(
        eq(schema.usageRecords.userId, req.userId!),
        sql`${schema.usageRecords.date} >= CURRENT_DATE - INTERVAL '${sql.raw(String(days))} days'`,
      ),
    )
    .groupBy(schema.usageRecords.date)
    .orderBy(schema.usageRecords.date);

  const data = results.map((r) => ({
    date: r.date,
    minutes: Math.round(Number(r.totalSeconds) / 60),
  }));

  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);
  const averageMinutes = data.length > 0 ? Math.round(totalMinutes / data.length) : 0;

  res.json({
    period,
    data,
    averageMinutes,
    changePercent: 0, // TODO: Calculate vs previous period
  });
});

export default router;
