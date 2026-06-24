# Contributing to GoalOS AI

Thank you for your interest in contributing! GoalOS AI is an open-source productivity OS — we welcome bug fixes, UI improvements, and feature PRs.

## Getting started

```bash
git clone https://github.com/YOUR_USERNAME/goalos-ai.git
cd goalos-ai/goalos-web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## Project structure

```
goalos-web/src/
├── app/           # Next.js app router
├── components/    # UI components
├── hooks/         # React hooks (useGoalOS)
└── lib/           # Scoring, coach engine, types, storage
```

## Pull request guidelines

1. Keep PRs focused — one feature or fix per PR
2. Match existing code style and design tokens (`globals.css`)
3. Run `npm run build` and `npm run lint` before submitting
4. Update README if you add user-facing features

## Android companion

The native Android app lives in `../goalos-android`. Cross-platform changes to scoring/coach logic should stay in sync when possible.

## Questions

Open a GitHub issue for bugs, feature requests, or architecture discussions.
