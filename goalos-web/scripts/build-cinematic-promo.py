#!/usr/bin/env python3
"""Cinematic 45s GoalOS promo — high-energy, LinkedIn/X/YouTube ready."""

from __future__ import annotations

import asyncio
import json
import shutil
import subprocess
from pathlib import Path

import edge_tts
from PIL import Image, ImageDraw, ImageEnhance, ImageFont

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / "public" / "media"
OUT = MEDIA / "linkedin"
DIR = OUT / "cinematic"
AUDIO_DIR = DIR / "audio"
W, H = 1920, 1080
BLACK = (0, 0, 0)
BG = (7, 8, 15)
ACCENT = (43, 231, 168)
WHITE = (255, 255, 255)
MUTED = (180, 186, 200)
VOICE = "en-US-AndrewMultilingualNeural"
RATE = "+8%"
PAD = 0.55
CTA_HOLD = 12.0  # cinematic end-card pause after voice


def font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    for name in ("segoeuib.ttf", "arialbd.ttf", "segoeui.ttf", "arial.ttf"):
        p = Path("C:/Windows/Fonts") / name
        if p.exists():
            try:
                return ImageFont.truetype(str(p), size)
            except OSError:
                pass
    return ImageFont.load_default()


def center_text(draw: ImageDraw.ImageDraw, y: int, text: str, fnt: ImageFont.FreeTypeFont, fill: tuple[int, int, int]) -> int:
    tw = draw.textlength(text, font=fnt)
    draw.text(((W - tw) / 2, y), text, font=fnt, fill=fill)
    return y + int(fnt.size * 1.15)


def text_card(filename: str, lines: list[tuple[str, int, tuple[int, int, int]]], *, sub: str | None = None) -> Path:
    """lines: (text, font_size, color)"""
    img = Image.new("RGB", (W, H), BLACK)
    draw = ImageDraw.Draw(img)
    total_h = sum(int(sz * 1.2) for _, sz, _ in lines) + (50 if sub else 0)
    y = (H - total_h) / 2 - 40
    for text, sz, color in lines:
        f = font(sz)
        y = center_text(draw, int(y), text, f, color)
    if sub:
        y += 24
        center_text(draw, int(y), sub, font(32, False), MUTED)
    draw.rectangle((W // 2 - 120, H - 100, W // 2 + 120, H - 96), fill=ACCENT)
    DIR.mkdir(parents=True, exist_ok=True)
    path = DIR / filename
    img.save(path)
    return path


def overlay_feature(filename: str, bg: Path, title: str, subtitle: str) -> Path:
    base = Image.open(bg).convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
    base = ImageEnhance.Brightness(base).enhance(0.55)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for i in range(H):
        alpha = int(220 * (1 - i / H) ** 0.6)
        draw.line([(0, i), (W, i)], fill=(0, 0, 0, alpha))
    base = Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(base)
    draw.rectangle((0, 0, 8, H), fill=ACCENT)
    draw.text((80, 80), title, font=font(28), fill=ACCENT)
    draw.text((80, 130), subtitle, font=font(72), fill=WHITE)
    path = DIR / filename
    base.save(path)
    return path


def run(cmd: list[str], *, cwd: Path | None = None) -> None:
    subprocess.run(cmd, cwd=cwd, check=True)


def probe(path: Path) -> float:
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(path)],
        text=True,
    )
    return float(json.loads(out)["format"]["duration"])


async def tts(text: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    await edge_tts.Communicate(text, VOICE, rate=RATE).save(str(dest))


async def narrate(clips: list[str]) -> list[tuple[Path, float]]:
    timed: list[tuple[Path, float]] = []
    for i, text in enumerate(clips, 1):
        audio = AUDIO_DIR / f"{i:02d}.mp3"
        print(f"  TTS {i}/{len(clips)}")
        await tts(text, audio)
        timed.append((audio, probe(audio) + PAD))
    return timed


def clip_zoom(src: Path, dest: Path, dur: float, zoom: str = "1.08") -> None:
    run([
        "ffmpeg", "-y", "-loop", "1", "-i", str(src),
        "-vf", f"scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.002,{zoom})':d={int(dur*30)}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080,format=yuv420p",
        "-t", str(dur), "-r", "30", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-an", str(dest),
    ])


def clip_flash(src: Path, dest: Path, dur: float) -> None:
    run([
        "ffmpeg", "-y", "-loop", "1", "-i", str(src),
        "-vf", f"scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,eq=brightness=0.05:contrast=1.15,format=yuv420p",
        "-t", str(dur), "-r", "30", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-an", str(dest),
    ])


def main() -> None:
    DIR.mkdir(parents=True, exist_ok=True)
    chaos_src = OUT / "cinematic-chaos.png"

    # --- stills ---
    hook = text_card("01-hook.png", [
        ("You track your screen time.", 64, WHITE),
        ("But not your goals.", 80, ACCENT),
    ])
    insight = text_card("02-insight.png", [
        ("You're not distracted.", 58, WHITE),
        ("You just don't have an OS", 52, MUTED),
        ("for your goals yet.", 68, ACCENT),
    ])
    cta = text_card("03-cta.png", [
        ("GoalOS AI", 96, WHITE),
        ("Open Source. Built for Builders.", 44, ACCENT),
    ], sub="github.com/akhilvydyula/oss-goalos-ai")

    feat_score = overlay_feature("04-score.png", MEDIA / "web-preview.png", "FEATURE", "Goal Alignment Score")
    feat_coach = overlay_feature("05-coach.png", MEDIA / "coach-preview.png", "FEATURE", "AI Coach")
    feat_sprint = overlay_feature("06-sprint.png", MEDIA / "mobile-preview.png", "FEATURE", "Focus Sprints")

    narrations = [
        "You track your screen time. But not your goals.",
        "Tabs everywhere. Notifications. Another hour gone — and your ambitions didn't move an inch.",
        "You're not distracted. You just don't have an operating system for your goals yet. Meet GoalOS AI.",
        "Your Goal Alignment Score. See in seconds what's helping — and what's hurting.",
        "An AI Coach in your browser. No API key. No server.",
        "Focus Sprints that turn intention into momentum.",
        "GoalOS AI. Open source. Built for builders. Star it on GitHub today.",
    ]

    print("Generating voiceover...")
    timed = asyncio.run(narrate(narrations))

    # --- per-scene video clips (visual duration = audio duration) ---
    clips_dir = DIR / "clips"
    clips_dir.mkdir(exist_ok=True)
    scene_videos: list[Path] = []

    d = timed[0][1]
    clip_flash(hook, clips_dir / "s01.mp4", d)
    scene_videos.append(clips_dir / "s01.mp4")

    # problem montage: split audio 2 across 3 fast cuts
    d2 = timed[1][1]
    part = d2 / 3
    for i, src in enumerate([chaos_src, MEDIA / "mobile-preview.png", chaos_src], 1):
        clip_flash(src if src.exists() else MEDIA / "web-preview.png", clips_dir / f"s02{i}.mp4", part)
        scene_videos.append(clips_dir / f"s02{i}.mp4")

    d3 = timed[2][1]
    clip_zoom(MEDIA / "web-preview.png", clips_dir / "s03.mp4", d3 * 0.55, "1.12")
    clip_flash(insight, clips_dir / "s03b.mp4", d3 * 0.45)
    scene_videos += [clips_dir / "s03.mp4", clips_dir / "s03b.mp4"]

    for idx, (feat, tidx) in enumerate([(feat_score, 3), (feat_coach, 4), (feat_sprint, 5)], 4):
        clip_zoom(feat, clips_dir / f"s0{idx}.mp4", timed[tidx][1], "1.06")
        scene_videos.append(clips_dir / f"s0{idx}.mp4")

    clip_flash(cta, clips_dir / "s07.mp4", timed[6][1] + CTA_HOLD)
    scene_videos.append(clips_dir / "s07.mp4")

    # concat video
    vlist = clips_dir / "video.txt"
    vlist.write_text("\n".join(f"file '{p.name}'" for p in scene_videos) + "\n", encoding="utf-8")
    silent = OUT / "goalos-cinematic-silent.mp4"
    print("Rendering cinematic video...")
    run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", "video.txt",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart", str(silent.resolve()),
    ], cwd=clips_dir)

    # concat audio
    alist = AUDIO_DIR / "all.txt"
    alist.write_text("\n".join(f"file '{p.name}'" for p, _ in timed) + "\n", encoding="utf-8")
    narration = OUT / "goalos-cinematic-narration.m4a"
    narration_padded = OUT / "goalos-cinematic-narration-padded.m4a"
    run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", "all.txt",
        "-c:a", "aac", "-b:a", "192k", str(narration.resolve()),
    ], cwd=AUDIO_DIR)
    run([
        "ffmpeg", "-y", "-i", str(narration),
        "-af", f"apad=pad_dur={CTA_HOLD}",
        "-c:a", "aac", "-b:a", "192k", str(narration_padded),
    ])

    output = OUT / "goalos-cinematic-promo.mp4"
    run([
        "ffmpeg", "-y", "-i", str(silent), "-i", str(narration_padded),
        "-c:v", "copy", "-c:a", "copy", "-movflags", "+faststart", str(output),
    ])
    print(f"Done: {output} ({probe(output):.1f}s)")


if __name__ == "__main__":
    main()
