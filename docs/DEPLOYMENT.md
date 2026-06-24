# Deployment

GoalOS web deploys to **Cloudflare Pages** as a static export (`goalos-web/out`).

## Cloudflare Pages

### Connect Git (recommended)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Select repo `oss-goalos-ai`
3. Build settings:

| Setting | Value |
|---------|-------|
| Production branch | `main` |
| Root directory | `goalos-web` |
| Build command | `npm run build` |
| Output directory | `out` |
| Node.js version | `20` |

4. Deploy — every push to `main` auto-redeploys.

### Optional environment variables

| Variable | When |
|----------|------|
| `NEXT_PUBLIC_API_URL` | Only if you run the SaaS API locally or on a host. Demo auth works offline without it. |

### Custom domain

Project → **Custom domains** → add your domain. HTTPS is automatic when the zone is on Cloudflare.

### GitHub Actions deploy (optional)

Workflow: [`.github/workflows/cloudflare-pages.yml`](../.github/workflows/cloudflare-pages.yml)

1. Create Pages project `goalos-ai` in Cloudflare
2. Add secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
3. Set repo variable: `ENABLE_CLOUDFLARE_PAGES` = `true`

### Repo config

| File | Purpose |
|------|---------|
| `goalos-web/wrangler.toml` | Wrangler / CLI deploy |
| `goalos-web/public/_redirects` | Trailing-slash route fixes |
| `goalos-web/public/_headers` | CDN cache headers |
| `goalos-web/.node-version` | Node 20 for builds |

### Smoke test

- [ ] `/` — landing page
- [ ] `/login/` — demo sign-in
- [ ] `/web/` — product demo
- [ ] `/app/` — enterprise shell
- [ ] Coach tab responds (rule-based or WebLLM)

---

## Android — GitHub Releases

```bash
git tag v0.3.0
git push origin v0.3.0
```

The [release workflow](../.github/workflows/release.yml) attaches `app-debug.apk` to the GitHub Release.

---

## CI/CD

```
Push/PR → main
    └── ci.yml — web lint + build, Android APK

Tag v*.*.*
    └── release.yml — GitHub Release + APK
```

Push to `main` also deploys web via Cloudflare Pages (Git integration or Actions workflow above).
