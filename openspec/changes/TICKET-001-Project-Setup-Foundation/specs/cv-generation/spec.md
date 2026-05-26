# CV Generation Specification

## Purpose

Defines CV generation from a profile, optionally targeting a specific job listing, with PDF export via react-pdf.

## Requirements

### Requirement: CV Preview

The system MUST render a preview of the generated CV in the browser, showing formatted sections from the profile data.

#### Scenario: Preview from profile

- GIVEN a profile with name, title, skills, experience, and education
- WHEN the user navigates to `/cv`
- THEN a formatted CV preview MUST be rendered using profile data

#### Scenario: Preview with missing sections

- GIVEN a profile with only name and email filled
- WHEN the CV preview renders
- THEN available sections MUST display; empty sections MUST be omitted without visual gaps

### Requirement: CV Tailored to Job Listing

When a job_listing_id is provided, the system MUST generate a CV emphasizing skills and experience relevant to that job.

#### Scenario: Generate tailored CV

- GIVEN a profile and a job listing with title "Senior React Developer"
- WHEN the user requests a CV for that job
- THEN the generated CV content MUST prioritize React-related skills and experience, and include the job title as a heading

#### Scenario: Generate generic CV

- GIVEN a profile with no job listing selected
- WHEN the user requests a CV
- THEN a general-purpose CV MUST be generated with all profile sections

### Requirement: PDF Export

The system MUST allow downloading the generated CV as a PDF using react-pdf.

#### Scenario: Download PDF

- GIVEN a CV preview is displayed
- WHEN the user clicks "Download PDF"
- THEN a PDF file MUST be generated and downloaded to the user's device

#### Scenario: PDF export failure

- GIVEN a CV preview is displayed
- WHEN react-pdf encounters a rendering error
- THEN an error message MUST be shown with a retry option

### Requirement: CV Persistence

The system MUST save generated CVs to the `generated_cvs` table with content and optional file path.

#### Scenario: Save generated CV

- GIVEN a CV has been generated
- WHEN the generation completes
- THEN a record MUST be created in `generated_cvs` with profile_id, content, and file_path

#### Scenario: Link CV to job listing

- GIVEN a CV was generated for a specific job
- WHEN the record is saved
- THEN `job_listing_id` MUST be set to the target job's id

### Requirement: Match Score Display

When a CV is generated for a specific job listing, the system MUST display the match score from the job listing.

#### Scenario: Show match score

- GIVEN a job listing with match_score 0.85
- WHEN the CV preview renders for that job
- THEN the page MUST display "85% match" prominently