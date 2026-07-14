# CLAUDE.md

Before writing code, always read BLUEPRINT.md and QUESTION_FRAMEWORK.md.

## Priorities

1.  Maintain clean architecture.
2.  Prefer reusable components.
3.  Build production-ready code.
4.  Keep UI minimal and premium.
5.  Never hard-code scoring rules.
6.  Everything configurable from Admin.

## When implementing

Always: - Create scalable database schema. - Use TypeScript types. -
Validate inputs. - Handle loading, empty and error states. - Write
modular code.

## UI Style

Apple × Linear × Typeform

Use: - Large whitespace - Soft shadows - Rounded corners - Smooth
motion - Fast interactions

Avoid: - Clutter - Overly bright colors - Complex navigation

## Build Order

1.  Authentication
2.  Database
3.  Question engine
4.  Assessment flow
5.  Scoring engine
6.  Results
7.  Certificate
8.  Admin CMS
9.  Analytics
10. AI feedback

When requirements are ambiguous, choose the solution that is: - More
configurable - Easier to extend - Simpler for users - Easier to maintain
