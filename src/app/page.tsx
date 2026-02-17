import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { WhySelfHost } from "@/components/landing/why-self-host";
import { Features } from "@/components/landing/features";
import { FAQ } from "@/components/landing/faq";
import { Troubleshooting } from "@/components/landing/troubleshooting";
import { Footer } from "@/components/landing/footer";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is OpenClaw?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OpenClaw is an open-source, self-hosted AI gateway that connects your messaging apps (WhatsApp, Telegram, Discord, etc.) to AI models like Claude, GPT-4, and more. It runs on your own server under your full control.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need technical skills to use this?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not really. GetaClaw automates the entire process. You'll need to create accounts on a VPS provider (Hetzner or DigitalOcean) and an AI model provider (OpenRouter), but we guide you through every step. The setup wizard adapts to your skill level.",
      },
    },
    {
      "@type": "Question",
      name: "How much does it cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GetaClaw itself is free and open source. You'll pay for a VPS (starting at ~$4/month on Hetzner) and AI model usage through OpenRouter (pay-per-use, typically a few dollars per month for personal use).",
      },
    },
    {
      "@type": "Question",
      name: "Is my data really private?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Your OpenClaw instance runs entirely on your own VPS. GetaClaw never stores your API keys, server credentials, or any personal data on our servers. The website is open source -you can verify this yourself. Even the thin API proxy we use for VPS creation is stateless and stores nothing.",
      },
    },
    {
      "@type": "Question",
      name: "What VPS providers are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Currently Hetzner and DigitalOcean. We're planning to add Fly.io, Oracle Cloud (free tier), GCP, AWS, and more. You can also use any provider that supports cloud-init with a manual setup option.",
      },
    },
    {
      "@type": "Question",
      name: "Can I manage my instance after setup?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. Come back to GetaClaw anytime to check your instance's health, update OpenClaw to the latest version, add or remove messaging channels, and change configuration -all from your browser.",
      },
    },
    {
      "@type": "Question",
      name: "What if something goes wrong during setup?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The setup wizard shows you real-time progress and automatically retries common failures (network issues, package install hiccups). If something unexpected happens, you'll see the error with helpful context and can retry individual steps. You can also access your server via SSH as a fallback.",
      },
    },
    {
      "@type": "Question",
      name: "Can I run multiple AI instances?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can set up multiple OpenClaw instances on different servers -for example, one for personal use and one for work. Each instance is fully independent.",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <HowItWorks />
      <WhySelfHost />
      <Features />
      <FAQ />
      <Troubleshooting />
      <Footer />
    </>
  );
}
