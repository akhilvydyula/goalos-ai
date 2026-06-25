#!/usr/bin/env python3
"""Generate GoalOS promotional video with AI voiceover (edge-tts) + ffmpeg."""

from __future__ import annotations

import asyncio
import json
import subprocess
import sys
from pathlib import Path

import edge_tts
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / "public" / "media"
OUT = MEDIA / "linkedin"
SLIDES_DIR = OUT / "promo-slides"
AUDIO_DIR = OUT / "promo-audio"
W, H = 1920, 1080
BG = (7, 8, 15)
ACCENT = (43, 231, 168)
TEXT = (245, 247, 250)
MUTED = (160, 168, 192)
VOICE = "en-US-AndrewMultilingualNeural"
PAD_SEC = 0.6


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    names = ["segoeuib.ttf", "segoeui.ttf", "arialbd.ttf", "arial.ttf"]
    fonts_dir = Path("C:/Windows/Fonts")
    for name in names:
        path = fonts_dir / (name if bold or "bd" in name else name.replace("bd", ""))
        if path.exists():
            try:
                return ImageFont.truetype(str(path), size)
            except OSError:
                continue
    return ImageFont.load_default()


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_w: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def slide(
    filename: str,
    title: str,
    lines: list[str] | None = None,
    subtitle: str | None = None,
    badge: str | None = None,
) -> Path:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    title_f = font(72, bold=True)
    sub_f = font(40)
    body_f = font(36)
    badge_f = font(28, bold=True)

    y = 120
    if badge:
        draw.rounded_rectangle((80, y, 80 + draw.textlength(badge, font=badge_f) + 48, y + 56), radius=28, fill=(43, 231, 168, 40), outline=ACCENT, width=2)
        draw.text((104, y + 10), badge, font=badge_f, fill=ACCENT)
        y += 90

    for line in wrap(draw, title, title_f, W - 160):
        draw.text((80, y), line, font=title_f, fill=TEXT)
        y += 86

    if subtitle:
        y += 10
        for line in wrap(draw, subtitle, sub_f, W - 160):
            draw.text((80, y), line, font=sub_f, fill=ACCENT)
            y += 52

    if lines:
        y += 36
        for item in lines:
            bullet = f"  {item}"
            for line in wrap(draw, bullet, body_f, W - 200):
                draw.text((100, y), line, font=body_f, fill=MUTED)
                y += 48

    draw.line((80, H - 80, W - 80, H - 80), fill=(43, 231, 168, 80), width=2)
    draw.text((80, H - 58), "GoalOS AI  |  github.com/akhilvydyula/oss-goalos-ai", font=font(24), fill=MUTED)

    SLIDES_DIR.mkdir(parents=True, exist_ok=True)
    path = SLIDES_DIR / filename
    img.save(path)
    return path


def run(cmd: list[str], *, cwd: Path | None = None) -> None:
    subprocess.run(cmd, cwd=cwd, check=True)


def probe_duration(path: Path) -> float:
    out = subprocess.check_output(
        [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "json",
            str(path),
        ],
        text=True,
    )
    return float(json.loads(out)["format"]["duration"])


async def synthesize(text: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(text, VOICE, rate="-5%")
    await communicate.save(str(dest))


async def build_narration(clips: list[tuple[str, str]]) -> list[tuple[Path, float]]:
    """Return (audio path, scene duration including padding) per clip."""
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    timed: list[tuple[Path, float]] = []
    for i, (_, narration) in enumerate(clips, start=1):
        audio = AUDIO_DIR / f"{i:02d}.mp3"
        print(f"TTS {i}/{len(clips)}...")
        await synthesize(narration, audio)
        dur = probe_duration(audio) + PAD_SEC
        timed.append((audio, dur))
    return timed


def main() -> None:
    SLIDES_DIR.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)

    clips: list[tuple[Path, str]] = []

    clips.append((
        slide("01-intro.png", "GoalOS AI", subtitle="Turn screen time into goal time.", badge="OPEN SOURCE"),
        "Welcome to GoalOS AI. Turn screen time into goal time. "
        "An open-source productivity operating system, built for builders, students, and founders.",
    ))
    clips.append((
        slide(
            "02-why.png",
            "Why GoalOS?",
            lines=[
                "Your phone tracks every minute — but not whether it moves you toward your goals.",
                "Most productivity apps nag you. GoalOS aligns usage with intent.",
                "Local-first: your data stays on your device. No account required for the demo.",
                "MIT licensed — built for builders, students, and founders.",
            ],
        ),
        "Why GoalOS? Your phone tracks every minute, but not whether those minutes move you toward your goals. "
        "Most apps nag you. GoalOS aligns screen time with intent. It's local-first, so your data stays on your device. "
        "And it's MIT licensed — free for personal and commercial use.",
    ))
    clips.append((
        slide(
            "03-how-loop.png",
            "How the platform works",
            lines=[
                "1. Set a goal + Productivity DNA quiz",
                "2. Track usage (demo on web, real stats on Android)",
                "3. Get your daily Goal Alignment Score (0–100)",
                "4. AI Coach suggests your next best action",
                "5. Intent Gate pauses before distractions",
                "6. Focus Sprint → Weekly identity insights",
            ],
        ),
        "Here's how it works. Set a goal and complete the Productivity DNA quiz. "
        "Track your usage, get a daily Goal Alignment Score from zero to one hundred, "
        "and let the AI Coach suggest your next best action. "
        "The Intent Gate pauses you before distractions. "
        "Run Focus Sprints, then review your Weekly Identity insights.",
    ))

    for name, src, narration in [
        (
            "web-preview.png",
            MEDIA / "web-preview.png",
            "This is your Today dashboard — goals, score, and your next best action in one place.",
        ),
        (
            "coach-preview.png",
            MEDIA / "coach-preview.png",
            "The AI Coach runs in your browser with WebLLM. No API key required.",
        ),
        (
            "mobile-preview.png",
            MEDIA / "mobile-preview.png",
            "The web demo works beautifully on mobile too.",
        ),
        (
            "android-preview.png",
            MEDIA / "android-preview.png",
            "On Android, GoalOS uses real Usage Stats for accurate screen-time tracking.",
        ),
    ]:
        dest = SLIDES_DIR / name
        Image.open(src).convert("RGB").resize((W, H), Image.Resampling.LANCZOS).save(dest)
        clips.append((dest, narration))

    clips.append((
        slide(
            "04-stack.png",
            "What's inside",
            lines=[
                "Web: Next.js 16, React 19, Tailwind v4, WebLLM (browser AI, no API key)",
                "Android: Kotlin + Jetpack Compose + UsageStatsManager",
                "Enterprise path: auth, admin console, microservices (optional SaaS)",
                "Deploy: Cloudflare Workers static assets",
            ],
        ),
        "Under the hood: Next.js and React on the web, with browser-local AI. "
        "Kotlin and Jetpack Compose on Android. "
        "There's even an enterprise path with auth, admin console, and microservices when you need teams. "
        "Deploy the demo to Cloudflare Workers in minutes.",
    ))
    clips.append((
        slide(
            "05-contribute.png",
            "Contribute to open source",
            lines=[
                "Fork github.com/akhilvydyula/oss-goalos-ai",
                "Web: cd goalos-web && npm install && npm run dev",
                "Android: open goalos-android in Android Studio",
                "Pick an issue or propose a feature → open a PR",
                "CI runs lint + build on every push. MIT license — commercial use OK.",
            ],
            badge="CONTRIBUTORS WELCOME",
        ),
        "Want to contribute? Fork the repo on GitHub. "
        "Run the web app with npm install and npm run dev. "
        "Or open the Android project in Android Studio. "
        "Pick an issue, ship a pull request — CI runs lint and build on every push. "
        "MIT license means you can use it commercially too.",
    ))
    clips.append((
        slide(
            "06-cta.png",
            "Start today",
            subtitle="Star the repo. Try the demo. Ship your first PR.",
            lines=[
                "Demo: github.com/akhilvydyula/oss-goalos-ai",
                "Docs: CONTRIBUTING.md + docs/GETTING_STARTED.md",
            ],
        ),
        "Start today. Star the repo, try the live demo, and ship your first pull request. "
        "GoalOS AI — built in the open, for builders like you. "
        "Find us on GitHub at akhilvydyula slash oss-goalos-ai.",
    ))

    print("Generating voiceover...")
    timed_audio = asyncio.run(build_narration([(p.name, t) for p, t in clips]))

    video_concat: list[str] = []
    audio_concat: list[str] = []
    for (slide_path, _), (audio_path, dur) in zip(clips, timed_audio, strict=True):
        video_concat.append(f"file '{slide_path.name}'")
        video_concat.append(f"duration {dur:.3f}")
        audio_concat.append(f"file '{audio_path.name}'")
    video_concat.append(f"file '{clips[-1][0].name}'")

    video_list = SLIDES_DIR / "promo-full.txt"
    audio_list = AUDIO_DIR / "narration.txt"
    video_list.write_text("\n".join(video_concat) + "\n", encoding="utf-8")
    audio_list.write_text("\n".join(audio_concat) + "\n", encoding="utf-8")

    silent_video = OUT / "goalos-platform-promo-silent.mp4"
    narration = OUT / "narration.m4a"
    output = OUT / "goalos-platform-promo.mp4"

    print("Rendering video...")
    run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", "promo-full.txt",
        "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x07080f,format=yuv420p",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30", "-an",
        str(silent_video.resolve()),
    ], cwd=SLIDES_DIR)

    print("Merging narration...")
    run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", "narration.txt",
        "-c:a", "aac", "-b:a", "192k", str(narration.resolve()),
    ], cwd=AUDIO_DIR)

    print("Muxing final video...")
    run([
        "ffmpeg", "-y",
        "-i", str(silent_video),
        "-i", str(narration),
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart",
        "-shortest",
        str(output),
    ])

    print(f"Done: {output}")
    print(f"Duration: {probe_duration(output):.1f}s | Voice: {VOICE}")


if __name__ == "__main__":
    main()
