import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Navbar } from "@/components/shared/navbar";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GetaClaw — Set Up Your Private AI Assistant in 5 Minutes",
  description:
    "Open-source, privacy-focused tool to deploy OpenClaw on your own VPS. No coding required. Your AI, your server, your data.",
  keywords: [
    "OpenClaw",
    "self-hosted AI",
    "private AI assistant",
    "VPS setup",
    "AI chatbot",
    "open source",
    "privacy",
  ],
  authors: [{ name: "GetaClaw" }],
  openGraph: {
    title: "GetaClaw — Set Up Your Private AI Assistant in 5 Minutes",
    description:
      "Open-source, privacy-focused tool to deploy OpenClaw on your own VPS. No coding required.",
    url: "https://getaclaw.io",
    siteName: "GetaClaw",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GetaClaw — Open Source. Privacy First. 5 Minutes.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GetaClaw — Private AI Assistant Setup",
    description:
      "Deploy OpenClaw on your own server in 5 minutes. Privacy-focused & open source.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  metadataBase: new URL("https://getaclaw.io"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0B0B14" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('getaclaw-theme')||'dark';var t=s;if(s==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}if(t==='dark'){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
