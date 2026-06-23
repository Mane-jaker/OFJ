import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { profiles } from "./profiles";

export const searches = sqliteTable("searches", {
  id: text("id").primaryKey(),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id),
  status: text("status")
    .notNull()
    .default("pending")
    .$type<"pending" | "running" | "completed" | "failed">(),
  platforms: text("platforms", { mode: "json" }).$type<string[]>().default([]),
  searchTerms: text("search_terms", { mode: "json" })
    .$type<string[]>()
    .default([]),
  model: text("model"),
  filters: text("filters", { mode: "json" })
    .$type<Record<string, unknown>>()
    .default({}),
  resultsCount: integer("results_count").default(0),
  startedAt: integer("started_at", { mode: "timestamp_ms" }),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$default(() => new Date()),
});
