"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is OpenClaw?",
    answer:
      "OpenClaw is an open-source, self-hosted AI gateway that connects your messaging apps (WhatsApp, Telegram, Discord, etc.) to AI models like Claude, GPT-4, and more. It runs on your own server under your full control.",
  },
  {
    question: "Do I need technical skills to use this?",
    answer:
      "Not really. GetaClaw automates the entire process. You'll need to create accounts on a VPS provider (Hetzner or DigitalOcean) and an AI model provider (OpenRouter), but we guide you through every step. The setup wizard adapts to your skill level.",
  },
  {
    question: "How much does it cost?",
    answer:
      "GetaClaw itself is free and open source. You'll pay for a VPS (starting at ~$4/month on Hetzner) and AI model usage through OpenRouter (pay-per-use, typically a few dollars per month for personal use).",
  },
  {
    question: "Is my data really private?",
    answer:
      "Yes. Your OpenClaw instance runs entirely on your own VPS. GetaClaw never stores your API keys, server credentials, or any personal data on our servers. The website is open source -you can verify this yourself. Even the thin API proxy we use for VPS creation is stateless and stores nothing.",
  },
  {
    question: "What VPS providers are supported?",
    answer:
      "Currently Hetzner and DigitalOcean. We're planning to add Fly.io, Oracle Cloud (free tier), GCP, AWS, and more. You can also use any provider that supports cloud-init with a manual setup option.",
  },
  {
    question: "Can I manage my instance after setup?",
    answer:
      "Absolutely. Come back to GetaClaw anytime to check your instance's health, update OpenClaw to the latest version, add or remove messaging channels, and change configuration -all from your browser.",
  },
  {
    question: "What if something goes wrong during setup?",
    answer:
      "The setup wizard shows you real-time progress and automatically retries common failures (network issues, package install hiccups). If something unexpected happens, you'll see the error with helpful context and can retry individual steps. You can also access your server via SSH as a fallback.",
  },
  {
    question: "Can I run multiple AI instances?",
    answer:
      "Yes. You can set up multiple OpenClaw instances on different servers -for example, one for personal use and one for work. Each instance is fully independent.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="border-t border-border bg-surface px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[800px]">
        <p className="text-sm font-semibold uppercase tracking-widest text-coral">
          FAQ
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Common questions
        </h2>

        <div className="mt-12 divide-y divide-border">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left"
              >
                <h3 className="text-base font-semibold text-text-primary pr-4">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-text-muted transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-200 ${
                  openIndex === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="pb-5 text-sm leading-relaxed text-text-secondary">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
