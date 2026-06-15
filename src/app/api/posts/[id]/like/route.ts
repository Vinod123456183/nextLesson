import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { rateLimit } from "@/lib/rate-limit";

// ── TOGGLE LIKE — no login required, tracked by IP ───────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  // Use IP as anonymous identifier (falls back to a header Vercel sets)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  // Rate limit: 10 likes per minute per IP
  if (!rateLimit(`like:${ip}`, 10, 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const postRef = adminDb.collection("posts").doc(params.id);
    const postSnap = await postRef.get();
    if (!postSnap.exists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Use a hashed IP as the like doc ID so one IP = one like
    const likeId = Buffer.from(ip)
      .toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 20);
    const likeRef = postRef.collection("likes").doc(likeId);
    const likeSnap = await likeRef.get();

    if (likeSnap.exists) {
      // Unlike
      await adminDb.runTransaction(async (tx) => {
        tx.delete(likeRef);
        tx.update(postRef, { likeCount: FieldValue.increment(-1) });
      });
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await adminDb.runTransaction(async (tx) => {
        tx.set(likeRef, { ip: likeId, createdAt: new Date().toISOString() });
        tx.update(postRef, { likeCount: FieldValue.increment(1) });
      });
      return NextResponse.json({ liked: true });
    }
  } catch (err) {
    console.error("[like POST]", err);
    return NextResponse.json(
      { error: "Failed to update like" },
      { status: 500 },
    );
  }
}

// ── CHECK IF THIS IP ALREADY LIKED ───────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  try {
    const likeId = Buffer.from(ip)
      .toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 20);
    const likeSnap = await adminDb
      .collection("posts")
      .doc(params.id)
      .collection("likes")
      .doc(likeId)
      .get();
    return NextResponse.json({ liked: likeSnap.exists });
  } catch {
    return NextResponse.json({ liked: false });
  }
}
