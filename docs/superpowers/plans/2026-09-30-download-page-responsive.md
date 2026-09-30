# Download Page Responsive Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use inline execution with test-first verification.

**Goal:** Make the download page feel intentional and easy to use on phone-sized screens without changing its content or store destinations.

**Architecture:** Keep the page as a single static HTML document. Add semantic classes for the page sections and use one mobile breakpoint to stack the CTA actions and feature cards, while preserving the existing desktop layout.

**Tech Stack:** Static HTML, inline CSS, Playwright smoke test.

## Global Constraints

- Preserve existing App Store and Google Play URLs.
- Preserve existing referral and download-click tracking scripts.
- Keep keyboard-visible focus states and respect reduced motion.
- Avoid new dependencies.

### Task 1: Responsive layout and visual polish

**Files:**
- Modify: `download.html`
- Test: `/tmp/download-page-responsive.spec.js`

- [x] Write a failing Playwright test that checks no horizontal overflow at 390px, the CTA buttons fit the viewport, and the three feature cards stack at phone width.
- [x] Run the test and confirm the current page fails because the feature grid remains three columns and/or content overflows.
- [x] Add focused page classes and responsive CSS for the header, CTA card, store buttons, trust row, and feature grid; include focus-visible styling and reduced-motion handling.
- [x] Run the test at phone and desktop widths and confirm it passes.
- [x] Capture a phone-width screenshot and inspect the rendered hierarchy.
