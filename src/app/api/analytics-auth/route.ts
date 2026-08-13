import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false; // timingSafeEqual requires equal length
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  const { key } = await req.json();
  const real = process.env.ANA_KEY;
  if (!real) return NextResponse.json({ error: 'not configured' }, { status: 500 });

  if (typeof key !== 'string' || !safeEqual(key, real)) {
    // deliberately generic error + no rate-limit hint, no timing leak (constant-time compare above)
    return NextResponse.json({ error: 'incorrect' }, { status: 401 });
  }

  cookies().set('ana_session', crypto.createHash('sha256').update(real).digest('hex'), {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 4, // 4 hour session
    path: '/',
  });
  return NextResponse.json({ ok: true });
}
