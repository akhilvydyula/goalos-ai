/** Public asset path for static deploy (Cloudflare Pages). */
export function asset(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export const MEDIA = {
  webPreview: "/media/web-preview.png",
  mobilePreview: "/media/mobile-preview.png",
  coachPreview: "/media/coach-preview.png",
  androidPreview: "/media/android-preview.png",
} as const;
