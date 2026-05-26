# static 📻

> your page. your rules.

A social platform built for authenticity — chronological feeds, customisable vocabulary, retro image filters, guestbooks, blast messages, and zero algorithmic interference.

---

## stack

- **React + Vite** — fast dev server, instant hot reload
- **Supabase** — auth, database, real-time, image storage (all free tier)
- **Vercel** — one-click deployment

---

## quick start (local)

### 1. clone and install

```bash
git clone <your-repo>
cd static-app
npm install
```

### 2. set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New project** — give it a name, pick a region, set a database password
3. Once it's ready, go to **SQL Editor → New query**
4. Copy and paste the entire contents of `schema.sql` and click **Run**
5. Go to **Storage → New bucket**, name it `post-images`, and turn **Public** ON
6. In Storage → post-images → **Policies**, add a policy:
   - Name: `Users can upload their own images`
   - Operation: `INSERT`
   - Role: `authenticated`
   - WITH CHECK: `(auth.uid()::text = (storage.foldername(name))[1])`

### 3. add your credentials

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

Find both values in Supabase → **Settings → API**.

### 4. run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## deploy to Vercel (free, ~2 minutes)

### option A — GitHub (recommended)

1. Push your code to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Vercel auto-detects Vite — no config needed
4. Add your environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy** ✓

### option B — Vercel CLI

```bash
npm i -g vercel
vercel
# follow the prompts, then add env vars in the Vercel dashboard
```

---

## features

| Feature | Description |
|---|---|
| **Custom vocabulary** | Rename "likes" and "followers" to whatever you want |
| **Like visibility** | Control who sees your like count and for how long |
| **Interest feeds** | Create named feeds based on topic tags, switch between them |
| **Blast messages** | Send a timed banner notification to your followers |
| **Image filters** | 8 retro filters (digicam, y2k, vhs, lo-fi, faded, mono, tungsten) |
| **Guestbook** | A MySpace-style message wall on every profile |
| **Mood stamps** | React to posts with moods instead of generic likes |
| **Chronological** | Zero algorithm — newest posts always at the top |

---

## project structure

```
static-app/
├── index.html              ← Vite entry point
├── vite.config.js
├── package.json
├── vercel.json             ← SPA routing fix
├── schema.sql              ← Run this in Supabase SQL Editor
├── .env.example            ← Copy to .env.local
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── lib/
    │   └── supabase.js     ← All DB helpers
    ├── context/
    │   └── AuthContext.jsx
    ├── components/
    │   ├── Nav.jsx
    │   ├── BlastBanner.jsx
    │   ├── PostCard.jsx
    │   ├── CreatePost.jsx
    │   ├── FeedSwitcher.jsx
    │   ├── ImageFilterPicker.jsx
    │   └── Guestbook.jsx
    └── pages/
        ├── AuthPage.jsx
        ├── OnboardingPage.jsx
        ├── HomePage.jsx
        ├── ProfilePage.jsx
        └── SettingsPage.jsx
```

---

## renaming the platform

Search and replace `static` with your chosen name in:
- `index.html` (title tag)
- `src/pages/AuthPage.jsx` (the big heading)
- `src/pages/HomePage.jsx` (the nav heading)
- `README.md`

---

## next steps to add

- [ ] Search / discover page
- [ ] Direct messages
- [ ] Profile background image upload
- [ ] Custom CSS themes for profiles
- [ ] Close friends list management
- [ ] Email notifications
