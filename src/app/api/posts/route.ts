import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { validatePostInput } from '@/lib/validate';
import { rateLimit } from '@/lib/rate-limit';
import { FieldValue } from 'firebase-admin/firestore';

// ── CREATE POST ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 10 posts per hour per user
  if (!rateLimit(`post:${session.user.id}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many posts. Try again in an hour.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = validatePostInput(body);
  if (!result.valid || !result.sanitized) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const { title, body: postBody, type, tags } = result.sanitized;

  try {
    const userSnap = await adminDb.collection('users').doc(session.user.id).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    const user = userSnap.data()!;

    const postRef = adminDb.collection('posts').doc();
    const now     = new Date().toISOString();

    const post = {
      id:          postRef.id,
      authorId:    session.user.id,
      authorName:  user.displayName as string,
      authorPhoto: (user.photoURL as string | null) ?? null,
      title,
      body:        postBody,
      type,
      tags,
      createdAt:   now,
      updatedAt:   now,
      likeCount:   0,
      viewCount:   0,
    };

    const batch = adminDb.batch();
    batch.set(postRef, post);
    batch.update(adminDb.collection('users').doc(session.user.id), {
      postCount: FieldValue.increment(1),
    });
    for (const tag of tags) {
      batch.set(
        adminDb.collection('tags').doc(tag),
        { name: tag, postCount: FieldValue.increment(1) },
        { merge: true }
      );
    }
    await batch.commit();

    return NextResponse.json({ id: postRef.id }, { status: 201 });
  } catch (err) {
    console.error('[api/posts POST]', err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

// ── FETCH FEED ───────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tag    = searchParams.get('tag');
  const cursor = searchParams.get('cursor');
  const limit  = Math.min(Number(searchParams.get('limit') ?? 20), 50);

  try {
    // Firestore requires the array-contains filter to be the first constraint,
    // then orderBy. The composite index in firestore.indexes.json covers this.
    let query = tag
      ? adminDb
          .collection('posts')
          .where('tags', 'array-contains', tag)
          .orderBy('createdAt', 'desc')
          .limit(limit)
      : adminDb
          .collection('posts')
          .orderBy('createdAt', 'desc')
          .limit(limit);

    if (cursor) query = query.startAfter(cursor) as typeof query;

    const snap       = await query.get();
    const posts      = snap.docs.map((d) => d.data());
    const nextCursor = posts.length === limit
      ? (posts[posts.length - 1] as Record<string, unknown>).createdAt
      : null;

    return NextResponse.json({ posts, nextCursor });
  } catch (err) {
    console.error('[api/posts GET]', err);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
