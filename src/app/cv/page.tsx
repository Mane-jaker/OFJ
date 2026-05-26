"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { CVPreview } from "@/components/cv/CVPreview";
import Link from "next/link";

// Mock profile data for CV preview since we don't have auth/profile state management yet
const MOCK_PROFILE = {
  id: "demo",
  name: "John Doe",
  email: "john@example.com",
  title: "Senior Software Engineer",
  location: "San Francisco, CA",
  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "PostgreSQL",
    "Docker",
    "AWS",
    "GraphQL",
  ],
  experience: [
    {
      company: "Tech Corp",
      title: "Senior Software Engineer",
      startDate: "2022-01",
      endDate: undefined,
      description:
        "Building and maintaining microservices architecture serving 1M+ users.",
    },
    {
      company: "Startup Inc",
      title: "Full Stack Developer",
      startDate: "2019-03",
      endDate: "2021-12",
      description:
        "Developed React frontend and Node.js backend for SaaS platform.",
    },
  ],
  education: [
    {
      institution: "University of Technology",
      degree: "B.S.",
      field: "Computer Science",
      startYear: 2015,
      endYear: 2019,
    },
  ],
};

export default function CVPage() {
  const [profile] = useState(MOCK_PROFILE);
  // In the future, this will come from URL params or search params
  const jobListing = null;

  return (
    <Container variant="form" className="py-10">
      <div className="mb-6">
        <Link
          href="/results"
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          &larr; Back to Results
        </Link>
      </div>

      <h1 className="mb-8 text-2xl font-bold">Your CV</h1>

      <CVPreview profile={profile} jobListing={jobListing} />
    </Container>
  );
}
