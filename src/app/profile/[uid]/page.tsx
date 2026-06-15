import { adminDb } from "@/lib/firebase-admin";
import { Post } from "@/types";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProfileClient from "./ProfileClient";

interface Props {
  params: { uid: string };
}

interface SafeUser {
  uid: string;
  displayName: string;
  photoURL: string | null;
  createdAt: string;
  postCount: number;
}

async function getProfileData(
  uid: string,
): Promise<{ user: SafeUser; posts: Post[] } | null> {
  const userSnap = await adminDb.collection("users").doc(uid).get();
  if (!userSnap.exists) return null;

  const raw = userSnap.data()!;
  const safeUser: SafeUser = {
    uid: raw.uid as string,
    displayName: raw.displayName as string,
    photoURL: (raw.photoURL as string | null) ?? null,
    createdAt: raw.createdAt as string,
    postCount: (raw.postCount as number) ?? 0,
  };

  const postsSnap = await adminDb
    .collection("posts")
    .where("authorId", "==", uid)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  return {
    user: safeUser,
    posts: postsSnap.docs.map((d) => d.data() as Post),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getProfileData(params.uid);
  if (!data) return { title: "Profile not found — nextLesson" };
  return { title: `${data.user.displayName} — nextLesson` };
}

export default async function ProfilePage({ params }: Props) {
  try {
    const [data, session] = await Promise.all([
      getProfileData(params.uid),
      getServerSession(authOptions),
    ]);

    if (!data) notFound();

    const { user, posts } = data;
    const isOwner = session?.user?.id === params.uid;

    // Always use ProfileClient — it handles both owner and viewer modes
    return (
      <ProfileClient
        user={{ ...user, postCount: posts.length }}
        posts={posts}
        isOwner={isOwner}
      />
    );
  } catch (err) {
    console.error("[ProfilePage error]", err);
    throw err;
  }
}
