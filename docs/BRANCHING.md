# Branching workflow

## Branches

| Branch | Purpose |
|--------|---------|
| **`main`** | Production — protected |
| **`f1`** | Feature work (runbook, promos, experiments) |
| **`f*` / `feature/*`** | New features — branch off `main` |

## `main` is protected

Only **@akhilvydyula** can bypass rules and push directly to `main`.

Everyone else (collaborators) must:

1. Branch from `main` (e.g. `f1`, `feature/coach-v2`)
2. Open a **pull request**
3. Pass **CI** (web, Android, SaaS builds)
4. Get **1 approving review** before merge

Rules: [Repository rules](https://github.com/akhilvydyula/oss-goalos-ai/rules/18102360)

## Quick start

```bash
git checkout main
git pull origin main
git checkout -b f2          # your feature branch
# ... work ...
git push -u origin f2
gh pr create --base main --head f2
```

## Owner direct push (you only)

```bash
git checkout main
git merge f1
git push origin main        # bypass allowed for akhilvydyula
```

Config files in `.github/`:

- `ruleset-protect-main.json` — GitHub ruleset (owner bypass)
- `branch-protection-main.json` — legacy format (orgs only; kept for reference)
