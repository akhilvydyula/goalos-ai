# GoalOS AI — Web

<p align="center">
  <strong>Turn screen time into goal time.</strong>
</p>

<p align="center">
  AI-powered productivity personality OS — open source web demo with premium dark-glass UI.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="https://oss-goalos-ai.akhilvydyula1111.workers.dev/">Live demo</a> ·
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

Open [http://localhost:3000](http://localhost:3000) or the [live demo](https://oss-goalos-ai.akhilvydyula1111.workers.dev/).

### Production build

```bash
npm run build
```

Static output is in `out/` — deployed to [Cloudflare Workers](https://oss-goalos-ai.akhilvydyula1111.workers.dev/). See [Deployment](../docs/DEPLOYMENT.md).

## Screenshots & promo media

| Asset | Path |
|-------|------|
| Hero banner | `public/media/readme/hero-banner.png` |
| Quick teaser video (~8s) | `public/media/readme/goalos-promo.mp4` |
| Cinematic promo (~49s) | `public/media/readme/goalos-cinematic-promo.mp4` |
| Web dashboard | `public/media/readme/app-dashboard.png` |
| AI Coach | `public/media/readme/app-coach.png` |
| Mobile demo | `public/media/readme/app-mobile.png` |
| Android app | `public/media/readme/app-android.png` |

<p align="center">
  <img src="public/media/readme/hero-banner.png" alt="GoalOS AI" width="800" />
</p>

<p align="center">
  <video src="public/media/readme/goalos-promo.mp4" width="640" autoplay muted loop playsinline></video>
</p>

The [landing page](http://localhost:3000) includes an auto-playing product walkthrough and screenshot gallery.

Regenerate promo videos: `npm run build:cinematic-promo` · Import concept art: `python scripts/import-readme-media.py <folder>`

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

The coach uses **WebLLM** — a small language model that runs **entirely in your browser** via WebGPU. No API keys, no server, no Docker.

- First visit to the Coach tab downloads ~600MB (cached afterward)
- Works best in **Chrome** or **Edge** with WebGPU
- Falls back to smart rule-based replies if WebGPU is unavailable

See `src/lib/web-llm-coach.ts` and `src/lib/coach.ts`.

## Environment variables

No environment variables required for the demo.

## Monorepo

| Directory | Description |
|-----------|-------------|
| `goalos-web/` | This web app (Next.js) |
| `goalos-android/` | Native Android app (Kotlin + Compose) |

## Contributing

See the [monorepo contributing guide](../CONTRIBUTING.md). PRs welcome!

## License

[MIT](../LICENSE) — free for personal and commercial use.
