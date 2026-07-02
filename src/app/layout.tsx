import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

import DynamicHead from "@/components/DynamicHead";
import SessionGuard from "@/components/SessionGuard";
import BackToTop from "@/components/ui/BackToTop";
import PushNotification from "@/components/ui/PushNotification";
import BGMPlayer from "@/components/ui/BGMPlayer";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Daily Study",
  description: "Platform Les Online Terlengkap",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script dangerouslySetInnerHTML={{
          __html: `
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          `
        }} />
      </head>
      <body suppressHydrationWarning className={`${inter.className} bg-bg-app text-text-main antialiased selection:bg-primary-soft selection:text-primary`}>
        <DynamicHead />
        <div className="min-h-screen bg-bg-app pb-20 relative">
          <SessionGuard />
          <Navbar />
          <main className="w-full">
            {children}
          </main>
          <BottomNav />
          <PWAInstallPrompt />
          <PushNotification />
          <BGMPlayer />
          <BackToTop />
        </div>
      </body>
    </html>
  );
}
