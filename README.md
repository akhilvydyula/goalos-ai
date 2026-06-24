# GoalOS AI

<p align="center">
  <strong>Turn screen time into goal time.</strong>
</p>

<p align="center">
  Open-source AI productivity personality OS — web demo + native Android app.
</p>

<p align="center">
  <a href="https://github.com/akhilvydyula/oss-goalos-ai/actions/workflows/ci.yml"><img src="https://github.com/akhilvydyula/oss-goalos-ai/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <img src="https://img.shields.io/badge/deploy-Cloudflare%20Pages-F38020?style=flat&logo=cloudflare" alt="Cloudflare Pages" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="https://github.com/akhilvydyula/oss-goalos-ai/issues"><img src="https://img.shields.io/github/issues/akhilvydyula/oss-goalos-ai" alt="Issues" /></a>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="docs/ARCHITECTURE.md">Architecture</a> ·
  <a href="docs/DEPLOYMENT.md">Deploy (Cloudflare)</a> ·
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

---

## 📸 Preview

<p align="center">
  <img src="goalos-web/public/media/web-preview.png" alt="GoalOS web dashboard" width="720" />
</p>

<p align="center">
  <img src="goalos-web/public/media/coach-preview.png" alt="GoalOS AI Coach" width="320" />
  &nbsp;
  <img src="goalos-web/public/media/android-preview.png" alt="GoalOS Android app" width="320" />
</p>

<p align="center"><em>Web dashboard · AI Coach · Android companion</em></p>

---

GoalOS AI helps you align daily screen time with your goals through scoring, AI coaching, intent checks, and focus sprints. **Local-first** — your data stays on your device.

## ✨ Features

| Feature | Web | Android |
|---------|:---:|:-------:|
| Goal setup + Productivity DNA | ✅ | ✅ |
| Goal Alignment Score (v1) | ✅ | ✅ |
| Interactive AI Coach | ✅ | ✅ |
| Intent Gate | ✅ | ✅ |
| Focus Sprint timer | ✅ | ✅ |
| Weekly identity & insights | ✅ | ✅ |
| Profile with avatar | ✅ | ✅ |
| Real usage tracking | Demo | ✅ UsageStats |
| Browser AI (WebLLM, no API key) | ✅ | — |

## 📦 Projects

| Directory | Stack | Description |
|-----------|-------|-------------|
| [**goalos-web**](./goalos-web) | Next.js 16, React 19, Tailwind v4 | Premium web UI — runs in browser, no backend |
| [**goalos-android**](./goalos-android) | Kotlin, Jetpack Compose | Native Android with real screen-time tracking |

## 🚀 Quick start

### Web (fastest)

```bash
git clone https://github.com/akhilvydyula/oss-goalos-ai.git
cd oss-goalos-ai
npm run dev
```

Open **http://localhost:3000**

### Android

```bash
cd goalos-android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Or open `goalos-android/` in Android Studio and press **Run**.

→ Full setup: [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md)

## 🔄 Core loop

```
Goal Setup → Productivity DNA → Usage Tracking → Alignment Score
     → AI Coach → Intent Gate → Focus Sprint → Weekly Identity
```

## 📖 Documentation

| Doc | Description |
|-----|-------------|
| [Getting Started](./docs/GETTING_STARTED.md) | Install & run web + Android |
| [Architecture](./docs/ARCHITECTURE.md) | System design, data flow, scoring |
| [Deployment](./docs/DEPLOYMENT.md) | Cloudflare Pages, Android releases |
| [Contributing](./CONTRIBUTING.md) | How to contribute |
| [Code of Conduct](./CODE_OF_CONDUCT.md) | Community guidelines |
| [Security](./SECURITY.md) | Vulnerability reporting |

## 🛠 CI/CD

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| [**CI**](./.github/workflows/ci.yml) | Push / PR to `main` | Web lint + build, Android APK |
| [**Cloudflare Pages**](./.github/workflows/cloudflare-pages.yml) | Push to `main` (optional) | Deploy web to Cloudflare |
| [**Release**](./.github/workflows/release.yml) | Tag `v*.*.*` | GitHub Release + APK artifact |

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md).

1. Fork the repo
2. Create a feature branch
3. Run tests locally
4. Open a PR

## 📄 License

[MIT](./LICENSE) © Akhil Vydyula and contributors — free for personal and commercial use.

## 🔗 Links

- **Live demo:** https://akhilvydyula.github.io/oss-goalos-ai/
- **Web demo:** https://akhilvydyula.github.io/oss-goalos-ai/web/
- **Mobile demo:** https://akhilvydyula.github.io/oss-goalos-ai/mobile/
- **Repository:** https://github.com/akhilvydyula/oss-goalos-ai
- **Issues:** https://github.com/akhilvydyula/oss-goalos-ai/issues
- **SaaS architecture:** [docs/SAAS_ARCHITECTURE.md](docs/SAAS_ARCHITECTURE.md)
- **Web app docs:** [goalos-web/README.md](./goalos-web/README.md)
- **Android docs:** [goalos-android/README.md](./goalos-android/README.md)
