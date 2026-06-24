import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "GoalOS AI — Turn screen time into goal time",
  description:
    "AI-powered productivity operating system that helps you align mobile usage with your goals.",
  manifest: `${assetPrefix}/manifest.json`,
  icons: { icon: `${assetPrefix}/icon.svg`, apple: `${assetPrefix}/icon.svg` },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GoalOS AI",
  },
};

export const viewport: Viewport = {
  themeColor: "#06070d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
