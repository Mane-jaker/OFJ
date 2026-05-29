import { redirect } from "next/navigation";
import { hasAnyProfile } from "@/server/profile/service";
import { LandingContent } from "@/components/landing/LandingContent";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const exists = await hasAnyProfile();
  if (exists) {
    redirect("/home");
  }

  return <LandingContent />;
}
