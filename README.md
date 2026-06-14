# Core Java Prep

A premium interview-prep dashboard for Java backend engineers (3–6 yrs) preparing to switch.
178 curated questions across 14 topics, practice flashcards, a live Java console, and a daily streak tracker.

## Run locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

This starts Vite and opens the app at http://localhost:5173.

## Build for production

```bash
npm run build      # outputs static files to dist/
npm run preview    # serve the production build locally
```

## Features

- **Dashboard** — overall mastery gauge, per-topic progress, market-research insights, and a CV-tailored plan.
- **Question bank** — 178 questions. Click the circle to cycle new → learning → mastered. Expand for talking points, code, and personal notes. Filter by topic, difficulty, company type, and status; full-text search.
- **Practice** — flashcard self-test that can focus on not-yet-mastered cards.
- **Java console** — write and run real Java (compiles/executes via the public Piston API at emkc.org, so it needs internet access).
- **Daily tracker** — calendar to tick each study day, with current/longest streaks.

## Notes

- **Persistence:** progress, notes, bookmarks, and the tracker are saved in your browser's `localStorage`, so they persist across reloads on the same browser/profile. Clearing site data resets them.
- **Java console** requires an internet connection (it calls a public execution service). Your code is sent to that service to run, so don't paste secrets.
- Fonts (Inter, JetBrains Mono) load from Google Fonts; without internet the app falls back to system fonts.

## Tech

React 18 + Vite. Icons by lucide-react. Single-component app in `src/App.jsx`.
