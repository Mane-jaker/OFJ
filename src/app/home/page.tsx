import { getFirstProfile } from "@/server/profile/service";
import { Container } from "@/components/layout/Container";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const profile = await getFirstProfile();

  if (!profile) {
    redirect("/");
  }

  return <DashboardContent profile={profile} />;
}
