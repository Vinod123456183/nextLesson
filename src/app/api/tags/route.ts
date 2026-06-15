import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const snap = await adminDb
      .collection('tags')
      .orderBy('postCount', 'desc')
      .limit(30)
      .get();

    const tags = snap.docs.map((d) => ({ name: d.id, ...d.data() }));
    return NextResponse.json({ tags });
  } catch (err) {
    console.error('[api/tags GET]', err);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
