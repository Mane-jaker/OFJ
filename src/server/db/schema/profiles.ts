import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export interface Experience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
}

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  title: text("title"),
  location: text("location"),
  cvText: text("cv_text"),
  cvFilePath: text("cv_file_path"),
  skills: text("skills", { mode: "json" }).$type<string[]>().default([]),
  experience: text("experience", { mode: "json" })
    .$type<Experience[]>()
    .default([]),
  education: text("education", { mode: "json" })
    .$type<Education[]>()
    .default([]),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$default(() => new Date()),
});
