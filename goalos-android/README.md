# GoalOS AI — Native Android App

Kotlin + Jetpack Compose mobile app per your Notion CTO architecture spec.

## Features

- Goal setup + Productivity DNA onboarding
- **Real app usage tracking** via `UsageStatsManager`
- Goal Alignment Score (v1 formula)
- AI Coach recommendations
- Intent Gate before distracting apps
- Focus Sprint timer
- Weekly identity + profile
- DataStore persistence (local-first)

## Requirements

- [Android Studio](https://developer.android.com/studio) Ladybug (2024.2+) or newer
- Android SDK 35
- Physical Android device or emulator (API 26+)

## Run on your phone

1. Open **Android Studio** → **Open** → select the `goalos-android` folder
2. Wait for Gradle sync to finish
3. Connect your Android phone with **USB debugging** enabled, or start an emulator
4. Click **Run** (green play button)

## Grant Usage Access (required for real tracking)

After onboarding:

1. Tap **Open Usage Settings** on the Today screen
2. Find **GoalOS AI** in the list and enable **Permit usage access**
3. Return to the app — real app usage will appear

## Project structure

```
goalos-android/
├── app/src/main/java/com/goalos/ai/
│   ├── domain/          # Scoring, coach, models
│   ├── data/            # DataStore, UsageStatsManager
│   ├── ui/              # Compose screens
│   └── GoalOSViewModel.kt
```

## Build APK from command line

After opening once in Android Studio (generates Gradle wrapper):

```bash
cd goalos-android
./gradlew assembleDebug
```

APK output: `app/build/outputs/apk/debug/app-debug.apk`

Transfer to your phone and install, or use `adb install app-debug.apk`.

## Stack

| Layer | Tech |
|-------|------|
| Language | Kotlin |
| UI | Jetpack Compose + Material 3 |
| Storage | DataStore |
| Usage | UsageStatsManager |
| Min SDK | 26 (Android 8.0) |

## Related

- Web prototype: `../goalos-web/`
- Product docs: [Notion Hub](https://app.notion.com/p/387f3d17ece781ff90b1cfbd7439675f)
