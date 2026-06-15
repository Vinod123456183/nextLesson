import { TAGS } from "@/types";

// Strip dangerous HTML/script patterns from user input
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/javascript:/gi, "") // strip JS URIs
    .replace(/on\w+\s*=/gi, "") // strip event handlers
    .trim();
}

export function validatePostInput(data: unknown): {
  valid: boolean;
  error?: string;
  sanitized?: { title: string; body: string; type: string; tags: string[] };
} {
  if (!data || typeof data !== "object")
    return { valid: false, error: "Invalid input" };

  const d = data as Record<string, unknown>;

  if (typeof d.title !== "string" || d.title.trim().length < 5)
    return { valid: false, error: "Title must be at least 5 characters" };
  if (d.title.length > 200)
    return { valid: false, error: "Title must be under 200 characters" };

  if (typeof d.body !== "string" || d.body.trim().length < 20)
    return { valid: false, error: "Content must be at least 20 characters" };
  if (d.body.length > 10000)
    return { valid: false, error: "Content must be under 10,000 characters" };

  if (!["lesson", "tip", "mistake"].includes(d.type as string))
    return { valid: false, error: "Invalid post type" };

  if (!Array.isArray(d.tags) || d.tags.length === 0)
    return { valid: false, error: "Select at least one tag" };
  if (d.tags.length > 5)
    return { valid: false, error: "Maximum 5 tags allowed" };

  const validTags = (d.tags as string[]).filter(
    (t) => typeof t === "string" && (TAGS as readonly string[]).includes(t),
  );
  if (validTags.length === 0)
    return { valid: false, error: "No valid tags selected" };

  return {
    valid: true,
    sanitized: {
      title: sanitizeText(d.title as string),
      body: sanitizeText(d.body as string),
      type: d.type as string,
      tags: validTags,
    },
  };
}
