# Deployment

**Production:** https://oss-goalos-ai.akhilvydyula1111.workers.dev/

GoalOS web is a **static export** deployed to **Cloudflare Workers Static Assets** (`goalos-web/out`).

## Workers Builds (your current setup)

You connected a **Worker** (not classic Pages). Workers Builds has **no “output directory” field** in the dashboard — the static folder is set in **`wrangler.toml`**:

```toml
[assets]
directory = "./goalos-web/out"
```

### Dashboard settings (repo root `/`)

| Setting | Value |
|---------|-------|
| Git repository | `akhilvydyula/oss-goalos-ai` |
| Root directory | `/` (repo root) |
| Build command | `npm run build` |
| **Deploy command** | `npx wrangler deploy` |
| Version command | *(optional)* `npx wrangler versions upload` |
| Production branch | `main` |

`wrangler.toml` at repo root points deploy at `./goalos-web/out`. The `name` field must match your Worker name in the dashboard (`oss-goalos-ai`).

### Cleaner alternative — root directory `goalos-web`

| Setting | Value |
|---------|-------|
| Root directory | `goalos-web` |
| Build command | `npm ci && npm run build` |
| Deploy command | `npx wrangler deploy` |

Uses `goalos-web/wrangler.toml` with `directory = "./out"` (avoids monorepo quirks).

### Troubleshooting

| Error | Fix |
|-------|-----|
| No “output directory” field | Normal for Workers — use `wrangler.toml` `[assets].directory` |
| `next: not found` | Use latest `main` — root `npm run build` installs `goalos-web` deps |
| Worker name mismatch | `wrangler.toml` `name` must equal dashboard Worker name |
| Workspace / detection error | Set root directory to `goalos-web`, or use assets-only `wrangler.toml` (no `[build]`) |
| Site 404 after deploy | Check `[assets].directory` matches where `next build` writes files |

### Optional environment variables

| Variable | When |
|----------|------|
| `NEXT_PUBLIC_API_URL` | Only if you run the SaaS API. Demo auth works offline without it. |

### Repo config

| File | Purpose |
|------|---------|
| `wrangler.toml` | Output path for repo-root builds (`./goalos-web/out`) |
| `goalos-web/wrangler.toml` | Output path when root directory is `goalos-web` |
| `goalos-web/public/_redirects` | Trailing-slash route fixes |
| `goalos-web/public/_headers` | CDN cache headers |

### Smoke test

Production base: https://oss-goalos-ai.akhilvydyula1111.workers.dev/

- [ ] `/` — landing page
- [ ] `/login/` — demo sign-in (`admin@demo.goalos` / `Demo1234!`)
- [ ] `/web/` — product demo
- [ ] `/app/` — enterprise shell

---

## Classic Cloudflare Pages (different product)

If you create a **Pages** project instead of a Worker, you *will* see **Build output directory** in the UI — set it to `goalos-web/out` (repo root) or `out` (if root is `goalos-web`). No deploy command needed.

---

## Android — GitHub Releases

```bash
git tag v0.3.0
git push origin v0.3.0
```

The [release workflow](../.github/workflows/release.yml) attaches `app-debug.apk` to the GitHub Release.
