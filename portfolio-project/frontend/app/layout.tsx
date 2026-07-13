import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

import "@/index.css";

import { defaultLocale, siteConfig } from "@/content/site";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/icon.png", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06060e",
};

const themeScript = `
  (function () {
    try {
      var saved = localStorage.getItem('theme');
      var isDark = saved !== 'light';
      document.documentElement.classList[isDark ? 'add' : 'remove']('dark');
    } catch (error) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang={defaultLocale}
      suppressHydrationWarning
      className={`${inter.variable} ${mono.variable} ${display.variable} dark`}
    >
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Providers initialLanguage={defaultLocale}>{children}</Providers>
      </body>
    </html>
  );
}
