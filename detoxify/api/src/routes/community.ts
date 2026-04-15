import { Router, Response } from 'express';
import { db, schema } from '../db';
import { eq, and } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /community/feed — Get social proof and activity feed
router.get('/feed', async (req: AuthRequest, res: Response) => {
  // Get user's friends
  const friendships = await db.select()
    .from(schema.friendships)
    .where(eq(schema.friendships.userId, req.userId!));

  const friendIds = friendships.map((f) => f.friendId);

  // Get active challenge count (social proof)
  const activeChallenges = await db.select()
    .from(schema.detoxChallenges)
    .where(eq(schema.detoxChallenges.isActive, true));

  const totalParticipants = activeChallenges.reduce((sum, c) => sum + c.participantCount, 0);

  res.json({
    friendCount: friendIds.length,
    activeChallengeCount: activeChallenges.length,
    totalDetoxingNow: totalParticipants,
    socialProof: `${totalParticipants.toLocaleString()} people are detoxing today`,
  });
});

// POST /community/friends — Add friend by invite code
router.post('/friends', async (req: AuthRequest, res: Response) => {
  const { inviteCode } = req.body;

  if (!inviteCode) {
    res.status(400).json({ message: 'Invite code required' });
    return;
  }

  const [friend] = await db.select()
    .from(schema.users)
    .where(eq(schema.users.inviteCode, inviteCode.toUpperCase()))
    .limit(1);

  if (!friend) {
    res.status(404).json({ message: 'Invalid invite code' });
    return;
  }

  if (friend.id === req.userId) {
    res.status(400).json({ message: "You can't add yourself" });
    return;
  }

  // Check if already friends
  const [existing] = await db.select()
    .from(schema.friendships)
    .where(and(
      eq(schema.friendships.userId, req.userId!),
      eq(schema.friendships.friendId, friend.id),
    ))
    .limit(1);

  if (existing) {
    res.status(409).json({ message: 'Already friends' });
    return;
  }

  // Create bidirectional friendship
  await db.insert(schema.friendships).values([
    { userId: req.userId!, friendId: friend.id },
    { userId: friend.id, friendId: req.userId! },
  ]);

  res.status(201).json({
    friend: {
      id: friend.id,
      displayName: friend.displayName,
      avatarUrl: friend.avatarUrl,
    },
  });
});

// GET /community/friends — Get friends list
router.get('/friends', async (req: AuthRequest, res: Response) => {
  const friendships = await db.select({
    friendId: schema.friendships.friendId,
    displayName: schema.users.displayName,
    avatarUrl: schema.users.avatarUrl,
  })
    .from(schema.friendships)
    .innerJoin(schema.users, eq(schema.friendships.friendId, schema.users.id))
    .where(eq(schema.friendships.userId, req.userId!));

  res.json({ friends: friendships });
});

export default router;
