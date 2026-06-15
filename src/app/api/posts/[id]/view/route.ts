import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { rateLimit } from "@/lib/rate-limit";

// ── INCREMENT VIEW COUNT — no login required ──────────────────────────────────
// Called from PostCard when the card is clicked/viewed.
// Rate-limited per IP+postId to prevent inflation.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  // 1 view per post per IP per 30 minutes
  if (!rateLimit(`view:${ip}:${params.id}`, 1, 30 * 60 * 1000)) {
    return NextResponse.json({ ok: true }); // silently skip duplicates
  }

  try {
    await adminDb
      .collection("posts")
      .doc(params.id)
      .update({
        viewCount: FieldValue.increment(1),
      });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[view POST]", err);
    return NextResponse.json({ ok: false });
  }
}
