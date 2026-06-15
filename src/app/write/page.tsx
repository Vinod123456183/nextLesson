"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TAGS, PostType } from "@/types";
import TextareaAutosize from "react-textarea-autosize";
import toast from "react-hot-toast";
import clsx from "clsx";
import Link from "next/link";

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

const EMPTY_FORM = {
  title: "",
  body: "",
  type: "lesson" as PostType,
  selectedTags: [] as string[],
};

export default function WritePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState(EMPTY_FORM.title);
  const [body, setBody] = useState(EMPTY_FORM.body);
  const [type, setType] = useState<PostType>(EMPTY_FORM.type);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    EMPTY_FORM.selectedTags,
  );
  const [submitting, setSubmitting] = useState(false);

  // Track recently published posts so the user can navigate to them
  const [publishedPosts, setPublishedPosts] = useState<
    { id: string; title: string }[]
  >([]);

  if (status === "loading") return null;
  if (!session) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 mb-4">
          You need to sign in to write a post.
        </p>
        <Link href="/auth/signin" className="btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length >= 5
          ? prev
          : [...prev, tag],
    );
  }

  function resetForm() {
    setTitle(EMPTY_FORM.title);
    setBody(EMPTY_FORM.body);
    setType(EMPTY_FORM.type);
    setSelectedTags(EMPTY_FORM.selectedTags);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedTags.length === 0) {
      toast.error("Select at least one tag");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, type, tags: selectedTags }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to publish");
        return;
      }

      // Save to recent list before resetting
      const savedTitle = title;
      setPublishedPosts((prev) => [
        { id: data.id, title: savedTitle },
        ...prev,
      ]);

      // Reset the form so the user can immediately write another post
      resetForm();
      toast.success("Published! Write another or view your post below.");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const charCount = body.length;
  const isValid =
    title.trim().length >= 5 &&
    body.trim().length >= 20 &&
    selectedTags.length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Share your experience
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Help others by sharing what you've learned, a useful tip, or a mistake
          to avoid.
        </p>
      </div>

      {/* Recently published posts */}
      {publishedPosts.length > 0 && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800 mb-2">
            ✓ {publishedPosts.length} post{publishedPosts.length > 1 ? "s" : ""}{" "}
            published this session
          </p>
          <ul className="space-y-1">
            {publishedPosts.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-sm">
                <span className="text-green-700 truncate flex-1">
                  {p.title}
                </span>
                <button
                  type="button"
                  onClick={() => router.push(`/post/${p.id}`)}
                  className="text-green-700 underline whitespace-nowrap hover:text-green-900"
                >
                  View →
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What kind of post is this?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={clsx(
                  "p-3 rounded-lg border-2 text-left transition-all",
                  type === opt.value
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
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Title{" "}
            <span className="text-gray-400 font-normal">(5–200 chars)</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="What's the core lesson in one sentence?"
            maxLength={200}
            required
          />
        </div>

        {/* Body */}
        <div>
          <label
            htmlFor="body"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Your experience{" "}
            <span className="text-gray-400 font-normal">(20–10,000 chars)</span>
          </label>
          <TextareaAutosize
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="input resize-none leading-relaxed"
            placeholder="Tell the full story. What happened? What did you learn? What would you do differently?"
            minRows={6}
            maxLength={10000}
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {charCount.toLocaleString()} / 10,000
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tags{" "}
            <span className="text-gray-400 font-normal">
              (pick up to 5 — {selectedTags.length} selected)
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
                  selectedTags.includes(tag)
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="btn-primary"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing…
              </>
            ) : (
              "Publish post"
            )}
          </button>
          <Link href="/" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
