# Results Display Specification

## Purpose

Defines the results page where users view job listings from a completed search, filter by platform, and mark jobs as applied or saved.

## Requirements

### Requirement: Search Loading Overlay

While a search is running, the results page MUST display an animated overlay indicating progress.

#### Scenario: Search in progress

- GIVEN a search has status `running`
- WHEN the user navigates to `/results`
- THEN an animated overlay MUST be displayed with a progress indicator and status text

#### Scenario: Search completes

- GIVEN a search transitions from `running` to `completed`
- WHEN results are available
- THEN the overlay MUST dismiss and job cards MUST render

#### Scenario: Search fails

- GIVEN a search transitions to `failed`
- WHEN the user views `/results`
- THEN an error message MUST be displayed with an option to retry

### Requirement: Job Cards

Each job listing MUST render as a card showing: platform badge, match score (percentage), title, company, location, salary range, description excerpt, and action buttons.

#### Scenario: Job card renders all fields

- GIVEN a job listing with all fields populated
- WHEN the card renders
- THEN it MUST display: platform badge, match score, title, company, location, salary, truncated description, "Apply" button, and "Save" button

#### Scenario: Job card with missing optional fields

- GIVEN a job listing without salary_range or location
- WHEN the card renders
- THEN those fields MUST be omitted without visual gaps

### Requirement: Platform Filter Chips

The results page MUST display filter chips for each platform present in the results. Clicking a chip filters the list; clicking again removes the filter.

#### Scenario: Filter by single platform

- GIVEN results contain LinkedIn and Indeed jobs
- WHEN the user clicks the "LinkedIn" chip
- THEN only LinkedIn jobs MUST be visible; the chip MUST appear active

#### Scenario: Remove filter

- GIVEN the "LinkedIn" filter is active
- WHEN the user clicks "LinkedIn" again
- THEN all jobs MUST be visible; the chip MUST return to inactive state

### Requirement: Mark Job as Applied

Users MUST be able to mark a job as applied, updating the `applied` field in the database.

#### Scenario: Click Apply

- GIVEN a job listing card displays an "Apply" button
- WHEN the user clicks "Apply"
- THEN the `applied` field MUST be set to true and the button MUST change to a "Applied ✓" disabled state

#### Scenario: Apply redirects to external URL

- GIVEN a job listing has a `url` field
- WHEN the user clicks "Apply"
- THEN the external job URL MUST open in a new tab AND the local `applied` flag MUST be set

### Requirement: Save Job

Users MUST be able to save/bookmark a job listing, toggling the `saved` field.

#### Scenario: Save a job

- GIVEN a job listing card with `saved=false`
- WHEN the user clicks the "Save" icon
- THEN `saved` MUST be set to true and the icon MUST change to filled/bookmarked

#### Scenario: Unsave a job

- GIVEN a job listing with `saved=true`
- WHEN the user clicks the save icon again
- THEN `saved` MUST be set to false and the icon MUST revert to outline

### Requirement: Progress Indicator

The results page MUST show a progress indicator (Step 3 of 3) linking to: Profile → Search → Results.

#### Scenario: Progress bar reflects current step

- GIVEN the user is on `/results`
- WHEN the progress bar renders
- THEN it MUST show Step 3 of 3 as active

### Requirement: Results Container Width

The results page MUST use the 800px container width per design tokens.

#### Scenario: Container respects design token

- GIVEN the user views `/results` on a wide viewport
- WHEN container width is measured
- THEN it MUST be constrained to 800px maximum