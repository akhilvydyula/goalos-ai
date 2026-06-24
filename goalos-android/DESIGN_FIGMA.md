# Figma ↔ Android Design Reference

**Figma file:** [GoalOS AI — Mobile App UI/UX Prototype](https://www.figma.com/design/RpMP9nXWIuBYc3rQAZQQ3o/GoalOS-AI-%E2%80%94-Mobile-App-UI-UX-Prototype?node-id=0-1)

## Current status

| Item | Status |
|------|--------|
| Figma file accessible | ✅ |
| Figma screens populated | ❌ Page 1 is empty (0×0) |
| Code Connect mappings | ❌ Requires Figma Org/Enterprise seat |
| Android design tokens | ✅ `GoalOSTokens.kt` |
| Notion design spec applied | ✅ Page 12 |

Until screens are added in Figma, the Android app follows:

1. [Notion UI/UX Design System](https://app.notion.com/p/387f3d17ece7815480d5d01c941d7c6a) (page 12)
2. `goalos-web/` web prototype (visual reference)

## Component mapping (for future Code Connect)

When Figma components are published, map them to:

| Figma component (planned) | Android Compose |
|---------------------------|-----------------|
| Goal Alignment Score Card | `ScoreCard()` |
| AI Next Best Action Card | `TodayScreen` action card |
| Stat Card (Goal time / Distracted) | `StatCard()` |
| Risk Window Card | `TodayScreen` risk block |
| Weekly Identity Card | `WeeklyIdentityCard()` |
| Primary Button | `PrimaryButton()` |
| Bottom Navigation | `GoalOSApp` NavigationBar |
| Intent Gate Modal | `IntentGateDialog()` |
| Focus Sprint Modal | `FocusSprintDialog()` |

## Design tokens

Defined in `app/src/main/java/com/goalos/ai/ui/theme/GoalOSTokens.kt`:

- Background `#07080F`
- Primary `#A78BFA`
- Secondary `#34D399`
- Score colors: green ≥80, amber ≥60, rose <60

## Next steps for Figma sync

1. Add mobile screens to the Figma file (390×844 frames)
2. Share a **node-specific URL** per screen (e.g. `?node-id=12-34`)
3. Upgrade to Figma Org/Enterprise for Code Connect, OR
4. Use `get_design_context` per screen to refine Compose UI
