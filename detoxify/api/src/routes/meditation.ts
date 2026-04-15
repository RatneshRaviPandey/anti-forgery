import { Router, Response } from 'express';
import { z } from 'zod';
import { db, schema } from '../db';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { tierGate } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /meditation/sessions — Get meditation sessions
router.get('/sessions', async (req: AuthRequest, res: Response) => {
  const category = req.query.category as string | undefined;

  let query = db.select().from(schema.meditationSessions);

  if (category) {
    const sessions = await db.select()
      .from(schema.meditationSessions)
      .where(eq(schema.meditationSessions.category, category as any))
      .orderBy(schema.meditationSessions.sortOrder);
    res.json({ sessions });
    return;
  }

  const sessions = await db.select()
    .from(schema.meditationSessions)
    .orderBy(schema.meditationSessions.sortOrder);

  res.json({ sessions });
});

const progressSchema = z.object({
  sessionId: z.string().uuid(),
  durationListened: z.number().int().min(0),
  completed: z.boolean(),
});

// POST /meditation/progress — Log meditation progress
router.post('/progress', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, durationListened, completed } = progressSchema.parse(req.body);

    const [progress] = await db.insert(schema.meditationProgress).values({
      userId: req.userId!,
      sessionId,
      durationListened,
      completed,
    }).returning();

    // Update meditation streak if completed
    if (completed) {
      const today = new Date().toISOString().split('T')[0];
      const streaks = await db.select()
        .from(schema.streaks)
        .where(eq(schema.streaks.userId, req.userId!));

      const medStreak = streaks.find((s) => s.type === 'meditation');
      if (medStreak && medStreak.lastActivityDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const isConsecutive = medStreak.lastActivityDate === yesterday.toISOString().split('T')[0];
        const newCount = isConsecutive ? medStreak.currentCount + 1 : 1;

        await db.update(schema.streaks).set({
          currentCount: newCount,
          longestCount: Math.max(medStreak.longestCount, newCount),
          lastActivityDate: today,
        }).where(eq(schema.streaks.id, medStreak.id));
      }
    }

    res.status(201).json(progress);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    throw error;
  }
});

// POST /meditation/sessions/:id/favorite — Toggle favorite
router.post('/sessions/:id/favorite', async (req: AuthRequest, res: Response) => {
  // For now store favorites client-side; server just acknowledges
  res.json({ success: true });
});

// GET /meditation/progress — Get user's meditation history
router.get('/progress', async (req: AuthRequest, res: Response) => {
  const progress = await db.select()
    .from(schema.meditationProgress)
    .where(eq(schema.meditationProgress.userId, req.userId!))
    .orderBy(desc(schema.meditationProgress.completedAt))
    .limit(50);

  res.json({ progress });
});

export default router;
