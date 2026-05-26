import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { searches } from "./searches";

export const jobListings = sqliteTable("job_listings", {
  id: text("id").primaryKey(),
  searchId: text("search_id")
    .notNull()
    .references(() => searches.id),
  platform: text("platform").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description"),
  url: text("url"),
  location: text("location"),
  salaryRange: text("salary_range"),
  matchScore: real("match_score"),
  applied: integer("applied").default(0),
  saved: integer("saved").default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$default(() => new Date()),
});
