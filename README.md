# Birdie Quest

A personal golf tracking web app — log rounds, track achievements, compute a rough handicap, and see your best scores per hole per course.

Built to be free-tier friendly: React + Vite frontend deployed to GitHub Pages, with Firebase (Auth + Firestore) as the backend on the Spark free plan.

## Features

- Email/password accounts (Firebase Auth)
- Log rounds with date, course, and per-hole scores
- Preset courses (defined in code) or custom course entry
- Optional per-hole stats: putts, out-of-bounds, greens in regulation
- Simplified handicap calculation
- Round history + per-round detail view
- Best score per hole per course
- Achievement system that evaluates each new round

## Setup

### 1. Install dependencies

```
npm install
```

### 2. Create a Firebase project

1. Go to https://console.firebase.google.com/ and create a new project. Disable Google Analytics — you don't need it.
2. In the new project, add a **Web app** (`</>` icon). Give it any nickname. Skip the hosting option. Firebase will show you a `firebaseConfig` object — keep this tab open, you'll copy values from it in a moment.
3. In the left sidebar, open **Build → Authentication**, click "Get started", and enable the **Email/Password** provider.
4. Open **Build → Firestore Database**, click "Create database", pick a location, and start in **production mode**.
5. In Firestore, go to the **Rules** tab and replace the rules with:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```

   Click **Publish**. This limits each user's data to their own subtree.

### 3. Local env

Copy `.env.example` to `.env.local` and paste the values from the Firebase web app config:

```
cp .env.example .env.local
```

### 4. Run locally

```
npm run dev
```

Open http://localhost:5173, click **Sign up**, and log your first round.

## Deploy to GitHub Pages

1. Push this repo to GitHub. The default repo name is `scorePulse` — if you use a different name, edit `base` in `vite.config.js` to match (`/<repo-name>/`).
2. In your GitHub repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Go to **Settings → Secrets and variables → Actions** and add these repository secrets (values from `.env.local`):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Push to `main`. The workflow in `.github/workflows/deploy.yml` will build and deploy automatically.
5. Back in Firebase → Authentication → **Settings → Authorized domains**, add your Pages domain (e.g. `<username>.github.io`) so login works from the deployed site.

The API key in a Firebase web app is safe to expose — access is controlled by your Firestore rules, not the key.

## Customizing courses

Edit `src/data/courses.js`. Each course is:

```js
{
  id: 'my-course',                // unique, don't rename after use
  name: 'My Home Course',
  pars: [4,4,3,5,4,4,3,4,5,4,3,4,5,4,4,3,4,5],  // 9 or 18 entries
  tees: [                         // one entry per set of tees
    { id: 'blue',  name: 'Blue',  rating: 71.2, slope: 128 },
    { id: 'white', name: 'White', rating: 69.5, slope: 122 },
    { id: 'red',   name: 'Red',   rating: 68.0, slope: 115 },
  ],
}
```

Each tee carries its USGA **course rating** (a decimal like `71.2`) and **slope
rating** (an integer 55–155; 113 is average), taken from the scorecard. The
handicap uses these, so put in real values — the ones shipped in `courses.js`
are placeholders. When logging a round the golfer picks the tee they played,
and the round stores a snapshot of that tee's ratings.

Users can also pick "Custom course" in the Add Round form to enter a course
ad-hoc without editing code; they're prompted for the tee name plus its course
and slope rating so the round can still count toward the handicap.

## Customizing achievements

Edit `src/data/achievements.js`. Each achievement is:

```js
{
  id: 'unique-slug',              // used as Firestore doc id, don't rename after earned
  name: 'Display Name',
  description: 'Shown to the user',
  check: (round, allRounds) => /* return true if earned */,
}
```

The `check` function is called each time a round is submitted:
- `round` is the just-saved round: `{ date, courseName, holes: [{ par, score, putts?, ob?, gir? }], totalScore, totalPar }`
- `allRounds` is the array of previously-saved rounds (does NOT include the new one)

Examples:

```js
// Break 80 on 18 holes
check: (round) => round.holes.length === 18 && round.totalScore < 80

// First eagle
check: (round) => round.holes.some((h) => h.score === h.par - 2)

// 10 rounds logged
check: (round, all) => all.length + 1 >= 10

// Any hole-in-one
check: (round) => round.holes.some((h) => h.score === 1)
```

Achievements are re-evaluated only on new rounds. If you add new achievements after already logging rounds, they won't retroactively unlock — log another round or clear/re-add them to test.

## Handicap

Each round's score differential uses the World Handicap System formula
`(113 / slope) × (score − course rating)`, taken from the tee played. The
handicap is the average of the best ~40% (up to 8) of your last 20 18-hole
rounds' differentials, and requires at least 3 eligible rounds.

Rounds logged before tees were tracked (and customs entered without ratings)
fall back to a raw `score − par` differential so they still contribute. The
best-of selection is a simplification of the official WHS "lowest 8 of 20"
table, but combined with real course/slope ratings it tracks closely for casual
play. Incomplete, scramble, and par-3 rounds are excluded.

## Tech stack

- React 18 + Vite
- react-router-dom (HashRouter, so it works on GitHub Pages without a 404.html shim)
- Firebase Auth + Firestore (free Spark tier)
- No CSS framework — plain CSS in `src/styles.css`
