import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Navbar } from "@/components/shared/navbar";
import { Analytics } from "@vercel/analytics/react";
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

const siteTitle = "GetaClaw - Set Up Your Private AI Assistant in 5 Minutes";
const siteDescription =
  "Free, open-source tool to deploy OpenClaw on your own VPS. No coding required. Your AI, your server, your data.";

export const metadata: Metadata = {
  metadataBase: new URL("https://getaclaw.io"),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "OpenClaw",
    "self-hosted AI",
    "private AI assistant",
    "VPS setup",
    "AI chatbot",
    "open source",
    "privacy",
    "self-hosted chatbot",
    "private ChatGPT alternative",
    "deploy AI on VPS",
  ],
  authors: [{ name: "GetaClaw" }],
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "https://getaclaw.io",
    siteName: "GetaClaw",
    type: "website",
    images: [
      {
        url: "https://getaclaw.io/og-image.png",
        width: 1200,
        height: 630,
        alt: "GetaClaw - Open Source. Privacy First. 5 Minutes.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["https://getaclaw.io/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "GetaClaw",
              description: siteDescription,
              url: "https://getaclaw.io",
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Organization",
                name: "GetaClaw",
                url: "https://getaclaw.io",
              },
            }),
          }}
        />
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
        <Analytics />
      </body>
    </html>
  );
}
