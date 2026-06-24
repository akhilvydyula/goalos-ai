# GoalOS AI — Web

<p align="center">
  <strong>Turn screen time into goal time.</strong>
</p>

<p align="center">
  AI-powered productivity personality OS — open source web demo with premium dark-glass UI.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="#features">Features</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

---

GoalOS AI helps you align daily screen time with your goals through scoring, coaching, intent checks, and focus sprints. This web app is a **local-first demo** — data stays in your browser. The companion [Android app](../goalos-android) adds real usage tracking via `UsageStatsManager`.

## Features

| Module | Status |
|--------|--------|
| Goal setup + Productivity DNA quiz | ✅ |
| Privacy-first onboarding | ✅ |
| Goal Alignment Score (v1 formula) | ✅ |
| Today dashboard with metrics | ✅ |
| **Interactive AI Coach chat** | ✅ |
| Intent Gate | ✅ |
| Focus Sprint timer | ✅ |
| Weekly insights + identity | ✅ |
| Privacy center (export/delete) | ✅ |
| Responsive desktop shell + phone frame | ✅ |

## Quick start

```bash
cd goalos-web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm start
```

For [Render](https://render.com) or similar hosts, bind to `0.0.0.0:$PORT`.

## Screenshots

> Add screenshots after your first deploy — recommended: Today dashboard, Coach chat, Onboarding.

## Architecture

```
goalos-web/
├── src/app/              # Next.js pages + global styles
├── src/components/       # UI: onboarding, dashboard, tabs, layout
├── src/hooks/            # useGoalOS state management
└── src/lib/              # Scoring engine, coach chat, storage, types
```

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · lucide-react

**State:** `localStorage` (demo). No backend required.

## Goal Alignment Score

Implements the v1 product formula:

- Goal-supporting time (30 pts)
- Roadmap completion (20 pts)
- Deep work (15 pts)
- Intent match (15 pts)
- Wellness balance (10 pts)
- Distraction / late-night / context-switch penalties

See `src/lib/scoring.ts`.

## AI Coach

The coach uses a **rule-based engine** (`src/lib/coach.ts`) driven by your score, Productivity DNA, and app classifications. It supports:

- Opening context messages
- Interactive chat with suggested prompts & actions
- Score-aware replies (tomorrow plan, night scrolling, sprints)

Optional `OPENAI_API_KEY` support is planned for LLM-enhanced coaching.

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Optional — future LLM coaching |

## Monorepo

| Directory | Description |
|-----------|-------------|
| `goalos-web/` | This web app (Next.js) |
| `goalos-android/` | Native Android app (Kotlin + Compose) |

## License

[MIT](LICENSE) — free for personal and commercial use.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). PRs welcome!
