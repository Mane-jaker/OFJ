# Landing & Navigation Specification

## Purpose

Defines the landing page structure and navigation components for OFJ using CVRise design tokens and system-ui font stack.

## Requirements

### Requirement: Hero Section

The landing page MUST display a hero section with a headline, subtitle, and primary CTA button that navigates to `/profile`.

#### Scenario: Hero CTA navigation

- GIVEN the user is on the landing page
- WHEN the user clicks the primary CTA
- THEN the browser MUST navigate to `/profile`

### Requirement: Upload Zone

The landing page MUST show a drag-and-drop zone for CV upload (PDF/text) that parses the file and pre-populates the profile form.

#### Scenario: Upload valid PDF

- GIVEN the user drags a valid PDF onto the upload zone
- WHEN the file is processed
- THEN the system MUST extract text and navigate to `/profile` with parsed data

#### Scenario: Upload invalid file

- GIVEN the user drops a non-PDF/text file
- WHEN the upload zone rejects it
- THEN an error message MUST be displayed indicating supported formats

### Requirement: How It Works Section

The landing page MUST display a three-step process: (1) Upload Profile, (2) Configure Search, (3) Get Results.

#### Scenario: Steps are visible

- GIVEN the user scrolls to the how-it-works section
- WHEN the section renders
- THEN three numbered steps MUST be displayed with icons and descriptions

### Requirement: Features Grid

The landing page MUST display a three-card grid highlighting: AI-Powered Search, Smart CV Matching, and Multi-Platform support.

#### Scenario: Feature cards render

- GIVEN the landing page loads
- WHEN the features section renders
- THEN three feature cards MUST be visible, each with an icon, title, and description

### Requirement: Sticky Top Navigation

The top navigation MUST be sticky with a blur backdrop, containing the CVRise logo and nav links to `/profile`, `/search`, `/results`.

#### Scenario: Nav remains visible on scroll

- GIVEN the user scrolls down on any page
- WHEN the scroll position passes the top nav
- THEN the nav MUST remain fixed at the top with a blur backdrop effect

### Requirement: Footer

The landing page MUST display a footer with copyright text and links.

#### Scenario: Footer renders

- GIVEN any page loads
- WHEN the user scrolls to the bottom
- THEN a footer MUST be visible with "© 2026 CVRise" and navigation links

### Requirement: Design Token Compliance

All landing and navigation components MUST use the CVRise design tokens: oklch color space (bg, surface, fg, muted, border, accent), system-ui font stack, and container widths (1120px landing, 680px forms, 800px results). Default radius 10px, large radius 14-16px.

#### Scenario: Colors use oklch tokens

- GIVEN any landing/nav component renders
- WHEN color values are inspected
- THEN all colors MUST resolve to the defined oklch CSS custom properties

#### Scenario: Container width matches context

- GIVEN the landing page renders in a wide viewport
- WHEN container width is measured
- THEN it MUST be constrained to 1120px maximum