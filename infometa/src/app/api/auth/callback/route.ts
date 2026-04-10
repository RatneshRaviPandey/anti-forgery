import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth/supabase';
import { db } from '@/lib/db';
import { users, brands } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirect_to') ?? '/admin/dashboard';

  if (!code) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL('/admin?error=auth_failed', req.url));
  }

  // Upsert user in our database
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, data.user.id),
  });

  if (!existingUser) {
    await db.insert(users).values({
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.name ?? data.user.email,
      role: 'admin',
      lastLoginAt: new Date(),
    });
  } else {
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, data.user.id));
  }

  return NextResponse.redirect(new URL(redirectTo, req.url));
}
