import type { Metadata } from "next";
import { Topnav } from "@/components/layout/Topnav";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "CVRise — AI-Powered Job Search",
  description:
    "Upload your CV, configure your search across multiple platforms, and let AI find the perfect opportunities.",
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
