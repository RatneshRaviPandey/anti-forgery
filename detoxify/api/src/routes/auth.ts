import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db, schema } from '../db';
import { eq } from 'drizzle-orm';
import { config } from '../config/env';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function generateTokens(userId: string, tier: string) {
  const accessToken = jwt.sign({ userId, tier }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
  const refreshToken = jwt.sign({ userId, tokenId: uuidv4() }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
  return { accessToken, refreshToken };
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, displayName } = registerSchema.parse(req.body);

    // Check if email exists
    const existing = await db.select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const inviteCode = generateInviteCode();

    const [user] = await db.insert(schema.users).values({
      email: email.toLowerCase(),
      passwordHash,
      displayName,
      inviteCode,
    }).returning();

    // Create default streaks
    await db.insert(schema.streaks).values([
      { userId: user.id, type: 'daily_detox' },
      { userId: user.id, type: 'meditation' },
      { userId: user.id, type: 'breathing' },
    ]);

    // Create notification preferences
    await db.insert(schema.notificationPreferences).values({ userId: user.id });

    const tokens = generateTokens(user.id, user.tier);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await db.insert(schema.refreshTokens).values({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt,
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        tier: user.tier,
        dailyGoalMinutes: user.dailyGoalMinutes,
        timezone: user.timezone,
        onboarded: user.onboarded,
        createdAt: user.createdAt,
      },
      ...tokens,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    throw error;
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const tokens = generateTokens(user.id, user.tier);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await db.insert(schema.refreshTokens).values({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        tier: user.tier,
        dailyGoalMinutes: user.dailyGoalMinutes,
        timezone: user.timezone,
        onboarded: user.onboarded,
        createdAt: user.createdAt,
      },
      ...tokens,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    throw error;
  }
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token required' });
      return;
    }

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };

    // Check if token exists and hasn't been revoked
    const [storedToken] = await db.select()
      .from(schema.refreshTokens)
      .where(eq(schema.refreshTokens.token, refreshToken))
      .limit(1);

    if (!storedToken) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    // Delete used refresh token (rotation)
    await db.delete(schema.refreshTokens).where(eq(schema.refreshTokens.token, refreshToken));

    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, decoded.userId))
      .limit(1);

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const tokens = generateTokens(user.id, user.tier);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await db.insert(schema.refreshTokens).values({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt,
    });

    res.json(tokens);
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// GET /auth/profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  const [user] = await db.select()
    .from(schema.users)
    .where(eq(schema.users.id, req.userId!))
    .limit(1);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      tier: user.tier,
      dailyGoalMinutes: user.dailyGoalMinutes,
      timezone: user.timezone,
      onboarded: user.onboarded,
      xp: user.xp,
      inviteCode: user.inviteCode,
      createdAt: user.createdAt,
    },
  });
});

// POST /auth/logout
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  // Delete all refresh tokens for user
  await db.delete(schema.refreshTokens).where(eq(schema.refreshTokens.userId, req.userId!));
  res.json({ message: 'Logged out' });
});

export default router;
