import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { WhySelfHost } from "@/components/landing/why-self-host";
import { Features } from "@/components/landing/features";
import { FAQ } from "@/components/landing/faq";
import { Troubleshooting } from "@/components/landing/troubleshooting";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
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
