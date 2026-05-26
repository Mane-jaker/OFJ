# Profile Setup Specification

## Purpose

Defines the profile setup page where users upload a CV and fill in professional details before running a job search.

## Requirements

### Requirement: CV Upload Zone

The profile page MUST provide a drag-and-drop zone that accepts PDF and text files, parses the content, and pre-populates profile fields.

#### Scenario: Drop a valid PDF

- GIVEN the user is on `/profile`
- WHEN a PDF file is dropped onto the upload zone
- THEN the system MUST extract text, populate `cv_text`, and auto-fill name, title, skills, experience, and education fields from parsed content

#### Scenario: Drop unsupported format

- GIVEN the user is on `/profile`
- WHEN an image or `.docx` file is dropped
- THEN the zone MUST show an error stating only PDF and text files are accepted

#### Scenario: Remove uploaded file

- GIVEN a PDF has been uploaded and parsed
- WHEN the user clicks the remove button on the upload zone
- THEN the file reference MUST be cleared and parsed fields reset to empty

### Requirement: Profile Form Fields

The profile page MUST provide form fields for: name (required), email (required), title, and location.

#### Scenario: Save with required fields empty

- GIVEN the name or email field is empty
- WHEN the user attempts to save
- THEN validation MUST prevent submission and highlight the required field

#### Scenario: Validate email format

- GIVEN the email field contains "not-an-email"
- WHEN the user attempts to save
- THEN the form MUST display an email format validation error

### Requirement: Experience Section

The profile page MUST allow adding, editing, and removing experience entries. Each entry has: company, title, start date, end date (optional), and description.

#### Scenario: Add experience entry

- GIVEN the user is on the profile form
- WHEN the user clicks "Add Experience" and fills in company, title, and start date
- THEN a new experience entry MUST appear in the list

#### Scenario: Remove experience entry

- GIVEN two experience entries exist
- WHEN the user removes the first entry
- THEN the list MUST show only the remaining entry

### Requirement: Skills Section

The profile page MUST display skills as editable tags. The user types a skill and presses Enter to add it as a tag.

#### Scenario: Add skill tag

- GIVEN the skills input is focused
- WHEN the user types "TypeScript" and presses Enter
- THEN "TypeScript" MUST appear as a removable tag

#### Scenario: Remove skill tag

- GIVEN the skill "React" exists as a tag
- WHEN the user clicks its remove icon
- THEN "React" MUST be removed from the skills list

### Requirement: Education Section

The profile page MUST allow adding, editing, and removing education entries. Each entry has: institution, degree, field, start year, end year.

#### Scenario: Add education entry

- GIVEN the user is on the profile form
- WHEN the user clicks "Add Education" and fills in institution, degree, and field
- THEN a new education entry MUST appear in the list

### Requirement: Save Profile

The profile page MUST persist all profile data to the database when the user clicks Save.

#### Scenario: Successful save

- GIVEN all required fields are filled
- WHEN the user clicks Save
- THEN the profile MUST be persisted and a success confirmation shown

#### Scenario: Save triggers navigation

- GIVEN the profile is saved successfully
- WHEN the success confirmation is acknowledged
- THEN the system SHOULD navigate to `/search`

### Requirement: Progress Indicator

The profile page MUST show a progress indicator (Step 1 of 3) linking to the three-step flow: Profile → Search → Results.

#### Scenario: Progress bar reflects current step

- GIVEN the user is on `/profile`
- WHEN the progress bar renders
- THEN it MUST show Step 1 of 3 as active