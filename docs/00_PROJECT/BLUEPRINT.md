# BLUEPRINT.md

# AIQ Platform Blueprint

## Vision

Build the leading AI work-style assessment platform that measures how
people **apply AI in real work**, not how much AI terminology they know.

The platform should feel like a combination of Typeform, LinkedIn Skill
Assessments, Gallup Strengths, and Linear.

## Core Principles

1.  Measure behavior, not knowledge.
2.  Every question is scenario-based.
3.  No answer should look obviously correct.
4.  Randomize answer order.
5.  Results must be actionable.
6.  Beautiful enough to share.
7.  Enterprise-ready from day one.

## MVP Scope

-   Landing page
-   Assessment
-   Results
-   Certificate
-   User login
-   Admin portal
-   Analytics

## User Journey

Landing → Learn → Assessment → Results → Certificate → Dashboard

## Core Entities

User Organization Assessment Question Answer Option Competency Persona
Result Certificate

## Competencies

-   Curiosity
-   Problem Solving
-   Decision Making
-   Learning Agility
-   Efficiency
-   Workflow Design
-   Judgment
-   Vision

## Assessment Rules

-   Default assessment: 8 questions
-   Randomize question order
-   Randomize answer order
-   Hidden competency weighting
-   Overall score normalized to 100
-   Persona assigned from competency profile

## Personas

Explorer Assistant User AI Collaborator AI Builder AI Architect

## Admin Features

Manage: - Questions - Competencies - Personas - Branding -
Certificates - Organizations - Analytics - Scoring rules

## Tech Stack

Next.js React TypeScript Tailwind CSS shadcn/ui Supabase PostgreSQL
OpenAI Vercel

## Coding Standards

-   Clean architecture
-   Reusable components
-   Strong typing
-   No duplicated business logic
-   Mobile first
-   Accessibility
-   Server-side validation
-   Row Level Security

## Roadmap

V1: Assessment + Results V2: Admin CMS V3: Organizations V4: Adaptive
assessment V5: AI coaching
