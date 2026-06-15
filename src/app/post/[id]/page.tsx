import { adminDb } from "@/lib/firebase-admin";
import { Post } from "@/types";
import { notFound } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DeleteButton } from "./DeleteButton";
import { EyeIcon, HeartIcon } from "@heroicons/react/24/outline";
import type { Metadata } from "next";

interface Props {
  params: { id: string };
}

async function getPost(id: string): Promise<Post | null> {
  const snap = await adminDb.collection("posts").doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as Post;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.id);
  if (!post) return { title: "Post not found — nextLesson" };
  return {
    title: `${post.title} — nextLesson`,
    description: post.body.slice(0, 160),
  };
}

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

export default async function PostPage({ params }: Props) {
  const post = await getPost(params.id);
  if (!post) notFound();

  const session = await getServerSession(authOptions);
  const isAuthor = session?.user?.id === post.authorId;

  return (
    <article className="max-w-2xl mx-auto">
      <Link
        href="/"
        className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-flex items-center gap-1"
      >
        ← Back to feed
      </Link>

      <div className="card space-y-5 mt-2">
        {/* Author row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {post.authorPhoto ? (
              <Image
                src={post.authorPhoto}
                alt={post.authorName}
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-200" />
            )}
            <div>
              <Link
                href={`/profile/${post.authorId}`}
                className="text-sm font-medium text-gray-800 hover:text-brand-600"
              >
                {post.authorName}
              </Link>
              <div className="text-xs text-gray-400">
                {format(new Date(post.createdAt), "dd MMM yyyy")}
                {" · "}
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_STYLE[post.type]}`}
            >
              {TYPE_LABEL[post.type]}
            </span>
            {isAuthor && <DeleteButton postId={post.id} />}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-900 leading-snug">
          {post.title}
        </h1>

        {/* Body — preserve whitespace/newlines */}
        <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
          {post.body}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/?tag=${encodeURIComponent(tag)}`}
              className="tag-pill"
            >
              #{tag}
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-400 pt-1 border-t border-gray-50">
          <span className="flex items-center gap-1">
            <EyeIcon className="w-3.5 h-3.5" />
            {post.viewCount ?? 0} views
          </span>
          <span className="flex items-center gap-1">
            <HeartIcon className="w-3.5 h-3.5" />
            {post.likeCount ?? 0} likes
          </span>
        </div>
      </div>
    </article>
  );
}
