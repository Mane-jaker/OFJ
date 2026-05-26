import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { profiles } from "./profiles";
import { jobListings } from "./job-listings";

export const generatedCvs = sqliteTable("generated_cvs", {
  id: text("id").primaryKey(),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id),
  jobListingId: text("job_listing_id").references(() => jobListings.id),
  content: text("content").notNull(),
  filePath: text("file_path"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$default(() => new Date()),
});
