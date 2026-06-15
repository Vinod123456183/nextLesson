"use client";

import { useState } from "react";
import Image from "next/image";
import { PostCard } from "@/components/ui/PostCard";
import { format } from "date-fns";
import { Post, TAGS, PostType } from "@/types";
import TextareaAutosize from "react-textarea-autosize";
import toast from "react-hot-toast";
import clsx from "clsx";
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SafeUser {
  uid: string;
  displayName: string;
  photoURL: string | null;
  createdAt: string;
  postCount: number;
}

const TYPE_OPTIONS: {
  value: PostType;
  label: string;
  desc: string;
  color: string;
}[] = [
  {
    value: "lesson",
    label: "Lesson",
    desc: "Something I learned the hard way",
    color: "border-blue-400 bg-blue-50 text-blue-700",
  },
  {
    value: "tip",
    label: "Tip",
    desc: "A shortcut that helped me",
    color: "border-green-400 bg-green-50 text-green-700",
  },
  {
    value: "mistake",
    label: "Mistake",
    desc: "A mistake I wish I had avoided",
    color: "border-red-400 bg-red-50 text-red-700",
  },
];

export default function ProfileClient({
  user,
  posts: initialPosts,
  isOwner,
}: {
  user: SafeUser;
  posts: Post[];
  isOwner: boolean;
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editType, setEditType] = useState<PostType>("lesson");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const counts = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] ?? 0) + 1;
    return acc;
  }, {});

  function openEdit(post: Post) {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditType(post.type);
    setEditTags([...post.tags]);
  }

  function closeEdit() {
    setEditingPost(null);
  }

  function toggleTag(tag: string) {
    setEditTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length >= 5
          ? prev
          : [...prev, tag],
    );
  }

  async function handleSave() {
    if (!editingPost) return;
    if (editTags.length === 0) {
      toast.error("Select at least one tag");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${editingPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          body: editBody,
          type: editType,
          tags: editTags,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to save");
        return;
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? {
                ...p,
                title: editTitle,
                body: editBody,
                type: editType,
                tags: editTags,
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      );
      toast.success("Post updated!");
      closeEdit();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const isEditValid =
    editTitle.trim().length >= 5 &&
    editBody.trim().length >= 10 &&
    editTags.length > 0;

  return (
    <>
      <div className="space-y-6">
        {/* Profile card */}
        <div className="card">
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName}
                width={56}
                height={56}
                className="rounded-full"
                unoptimized
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-500">
                  {user.displayName?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {user.displayName}
              </h1>
              {isOwner && (
                <span className="inline-block text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full mt-0.5">
                  My Profile
                </span>
              )}
              <p className="text-xs text-gray-400 mt-0.5">
                Member since {format(new Date(user.createdAt), "MMMM yyyy")}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-50">
            <StatBlock value={posts.length} label="Posts" />
            {counts.lesson ? (
              <StatBlock
                value={counts.lesson}
                label="Lessons"
                color="text-blue-600"
              />
            ) : null}
            {counts.tip ? (
              <StatBlock
                value={counts.tip}
                label="Tips"
                color="text-green-600"
              />
            ) : null}
            {counts.mistake ? (
              <StatBlock
                value={counts.mistake}
                label="Mistakes"
                color="text-red-500"
              />
            ) : null}
          </div>
        </div>

        {/* Posts section */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            {posts.length === 0
              ? "No posts yet"
              : `${posts.length} post${posts.length === 1 ? "" : "s"}`}
          </h2>
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="card text-center py-10">
                <p className="text-gray-400 text-sm">
                  {isOwner
                    ? "You haven't shared anything yet."
                    : "This person hasn't shared anything yet."}
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="relative">
                  <PostCard post={post} />
                  {isOwner && (
                    <button
                      onClick={() => openEdit(post)}
                      className="absolute top-3 right-3 flex items-center gap-1 bg-white border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow transition-all rounded-lg py-1 px-2.5 text-xs font-medium text-gray-600 hover:text-gray-900"
                      aria-label="Edit post"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Edit modal */}
      {editingPost && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEdit();
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-base">Edit post</h2>
              <button
                onClick={closeEdit}
                className="btn-ghost p-1.5"
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What kind of post is this?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEditType(opt.value)}
                      className={clsx(
                        "p-3 rounded-lg border-2 text-left transition-all",
                        editType === opt.value
                          ? opt.color
                          : "border-gray-100 bg-white text-gray-600 hover:border-gray-200",
                      )}
                    >
                      <div className="font-medium text-sm">{opt.label}</div>
                      <div className="text-xs opacity-70 mt-0.5 leading-tight">
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title{" "}
                  <span className="text-gray-400 font-normal">
                    (5–200 chars)
                  </span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="input"
                  maxLength={200}
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Your experience{" "}
                  <span className="text-gray-400 font-normal">
                    (10–10,000 chars)
                  </span>
                </label>
                <TextareaAutosize
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="input resize-none leading-relaxed"
                  minRows={6}
                  maxLength={10000}
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {editBody.length.toLocaleString()} / 10,000
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tags{" "}
                  <span className="text-gray-400 font-normal">
                    (pick up to 5 — {editTags.length} selected)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={clsx(
                        "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                        editTags.includes(tag)
                          ? "bg-brand-500 text-white border-brand-500"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving || !isEditValid}
                className="btn-primary"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
              <button onClick={closeEdit} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatBlock({
  value,
  label,
  color = "text-gray-900",
}: {
  value: number;
  label: string;
  color?: string;
}) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}
