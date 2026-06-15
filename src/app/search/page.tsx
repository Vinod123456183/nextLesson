import { adminDb } from "@/lib/firebase-admin";
import { Post } from "@/types";
import { PostCard } from "@/components/ui/PostCard";
import { TagFilter } from "@/components/ui/TagFilter";
import { Suspense } from "react";
import type { CollectionReference, Query } from "firebase-admin/firestore";

interface Props {
  searchParams: { tag?: string; type?: string };
}

async function searchPosts(tag?: string, type?: string): Promise<Post[]> {
  const col: CollectionReference = adminDb.collection("posts");
  let q: Query = col;

  // Build query — Firestore requires inequality / array-contains before orderBy
  if (tag && type && ["lesson", "tip", "mistake"].includes(type)) {
    // Both filters: need a composite index (covered by firestore.indexes.json)
    q = col.where("tags", "array-contains", tag).where("type", "==", type);
  } else if (tag) {
    q = col.where("tags", "array-contains", tag);
  } else if (type && ["lesson", "tip", "mistake"].includes(type)) {
    q = col.where("type", "==", type);
  }

  const snap = await q.orderBy("createdAt", "desc").limit(30).get();
  return snap.docs.map((d) => d.data() as Post);
}

export default async function SearchPage({ searchParams }: Props) {
  const { tag, type } = searchParams;
  const posts = await searchPosts(tag, type);

  const resultLabel = [
    tag ? `tagged "${tag}"` : "",
    type ? `type "${type}"` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Search</h1>

      <Suspense fallback={<div className="h-8" />}>
        <TagFilter />
      </Suspense>

      {(tag || type) && (
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-700">{posts.length}</span>{" "}
          result{posts.length !== 1 ? "s" : ""}
          {resultLabel ? ` — ${resultLabel}` : ""}
        </p>
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 text-sm">
              No posts found. Try a different filter.
            </p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
