# IMPLEMENTATION_PLAN.md

# AIQ Implementation Plan

This document defines the implementation order for the AIQ platform.

## Engineering Principles

- Build production-quality code from the beginning.
- Prefer extensibility over shortcuts.
- Keep the MVP focused but architect for future growth.
- Every feature should be configurable where practical.
- Avoid hard-coded business rules.
- Complete and review each phase before starting the next.

---

# Phase 0 --- Project Foundation

## Goal

Create a stable foundation for the application.

### Deliverables

- Initialize Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- ESLint & Prettier
- Environment configuration
- Supabase connection
- Authentication scaffold
- Project folder structure
- Global layout
- Theme (Light/Dark)
- Error boundary
- Loading states

Exit Criteria: - Project runs locally. - CI passes. - Authentication is
functional.

---

# Phase 1 --- Database & Core Models

## Goal

Create scalable database schema.

Tables: - users - organizations - assessments - competencies -
personas - questions - answer_options - competency_weights -
assessment_sessions - responses - results - certificates

Requirements: - Foreign keys - Indexes - RLS policies - Soft deletes -
Audit timestamps

Exit Criteria: - Database migration succeeds. - Seed data available.

---

# Phase 2 --- Authentication & User Management

Deliverables: - Sign up - Login - Password reset - User profile -
Roles - Protected routes

Roles: - Super Admin - Organization Admin - Trainer - User

Exit Criteria: - Users can authenticate and access permitted areas.

---

# Phase 3 --- Question Engine

Deliverables: - Question model - Question renderer - Scenario cards -
Randomization - Progress indicator - Autosave

Future-ready for: - Image questions - Video questions - Adaptive
questions

Exit Criteria: - Users can complete an assessment.

---

# Phase 4 --- Hidden Scoring Engine

Requirements: - Competency weighting - Persona assignment - Overall
score normalization - Confidence score - Configurable rules

Never hard-code score thresholds.

Exit Criteria: - Results generated correctly.

---

# Phase 5 --- Results Experience

Deliverables: - Overall score - Persona - Competency breakdown -
Radar/bar charts - Personalized recommendations

Exit Criteria: - Results page complete.

---

# Phase 6 --- Certificate Engine

Deliverables: - PDF certificate - QR verification - Share image - Unique
certificate ID

Exit Criteria: - Downloadable certificate.

---

# Phase 7 --- Admin CMS

Deliverables: - Dashboard - Question management - Competency
management - Persona management - Branding - Assessment configuration

Exit Criteria: - Admin manages the platform without code changes.

---

# Phase 8 --- Organization Features

Deliverables: - Organizations - Departments - Team dashboard -
Benchmarking - Invitations

Exit Criteria: - Organizations can manage members.

---

# Phase 9 --- AI Layer

Deliverables: - AI feedback - Learning recommendations - Question
suggestions - Admin insights

Exit Criteria: - AI features operational.

---

# Phase 10 --- Analytics

Deliverables: - Completion metrics - Score distribution - Competency
trends - Question analytics

Exit Criteria: - Actionable analytics dashboard.

---

# Definition of Done

Before closing any phase:

- Code reviewed
- No TypeScript errors
- Responsive UI
- Accessibility checked
- Error handling complete
- Documentation updated
- Ready for production

---

# Development Workflow

For every new phase:

1.  Review BLUEPRINT.md
2.  Review QUESTION_FRAMEWORK.md
3.  Review CLAUDE.md
4.  Review this IMPLEMENTATION_PLAN.md
5.  Propose architecture for the phase.
6.  Wait for approval if major design changes are required.
7.  Implement.
8.  Self-review.
9.  Refactor if needed.
10. Commit with a clear message.

The objective is not simply to ship features, but to build a
maintainable SaaS platform that can evolve into the leading AI
work-style assessment system.
