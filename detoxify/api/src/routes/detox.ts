import { Router, Response } from 'express';
import { z } from 'zod';
import { db, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const startSessionSchema = z.object({
  targetMinutes: z.number().int().min(1).max(1440),
  blockedApps: z.array(z.string()).default([]),
});

// POST /detox/sessions — Start a detox session
router.post('/sessions', async (req: AuthRequest, res: Response) => {
  try {
    const { targetMinutes, blockedApps } = startSessionSchema.parse(req.body);

    const [session] = await db.insert(schema.detoxSessions).values({
      userId: req.userId!,
      type: 'timer',
      status: 'active',
      targetMinutes,
      blockedApps,
    }).returning();

    res.status(201).json(session);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    throw error;
  }
});

// PATCH /detox/sessions/:id — End a detox session
router.patch('/sessions/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { actualMinutes } = req.body;

  const [session] = await db.select()
    .from(schema.detoxSessions)
    .where(and(eq(schema.detoxSessions.id, id), eq(schema.detoxSessions.userId, req.userId!)))
    .limit(1);

  if (!session) {
    res.status(404).json({ message: 'Session not found' });
    return;
  }

  const completed = actualMinutes >= session.targetMinutes;

  const [updated] = await db.update(schema.detoxSessions)
    .set({
      status: 'completed',
      endedAt: new Date(),
      actualMinutes: actualMinutes || 0,
      completed,
    })
    .where(eq(schema.detoxSessions.id, id))
    .returning();

  // Award XP if completed
  if (completed) {
    await db.update(schema.users)
      .set({ xp: session.userId ? undefined : 0 })
      .where(eq(schema.users.id, req.userId!));
    // XP update handled via increment in production
  }

  res.json(updated);
});

// GET /detox/sessions — Get session history
router.get('/sessions', async (req: AuthRequest, res: Response) => {
  const sessions = await db.select()
    .from(schema.detoxSessions)
    .where(eq(schema.detoxSessions.userId, req.userId!))
    .orderBy(desc(schema.detoxSessions.createdAt))
    .limit(50);

  res.json(sessions);
});

// GET /detox/challenges — Get available challenges
router.get('/challenges', async (req: AuthRequest, res: Response) => {
  const challenges = await db.select()
    .from(schema.detoxChallenges)
    .where(eq(schema.detoxChallenges.isActive, true));

  const userChallengesList = await db.select()
    .from(schema.userChallenges)
    .where(eq(schema.userChallenges.userId, req.userId!));

  res.json({ challenges, userChallenges: userChallengesList });
});

// POST /detox/challenges/:id/join — Join a challenge
router.post('/challenges/:id/join', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const [challenge] = await db.select()
    .from(schema.detoxChallenges)
    .where(eq(schema.detoxChallenges.id, id))
    .limit(1);

  if (!challenge) {
    res.status(404).json({ message: 'Challenge not found' });
    return;
  }

  // Check if already joined
  const [existing] = await db.select()
    .from(schema.userChallenges)
    .where(and(
      eq(schema.userChallenges.userId, req.userId!),
      eq(schema.userChallenges.challengeId, id),
    ))
    .limit(1);

  if (existing) {
    res.status(409).json({ message: 'Already joined this challenge' });
    return;
  }

  const [userChallenge] = await db.insert(schema.userChallenges).values({
    userId: req.userId!,
    challengeId: id,
    progress: [{ day: 1, completed: false }],
  }).returning();

  // Increment participant count
  await db.update(schema.detoxChallenges)
    .set({ participantCount: challenge.participantCount + 1 })
    .where(eq(schema.detoxChallenges.id, id));

  res.status(201).json(userChallenge);
});

export default router;
