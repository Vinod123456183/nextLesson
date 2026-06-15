## Project Screenshots

![1](Project%20Screenshots/1.png)
![2](Project%20Screenshots/2.png)
![3](Project%20Screenshots/3.png)
![4](Project%20Screenshots/4.png)
![5](Project%20Screenshots/5.png)
![6](Project%20Screenshots/6.png)

# nextLesson

A community platform where people share real lessons, tips, and mistakes — tagged by topic so others can search and learn.

## Features

- Google sign-in (OAuth)
- Write posts: Lesson / Tip / Mistake
- Tag with up to 5 topics (career, love, trading, health, etc.)
- Filter feed by tag
- Like posts (with optimistic UI)
- View counts
- User profiles with post stats
- Author edit , delete

---

## Stack

| Layer     | Tech                    |
| --------- | ----------------------- |
| Framework | Next.js 14 (App Router) |
| Language  | TypeScript              |
| Styling   | Tailwind CSS            |
| Database  | Firebase Firestore      |
| Auth      | NextAuth.js + Google    |
| Hosting   | Vercel (recommended)    |

---

## Local Setup

### Step 1 — Install dependencies

```bash
npm install
```

### Step 2 — Create a Firebase project

1. Go to https://console.firebase.google.com
2. Click **Add project** and follow the steps
3. Go to **Build → Firestore Database** → Create database → choose **Production mode** → pick a region
4. Go to **Project settings** (gear icon) → **General** → scroll to **Your apps** → click **</>** (Web)
   - Register the app (any nickname)
   - Copy the config values — you'll need them for `.env.local`

### Step 3 — Get a Firebase Admin service account key

1. Still in Project settings → click **Service accounts** tab
2. Click **Generate new private key** → confirm → a JSON file downloads
3. Open the JSON — you'll need `project_id`, `client_email`, and `private_key`

### Step 4 — Create Google OAuth credentials

1. Go to https://console.cloud.google.com
2. Select your Firebase project from the top dropdown
3. Go to **APIs & Services → Credentials → + Create credentials → OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Add these **Authorised redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   https://YOUR-DOMAIN.vercel.app/api/auth/callback/google
   ```
6. Click Create → copy the **Client ID** and **Client Secret**

### Step 5 — Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in every value. The file has comments explaining where each value comes from.

Generate `NEXTAUTH_SECRET`:

```bash
# Mac/Linux
openssl rand -base64 32

# Windows (PowerShell)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 6 — Deploy Firestore rules and indexes

```bash
npm install -g firebase-tools
firebase login
firebase use --add          # select your project
firebase deploy --only firestore
```

This sets up security rules (all writes go through server-side API routes) and composite indexes for tag/type/date filtering.

### Step 7 — Run locally

```bash
npm run dev
```

Open http://localhost:3000 — sign in with Google and start writing.

---

## Deploy to Vercel

1. Push your code to a GitHub repo
2. Go to https://vercel.com → **New Project** → import your repo
3. In **Environment Variables**, add every key from your `.env.local`
4. Change `NEXTAUTH_URL` to your Vercel domain (e.g. `https://nextLesson.vercel.app`)
5. Add the Vercel domain to your Google OAuth redirect URIs (Step 4 above)
6. Click **Deploy**

---

## Project Structure

```
nextLesson/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   │   ├── posts/                # GET feed, POST create
│   │   │   ├── posts/[id]/           # GET, DELETE single post
│   │   │   ├── posts/[id]/like/      # Like toggle
│   │   │   ├── profile/[uid]/        # User profile + posts
│   │   │   └── tags/                 # Popular tags
│   │   ├── auth/
│   │   │   ├── signin/               # Google sign-in page
│   │   │   └── error/                # Auth error page
│   │   ├── post/[id]/                # Single post view + delete
│   │   ├── profile/[uid]/            # User profile page
│   │   ├── search/                   # Search / filter page
│   │   ├── write/                    # Create post form
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home feed
│   ├── components/
│   │   ├── layout/Navbar.tsx
│   │   └── ui/PostCard.tsx, TagFilter.tsx
│   ├── lib/
│   │   ├── env.ts            # All env vars (single source of truth)
│   │   ├── firebase.ts       # Firebase client SDK
│   │   ├── firebase-admin.ts # Firebase Admin SDK (server only)
│   │   ├── auth.ts           # NextAuth config
│   │   ├── rate-limit.ts     # In-memory rate limiter
│   │   └── validate.ts       # Input validation + sanitisation
│   └── types/
│       ├── index.ts          # Shared types (Post, UserProfile, Tags)
│       └── next-auth.d.ts    # Session type augmentation
├── firestore.rules           # Security rules — deploy to Firebase
├── firestore.indexes.json    # Composite indexes — deploy to Firebase
├── firebase.json             # Firebase CLI config
├── .env.example              # Environment variable template
└── README.md
```

---

## Security

| Concern                                 | Solution                                               |
| --------------------------------------- | ------------------------------------------------------ |
| All DB writes are authenticated         | API routes use Firebase Admin SDK + `getServerSession` |
| Firestore rules block all client writes | `allow write: if false` for all collections            |
| Input sanitisation                      | Strips HTML, JS URIs, event handlers                   |
| Input validation                        | Server-side length + type + tag checks                 |
| Rate limiting                           | 10 posts/hour, 60 likes/minute per user                |
| Author-only delete                      | Server checks `post.authorId === session.user.id`      |
| Emails never exposed                    | Stripped before any public API response                |
| Security HTTP headers                   | X-Frame-Options, CSP, nosniff, etc.                    |
| Secrets never committed                 | `.env.local` is in `.gitignore`                        |

---

## Scaling Notes

- **Rate limiting** — currently in-memory (resets on server restart). For production at scale, swap `src/lib/rate-limit.ts` for [Upstash Redis](https://upstash.com/) — free tier works with Vercel.
- **Feed pagination** — the API supports cursor-based pagination (`?cursor=<createdAt>&limit=20`). Implement infinite scroll on the client by reading `nextCursor` from `GET /api/posts`.
- **Caching** — add `export const revalidate = 60;` to server-page files to cache at the CDN level for 60 seconds.
- **Firestore indexes** — all composite indexes are in `firestore.indexes.json`. Always run `firebase deploy --only firestore` before going live.
