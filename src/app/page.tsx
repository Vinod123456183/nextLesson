import { Suspense } from 'react';
import { adminDb } from '@/lib/firebase-admin';
import { Post } from '@/types';
import { PostCard } from '@/components/ui/PostCard';
import { TagFilter } from '@/components/ui/TagFilter';
import { TypeFilter } from '@/components/ui/TypeFilter';
import Link from 'next/link';
import type { CollectionReference, Query } from 'firebase-admin/firestore';

interface Props {
  searchParams: { tag?: string; type?: string };
}

async function getPosts(tag?: string, type?: string): Promise<Post[]> {
  const col: CollectionReference = adminDb.collection('posts');
  let q: Query = col;

  if (tag)  q = q.where('tags', 'array-contains', tag);
  if (type && ['lesson', 'tip', 'mistake'].includes(type))
            q = q.where('type', '==', type);

  const snap = await q.orderBy('createdAt', 'desc').limit(30).get();
  return snap.docs.map((d) => d.data() as Post);
}

export default async function HomePage({ searchParams }: Props) {
  const { tag, type } = searchParams;
  const posts = await getPosts(tag, type);

  const hasFilter = tag || type;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Real experiences, real lessons
        </h1>
        <p className="text-gray-500 text-sm">
          Learn from what others have lived through — no filters, no perfection.
        </p>
      </div>

      {/* Type filter — Lesson | Tip | Mistake */}
      <section>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
          Filter by type
        </p>
        <Suspense fallback={<div className="h-8" />}>
          <TypeFilter />
        </Suspense>
      </section>

      {/* Tag filter */}
      <section>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
          Browse by topic
        </p>
        <Suspense fallback={<div className="h-8" />}>
          <TagFilter />
        </Suspense>
      </section>

      {/* Active filters summary */}
      {hasFilter && (
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="text-gray-400">Showing:</span>
          {type && (
            <span className="font-medium text-gray-700 capitalize">{type}s</span>
          )}
          {type && tag && <span className="text-gray-300">·</span>}
          {tag && (
            <span className="font-medium text-brand-600">#{tag}</span>
          )}
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 underline ml-1">
            clear all
          </Link>
        </div>
      )}

      {/* Feed */}
      <section className="space-y-4">
        {posts.length === 0 ? (
          <div className="card text-center py-12 space-y-3">
            <p className="text-gray-400 text-sm">
              No posts found. Try a different filter.
            </p>
            <Link href="/" className="btn-secondary inline-flex">
              Clear filters
            </Link>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </section>

      {posts.length === 30 && (
        <p className="text-center text-xs text-gray-400 pb-6">
          Showing latest 30 posts.
        </p>
      )}
    </div>
  );
}