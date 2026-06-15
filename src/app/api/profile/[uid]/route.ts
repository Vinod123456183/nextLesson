import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Post } from '@/types';

// ── GET profile + posts for a user ───────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const userSnap = await adminDb.collection('users').doc(params.uid).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const raw = userSnap.data()!;
    const user = {
      uid: raw.uid as string,
      displayName: raw.displayName as string,
      photoURL: (raw.photoURL as string | null) ?? null,
      createdAt: raw.createdAt as string,
      postCount: (raw.postCount as number) ?? 0,
    };

    const postsSnap = await adminDb
      .collection('posts')
      .where('authorId', '==', params.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const posts: Post[] = postsSnap.docs.map((d) => d.data() as Post);

    return NextResponse.json({ user, posts });
  } catch (err) {
    console.error('[api/profile GET]', err);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
