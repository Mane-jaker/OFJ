import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { profiles } from "./profiles";
import { jobListings } from "./job-listings";

export interface TailoredExperience {
  title: string;
  company: string;
  dates: string;
  bullets: string[];
}

export const generatedCvs = sqliteTable("generated_cvs", {
  id: text("id").primaryKey(),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id),
  jobListingId: text("job_listing_id").references(() => jobListings.id),
  content: text("content").notNull(),
  tailoredSummary: text("tailored_summary"),
  tailoredSkills: text("tailored_skills", { mode: "json" })
    .$type<string[]>()
    .default([]),
  tailoredExperience: text("tailored_experience", { mode: "json" })
    .$type<TailoredExperience[]>()
    .default([]),
  filePath: text("file_path"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$default(() => new Date()),
});
