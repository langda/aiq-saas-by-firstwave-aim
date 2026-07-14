# PROJECT_RULES.md

# AIQ Project Rules

These rules apply to every coding session.

## Product Principles

-   Measure AI work style, not AI knowledge.
-   Optimize for user trust and clarity.
-   Every major behavior should be configurable.
-   Never expose hidden scoring logic to end users.

## Engineering Rules

-   Prefer clean architecture over shortcuts.
-   No duplicated business logic.
-   Separate UI, domain, and data layers.
-   Strong TypeScript typing everywhere.
-   Use reusable components.
-   Every database change must use migrations.
-   Keep the app deployable at all times.

## UI Rules

-   Mobile-first.
-   Accessible (WCAG-minded).
-   One primary action per screen.
-   Loading, empty, success, and error states are required.
-   Consistent spacing and typography.

## Admin Rules

-   If a value may change in the future, make it configurable.
-   Never hardcode personas, score thresholds, branding, or
    competencies.

## AI Rules

-   AI generates recommendations, never hidden scores.
-   AI output should be reviewable and replaceable.
-   Keep prompts centralized.

## Code Review Checklist

Before finishing work: - Project builds successfully. - No TypeScript
errors. - No obvious duplicated code. - New code follows folder
conventions. - Documentation updated if architecture changed.

## Decision Framework

When multiple solutions exist, prefer the one that is: 1. Easier to
maintain. 2. Easier to extend. 3. Easier to test. 4. Simpler for users.
5. Consistent with BLUEPRINT.md.

If requirements are unclear, ask for clarification instead of guessing.
