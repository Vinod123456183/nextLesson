import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// ── GET single post ──────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const snap = await adminDb.collection('posts').doc(params.id).get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    // Fire-and-forget view count increment
    adminDb.collection('posts').doc(params.id)
      .update({ viewCount: FieldValue.increment(1) })
      .catch(() => {});

    return NextResponse.json(snap.data());
  } catch (err) {
    console.error('[api/posts/[id] GET]', err);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// ── DELETE post (author only) ────────────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const snap = await adminDb.collection('posts').doc(params.id).get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = snap.data()!;
    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const batch = adminDb.batch();
    batch.delete(adminDb.collection('posts').doc(params.id));
    batch.update(adminDb.collection('users').doc(session.user.id), {
      postCount: FieldValue.increment(-1),
    });
    for (const tag of (post.tags ?? []) as string[]) {
      batch.set(
        adminDb.collection('tags').doc(tag),
        { postCount: FieldValue.increment(-1) },
        { merge: true }
      );
    }
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[api/posts/[id] DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}

// ── PATCH post (author only) ──────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const snap = await adminDb.collection('posts').doc(params.id).get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = snap.data()!;
    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, body: postBody, type, tags } = body as {
      title?: string;
      body?: string;
      type?: string;
      tags?: string[];
    };

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (title !== undefined) updates.title = title;
    if (postBody !== undefined) updates.body = postBody;
    if (type !== undefined) updates.type = type;
    if (tags !== undefined) updates.tags = tags;

    await adminDb.collection('posts').doc(params.id).update(updates);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[api/posts/[id] PATCH]', err);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}
