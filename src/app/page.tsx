import { Container } from "@/components/layout/Container";
import { Hero } from "@/components/landing/Hero";
import { UploadZone } from "@/components/landing/UploadZone";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";

export default function LandingPage() {
  return (
    <>
      <Container variant="landing">
        <Hero />

        <div className="mb-16">
          <UploadZone />
        </div>
      </Container>

      <HowItWorks />
      <Features />
      <CTA />
    </>
  );
}
