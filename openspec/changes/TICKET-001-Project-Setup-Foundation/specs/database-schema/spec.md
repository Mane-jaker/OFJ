# Database Schema Specification

## Purpose

OFJ data model via Drizzle ORM + SQLite (better-sqlite3): profiles, searches, job listings, generated CVs.

## Requirements

### Requirement: Profiles Table

Text PK `id`, NOT NULL `name`, NOT NULL UNIQUE `email`, nullable `title`/`location`/`cv_text`/`cv_file_path`, JSON defaults `skills=[]`/`experience=[]`/`education=[]`, integer timestamps `created_at`/`updated_at` NOT NULL DEFAULT now.

#### Scenario: Create profile with minimal data

- GIVEN no profile with that email exists
- WHEN created with id, name, email
- THEN record stored; optional fields default to empty values

#### Scenario: Duplicate email rejection

- GIVEN profile with email `x@example.com` exists
- WHEN inserting same email
- THEN MUST reject with unique constraint violation

#### Scenario: Update timestamp

- GIVEN a profile exists
- WHEN any field is updated
- THEN `updated_at` MUST be set to current timestamp

### Requirement: Searches Table

Text PK `id`, NOT NULL FK `profile_id→profiles.id`, NOT NULL `status` DEFAULT `pending` CHECK IN (pending/running/completed/failed), NOT NULL JSON `platforms` DEFAULT `[]`, nullable `api_key`/`model`, JSON `filters` DEFAULT `{}`, integer `results_count` DEFAULT 0, nullable `started_at`/`completed_at`, NOT NULL `created_at`.

#### Scenario: Valid search creation

- GIVEN profile `prof-1` exists
- WHEN search created with profile_id `prof-1`, platforms `["linkedin"]`
- THEN stored with status `pending`

#### Scenario: Invalid profile FK

- GIVEN no profile `nonexistent`
- WHEN search references `nonexistent`
- THEN MUST reject with FK error

#### Scenario: Status transition

- GIVEN search status `pending`
- WHEN execution starts
- THEN status → `running`, `started_at` set

### Requirement: Job Listings Table

Text PK `id`, NOT NULL FK `search_id→searches.id`, NOT NULL `platform`/`title`/`company`, nullable `description`/`url`/`location`/`salary_range`, real `match_score`, integer `applied` DEFAULT 0, `saved` DEFAULT 0, NOT NULL `created_at`.

#### Scenario: Job from search

- GIVEN search `s1` exists
- WHEN listing created with search_id, platform, title, company
- THEN stored with applied=false, saved=false

#### Scenario: Mark applied

- GIVEN listing with applied=false
- WHEN user marks as applied
- THEN `applied` set to 1

### Requirement: Generated CVs Table

Text PK `id`, NOT NULL FK `profile_id→profiles.id`, nullable FK `job_listing_id→job_listings.id`, NOT NULL `content` (CV text), nullable `file_path`, NOT NULL `created_at`.

#### Scenario: CV for specific job

- GIVEN profile and job listing exist
- WHEN CV generated with both FKs
- THEN stored with job_listing_id set

#### Scenario: CV without job target

- GIVEN profile exists
- WHEN CV generated with profile_id only
- THEN stored with job_listing_id NULL

### Requirement: Drizzle Schema Files

Schema files under `src/server/db/schema/`, one per table, barrel-exported from index. Connection at `src/server/db/index.ts`.

#### Scenario: Schema module structure

- GIVEN project is set up
- WHEN Drizzle connection imported from `src/server/db/index.ts`
- THEN all four table schemas accessible; CRUD operations work