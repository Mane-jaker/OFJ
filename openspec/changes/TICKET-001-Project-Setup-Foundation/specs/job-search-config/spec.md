# Job Search Configuration Specification

## Purpose

Defines the search configuration page where users select platforms, provide API credentials, and choose an AI model before starting a job search.

## Requirements

### Requirement: Platform Selection

The search config page MUST display toggle cards for LinkedIn, Indeed, and OCC Mundial. At least one platform MUST be selected to proceed.

#### Scenario: Toggle a platform on

- GIVEN the user is on `/search`
- WHEN the user clicks the LinkedIn card
- THEN the card MUST visually indicate selection and LinkedIn MUST be added to the platforms array

#### Scenario: Toggle a platform off

- GIVEN LinkedIn is selected
- WHEN the user clicks the LinkedIn card again
- THEN the card MUST deselect and LinkedIn MUST be removed from the platforms array

#### Scenario: No platform selected

- GIVEN no platforms are selected
- WHEN the user attempts to start the search
- THEN validation MUST prevent submission and show an error: "Select at least one platform"

### Requirement: API Key Input

The search config page MUST provide a masked input field for the AI API key. The key MUST be stored encrypted in the database.

#### Scenario: Enter API key

- GIVEN the API key field is empty
- WHEN the user types a key and blurs the field
- THEN the input MUST mask characters and store the encrypted key on save

#### Scenario: Empty API key

- GIVEN the API key field is empty
- WHEN the user attempts to start the search
- THEN validation MUST prevent submission and show an error: "API key is required"

### Requirement: Model Selector

The search config page MUST provide a dropdown/select for AI model choice (e.g., GPT-4, Claude 3.5, etc.).

#### Scenario: Select a model

- GIVEN the model dropdown renders
- WHEN the user selects "GPT-4"
- THEN the model MUST be set for the search configuration

#### Scenario: No model selected

- GIVEN no model is selected
- WHEN the user attempts to start the search
- THEN validation MUST prevent submission and show an error: "Select an AI model"

### Requirement: Search Validation

The search config page MUST validate all required fields before creating a search: at least 1 platform, a non-empty API key, and a selected model.

#### Scenario: All fields valid

- GIVEN the user has selected 1+ platforms, entered an API key, and chosen a model
- WHEN the user clicks "Start Search"
- THEN the search MUST be created in the database with status `pending` and the user navigated to `/results`

#### Scenario: Missing required fields

- GIVEN the user has not filled all required fields
- WHEN the user clicks "Start Search"
- THEN all invalid fields MUST be highlighted with error messages

### Requirement: Progress Indicator

The search config page MUST show a progress indicator (Step 2 of 3) linking to: Profile → Search → Results.

#### Scenario: Progress bar reflects current step

- GIVEN the user is on `/search`
- WHEN the progress bar renders
- THEN it MUST show Step 2 of 3 as active

### Requirement: Back Navigation

The search config page MUST provide a back link to `/profile` allowing the user to edit their profile.

#### Scenario: Navigate back to profile

- GIVEN the user is on `/search`
- WHEN the user clicks the back button
- THEN the browser MUST navigate to `/profile`