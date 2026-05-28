import { redirect } from "next/navigation";
import { hasAnyProfile } from "@/server/profile/service";
import { Container } from "@/components/layout/Container";

export const dynamic = "force-dynamic";
import { Hero } from "@/components/landing/Hero";
import { UploadZone } from "@/components/landing/UploadZone";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";

export default async function LandingPage() {
  const exists = await hasAnyProfile();
  if (exists) {
    redirect("/home");
  }

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
