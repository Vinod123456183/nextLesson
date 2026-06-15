"use client";

import Link from "next/link";
import Image from "next/image";
import { Post } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, EyeIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useState, useCallback, useEffect } from "react";

const TYPE_STYLE: Record<string, string> = {
  lesson: "bg-blue-50 text-blue-700",
  tip: "bg-green-50 text-green-700",
  mistake: "bg-red-50 text-red-700",
};

const TYPE_LABEL: Record<string, string> = {
  lesson: "Lesson",
  tip: "Tip",
  mistake: "Mistake",
};

export function PostCard({ post }: { post: Post }) {
  const [likes, setLikes] = useState(post.likeCount ?? 0);
  const [views, setViews] = useState(post.viewCount ?? 0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if this visitor already liked this post (by IP, done server-side)
  useEffect(() => {
    fetch(`/api/posts/${post.id}/like`)
      .then((r) => r.json())
      .then((d) => {
        if (d.liked) setLiked(true);
      })
      .catch(() => {});
  }, [post.id]);

  // Record a view when the card mounts (rate-limited server-side: 1/30min per IP per post)
  useEffect(() => {
    fetch(`/api/posts/${post.id}/view`, { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setViews((v) => v + 1);
      })
      .catch(() => {});
  }, [post.id]);

  const toggleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (loading) return;

      const wasLiked = liked;
      // Optimistic update
      setLiked(!wasLiked);
      setLikes((n) => n + (wasLiked ? -1 : 1));
      setLoading(true);

      try {
        const res = await fetch(`/api/posts/${post.id}/like`, {
          method: "POST",
        });
        if (!res.ok) {
          // Roll back
          setLiked(wasLiked);
          setLikes((n) => n + (wasLiked ? 1 : -1));
        } else {
          const d = await res.json();
          setLiked(d.liked);
        }
      } catch {
        setLiked(wasLiked);
        setLikes((n) => n + (wasLiked ? 1 : -1));
      } finally {
        setLoading(false);
      }
    },
    [liked, loading, post.id],
  );

  return (
    <Link href={`/post/${post.id}`} className="block">
      <article className="card hover:border-gray-200 hover:shadow-md transition-all group cursor-pointer">
        {/* Author + type */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {post.authorPhoto ? (
              <Image
                src={post.authorPhoto}
                alt={post.authorName}
                width={32}
                height={32}
                className="rounded-full flex-shrink-0"
                unoptimized
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <span className="text-sm font-medium text-gray-800 truncate block">
                {post.authorName}
              </span>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
          <span
            className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_STYLE[post.type] ?? ""}`}
          >
            {TYPE_LABEL[post.type] ?? post.type}
          </span>
        </div>

        {/* Title + preview */}
        <h2 className="font-semibold text-gray-900 mb-1.5 group-hover:text-brand-600 transition-colors leading-snug">
          {post.title}
        </h2>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {post.body}
        </p>

        {/* Tags + stats */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 gap-2">
          <div className="flex flex-wrap gap-1.5 min-w-0">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="tag-pill">+{post.tags.length - 3}</span>
            )}
          </div>

          <div className="flex items-center gap-3 text-gray-400 text-xs flex-shrink-0">
            {/* View count */}
            <span className="flex items-center gap-1">
              <EyeIcon className="w-3.5 h-3.5" />
              {views}
            </span>

            {/* Like button — no login needed */}
            <button
              onClick={toggleLike}
              disabled={loading}
              className={`flex items-center gap-1 transition-colors disabled:opacity-50 ${
                liked ? "text-red-500" : "hover:text-red-400"
              }`}
              aria-label={liked ? "Unlike" : "Like"}
            >
              {liked ? (
                <HeartSolid className="w-3.5 h-3.5 text-red-500" />
              ) : (
                <HeartIcon className="w-3.5 h-3.5" />
              )}
              {likes}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
