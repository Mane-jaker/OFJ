import type { Metadata } from "next";
import { Topnav } from "@/components/layout/Topnav";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "OFJ — Optimiza tu búsqueda laboral",
  description:
    "Subí tu CV, encontrá las mejores oportunidades laborales y no te pierdas ninguna postulación.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Topnav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
