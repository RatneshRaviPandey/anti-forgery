import { Router, Response } from 'express';
import { z } from 'zod';
import { db, schema } from '../db';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /breathing/exercises — Get all breathing exercises
router.get('/exercises', async (req: AuthRequest, res: Response) => {
  const exercises = await db.select()
    .from(schema.breathingExercises)
    .orderBy(schema.breathingExercises.sortOrder);

  res.json({ exercises });
});

const logSessionSchema = z.object({
  exerciseId: z.string().uuid(),
  durationSeconds: z.number().int().min(1),
  cyclesCompleted: z.number().int().min(1),
});

// POST /breathing/sessions — Log a completed breathing session
router.post('/sessions', async (req: AuthRequest, res: Response) => {
  try {
    const { exerciseId, durationSeconds, cyclesCompleted } = logSessionSchema.parse(req.body);

    const [session] = await db.insert(schema.breathingSessions).values({
      userId: req.userId!,
      exerciseId,
      durationSeconds,
      cyclesCompleted,
    }).returning();

    // Update breathing streak
    const today = new Date().toISOString().split('T')[0];
    const [streak] = await db.select()
      .from(schema.streaks)
      .where(eq(schema.streaks.userId, req.userId!))
      .limit(1);

    if (streak && streak.lastActivityDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const isConsecutive = streak.lastActivityDate === yesterdayStr;
      const newCount = isConsecutive ? streak.currentCount + 1 : 1;
      const newLongest = Math.max(streak.longestCount, newCount);

      await db.update(schema.streaks).set({
        currentCount: newCount,
        longestCount: newLongest,
        lastActivityDate: today,
      }).where(eq(schema.streaks.id, streak.id));
    }

    // Award XP
    await db.update(schema.users).set({
      xp: schema.users.xp,
    }).where(eq(schema.users.id, req.userId!));

    res.status(201).json(session);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    throw error;
  }
});

// GET /breathing/sessions — Get user's breathing history
router.get('/sessions', async (req: AuthRequest, res: Response) => {
  const sessions = await db.select()
    .from(schema.breathingSessions)
    .where(eq(schema.breathingSessions.userId, req.userId!))
    .orderBy(desc(schema.breathingSessions.completedAt))
    .limit(50);

  res.json({ sessions });
});

export default router;
