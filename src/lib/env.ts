/**
 * env.ts — single source of truth for all environment variables.
 *
 * • Client vars  (NEXT_PUBLIC_*) are validated lazily when first accessed,
 *   because Next.js inlines them at build time only for client bundles.
 * • Server vars  are validated eagerly on first import (server-side only).
 *
 * If any variable is missing you will see a clear error:
 *   ❌  Missing required environment variable: FOO
 */

function get(name: string): string {
  const val = process.env[name];
  if (!val || val.trim() === '') {
    throw new Error(
      `\n\n❌  Missing required environment variable: "${name}"\n` +
      `    → Copy .env.example to .env.local and fill in every value.\n`
    );
  }
  return val.trim();
}

// ─── Firebase client config (safe to expose — NEXT_PUBLIC_) ──────────────────
// These are inlined by Next.js at build time; validated lazily via getter so
// they work in both server components and client components.
export const firebaseClientConfig = {
  get apiKey() { return get('NEXT_PUBLIC_FIREBASE_API_KEY'); },
  get authDomain() { return get('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'); },
  get projectId() { return get('NEXT_PUBLIC_FIREBASE_PROJECT_ID'); },
  get storageBucket() { return get('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'); },
  get messagingSenderId() { return get('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'); },
  get appId() { return get('NEXT_PUBLIC_FIREBASE_APP_ID'); },
};

// ─── Firebase Admin (server-side only — NEVER expose) ────────────────────────
export const firebaseAdminConfig = {
  get projectId() { return get('FIREBASE_ADMIN_PROJECT_ID'); },
  get clientEmail() { return get('FIREBASE_ADMIN_CLIENT_EMAIL'); },
  // Support both real newlines and escaped \n in the .env value
  get privateKey() {
    return get('FIREBASE_ADMIN_PRIVATE_KEY').replace(/\\n/g, '\n');
  },
};

// ─── NextAuth ─────────────────────────────────────────────────────────────────
export const nextAuthConfig = {
  get secret() { return get('NEXTAUTH_SECRET'); },
  get url() { return get('NEXTAUTH_URL'); },
};

// ─── Google OAuth ─────────────────────────────────────────────────────────────
export const googleConfig = {
  get clientId() { return get('GOOGLE_CLIENT_ID'); },
  get clientSecret() { return get('GOOGLE_CLIENT_SECRET'); },
};
