# AIQ — Open Questions

> Decisions needed from the founder before (or during) the marked phase.
> ⛔ = blocks the next milestone. ⚠️ = blocks a later phase but shapes design now. ○ = can be decided later without rework.
>
> **2026-07-14:** Twelve founder decisions resolved most of the original list — see [CHANGELOG.md](./CHANGELOG.md) for the full record. Questions below are renumbered (A–J); resolved originals are archived at the bottom.

---

## Open

**A. ⛔ Persona signature profiles — sign off on the draft values.**
The persona *philosophy* is decided (work styles, primary + secondary — Decision 3) and the affinity model is designed (ARCHITECTURE §11.2). What remains is the content: the draft signature vectors and the single Architect gate in [ASSESSMENT_MODEL.md §5.4](./ASSESSMENT_MODEL.md). These determine who gets called what — pure product judgment. Blocks Milestone 1 exit (first correctly-assigned persona). Also sign off the draft trait taxonomy (§3.2) — cheaper to rename traits before questions are tagged with them.

**B. ⚠️ Confirm the normalization + confidence numbers at Phase 4 exit.**
The formulas are consistent with Decision 4/5 and documented (ARCHITECTURE §11.1, §11.3; ASSESSMENT_MODEL §8). Before Milestone 1 closes, review real scored examples: do the overall scores and confidence levels *feel* right on 8 questions? Parameters (competency weights in the overall, confidence component weights, K) are config — tuning needs no deploy, but the defaults need your eyes.

**C. ⚠️ Data privacy & residency commitments before public launch.**
GDPR-style delete/export? Target markets (EU? SEA?)? Decision 9 established privacy-by-default for orgs — this question is the *platform-level* posture: retention, deletion rights, DPA readiness. Not a code blocker; a launch blocker.

**D. ⚠️ Hosting region / target market.**
Where are the first 1,000 users — Cambodia/SEA, global English, US? Sets Supabase + Vercel regions (e.g., Singapore vs US East); annoying to move later. Blocks production project creation in Milestone 0 (local dev can start regardless).

**E. ⚠️ Brand visual identity before Phase 5 (Results).**
Positioning is decided (Decision 12: "AI Work Style & Readiness Assessment", behavioral not exam). Still needed: palette, typeface, persona artwork. Results + certificate are the shareable growth surfaces. **Proposal stands:** I draft a token set (palette, type scale, radii, motion) at Milestone 0 for your approval; persona artwork before Milestone 3.

**F. ○ Transactional email beyond auth mails** (certificate-issued email, later org invitations). Resend is the natural pick. Confirm nothing beyond Supabase's built-in auth emails is expected in V1.

**G. ○ External product-analytics tool.** Events table covers V1 funnel metrics. Add PostHog only if you want session replays / no-code funnel exploration. Recommendation: none for V1.

**H. ○ Domain.** "AIQ" confirmed as working name (Decision 12). The certificate engine (Milestone 4) bakes the name/domain into PDFs, verify URLs, and OG images — that's the point of no return for cheap renaming.

**I. ○ Dark mode at launch or fast-follow?** Tokens support both from Phase 0; the question is only QA surface at launch. Recommendation: light-only at launch if timeline is tight.

**J. ○ Anonymous-session retention window.** Decision 1 requires purging unclaimed anonymous data; I've set the default to 30 days (configurable). Veto or adjust if you want a different promise in the privacy policy.

---

## Resolved 2026-07-14 (Founder Decisions — full text in CHANGELOG.md)

| Original | Question | Resolution |
|---|---|---|
| #1 | Anonymous assessment? | **Yes — anonymous-first**; auth gate at results; data attached on registration (D1) |
| #2 | MVP scope conflict | MVP = landing, assessment, results, certificate, auth, **thin admin** (question/competency/persona CRUD, weights, publish). No org dashboards/enterprise analytics/LMS/white-label (D2) |
| #3 | Persona rules | Philosophy resolved: **work styles via signature affinity, primary + secondary** (secondary hidden in MVP) (D3). Values → open item A |
| #4 | Normalization sign-off | Hierarchy approved (D4); numeric confirmation → open item B |
| #5 | Confidence score | **Confidence in the assessment**: signal volume × consistency × coverage; low = "we need more information" (D5) |
| #6 | Certificate policy | Every completion earns one; no expiry; cert shows score + primary persona + date; public verify shows name/persona/date only (D6) |
| #7 | Retakes | Every 30 days; history preserved; dashboard shows progress; newest = default profile (D7) |
| #8 | Assessment length | Free 8q (2–3 min); future professional 20–30q, enterprise 40–60q; architecture length-agnostic (D8) |
| #9 | Org privacy | Aggregate-only by default; individual visibility by org policy; privacy as competitive advantage (D9) |
| #11 | Localization | V1 English; architecture localization-ready (D11) |
| #12 | AI provider | OpenAI default; provider-agnostic adapter; Anthropic = adapter-only change (D10) |
| #16 (name part) | Product name | AIQ confirmed as working name; positioning fixed (D12). Domain → open item H |

## Resolved-by-architecture (no decision needed, but veto-able)

- Modular monolith, no microservices (ARCHITECTURE §1.1).
- Server Actions + RSC; no REST layer for our own UI (§8).
- supabase-js + generated types; no ORM in MVP (§4.1).
- Scoring is a pure function; signal mappings RLS-locked and never serialized to clients (§11, §16).
- Certificates: on-demand PDF, nanoid public codes, public verify page (§13).
- AI recommendations async with mandatory static-library fallback (§12).
- "Best answer position" authoring rule superseded by style parity + seeded runtime shuffle (ASSESSMENT_MODEL §9.4).
- Traits layer in schema from day one, surfaced later (ASSESSMENT_MODEL §3.2, ARCHITECTURE §4.3).
- Aggregate analytics enforce a minimum group size (default n ≥ 5) to prevent de-anonymization (§15).
