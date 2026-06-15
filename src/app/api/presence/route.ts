import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

const ACTIVE_WINDOW_MS = 60 * 1000; // 60 seconds

// POST — client heartbeat (no login needed)
export async function POST(req: NextRequest) {
  let sessionId: string;
  try {
    const body = await req.json();
    sessionId =
      typeof body.sessionId === "string"
        ? body.sessionId.slice(0, 36)
        : "unknown";
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    await adminDb.collection("presence").doc(sessionId).set({
      lastSeen: FieldValue.serverTimestamp(),
      sessionId,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[presence POST]", err);
    return NextResponse.json({ ok: false });
  }
}

// GET — count active sessions in last 60s
export async function GET() {
  try {
    const cutoff = Timestamp.fromMillis(Date.now() - ACTIVE_WINDOW_MS);
    const snap = await adminDb
      .collection("presence")
      .where("lastSeen", ">=", cutoff)
      .get();
    return NextResponse.json({ count: snap.size });
  } catch (err) {
    console.error("[presence GET]", err);
    return NextResponse.json({ count: 0 });
  }
}
