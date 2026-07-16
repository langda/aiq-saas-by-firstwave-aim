# AIQ — Emotional UX Review & Redesign Proposal

> Screen-by-screen audit against [UX_PHILOSOPHY.md](./UX_PHILOSOPHY.md).
> Status: **proposal — awaiting founder approval.** No engineering changes;
> everything below is presentation-layer (UI, motion, microcopy, display config).

## The honest diagnosis

The current product is _correct_ and _clean_ — and it feels like exactly what we said it shouldn't: a well-made professional survey. Specific failures:

- **The results page is a report, not a reveal.** It leads with "34 / 100" and the word "Moderate" — a grade and a shrug. The persona (the identity!) shares space with analytics from second one. Fails the 10-Second Rule and the Screenshot Test.
- **Raw scores everywhere** — hero, dashboard, history rows. "34/100" on a first screen is a No-Shame violation; nobody screenshots a 34.
- **"Blind spots"** is deficit language. "Profile confidence: Moderate" reads like a lab result.
- **The runner is efficient but emotionally flat**: zero encouragement, no anticipation build before the reveal — submit lands you on the result with the drama of a page refresh.
- **The claim gate reads as a signup wall** ("Create your free account…") instead of what it actually is: _a sealed result waiting to be opened_.
- **Total smile count, start to finish: ~0–1** (the reveal animation is pleasant). Target is ≥3 in the assessment alone.

What already works and stays: the seeded runner mechanics, keyboard flow, persona artwork, radar chart (below the fold now), all engines untouched.

---

## Screen-by-screen proposals

### 1. Landing

**Now:** competent hero, but generic — nothing to be curious about.
**Proposed:**

- Add a "Which one are you?" strip — the five persona artworks in a row with names. Instant curiosity hook + primes the identity framing before question one. _(Smile #1: "ooh, which one am I?")_
- CTA copy: "Start the assessment" → **"Reveal my AI work style"** · sub-line: "8 scenarios · 3 minutes · no account needed".

### 2. Assessment intro

**Now:** "No right answers — answer honestly" (good instinct, dry delivery).
**Proposed:** persona artwork teasers repeat here; copy: **"8 real-work moments. No right answers. One of five work styles is yours — let's find it."** Button: "Let's find out".

### 3. Runner (the ≥3-smiles zone)

**Now:** clean mechanics, silent emotionally.
**Proposed (all lightweight, reduced-motion safe):**

- **Milestone encouragements** — one line fades in under the progress bar at Q3, Q5, Q7: _"Interesting choices…"_ → _"Your style is taking shape"_ → _"Last one — your reveal is next."_ Anticipation, not cheerleading. _(Smiles #2–3)_
- Progress bar gets a subtle **spring** on each answer and a brief glow at milestones.
- Selected option: soft check-pulse (already half-there; finish it).
- Submit button: "See my results" → **"Reveal my work style"**.

### 4. The Reveal Sequence (new moment — the biggest single change)

**Now:** submit → redirect. No drama whatsoever.
**Proposed:** a 2.5–3s full-screen takeover while submit/scoring runs: staged lines — _"Reading your 8 choices…" → "Mapping your work style…" → "Ready."_ — then the results hero animates in. This is the Wrapped-style anticipation beat; costs one client component, zero engine changes. _(Smile #4)_

### 5. Claim gate (anonymous users)

**Now:** a signup form titled "Your results are ready" — reads as a wall.
**Proposed:** reframe as **the sealed card**: a glowing, face-down result card (generic shimmer — Decision 1 forbids revealing before auth) with _"Your work style is in. One step from the reveal."_ The form becomes the key, not the toll. Existing-account link stays.

### 6. Results — hero v2 (the Screenshot Test screen)

**Now:** persona + 34/100 + "Moderate" + four analytics cards in one scroll.
**Proposed first screen (10-Second Rule — exactly six elements):**

1. **Persona artwork, large** (it finally gets the stage)
2. **Persona name, huge** — "AI Builder"
3. **Achievement level** — ★★★ + an aspirational level name (see below)
4. **One memorable sentence** — a per-persona identity tagline, e.g. Builder: _"You don't use AI. You build with it."_
5. **One Superpower** — the top competency as a badge: _"Superpower: Learning Agility"_
6. **Share** (primary) + **Continue** (scrolls to detail)

Everything analytical — radar, bars, growth areas, confidence, certificate, recommendations — moves **below the fold** under a "Your full profile" divider, with the radar collapsed into an expandable section.

### 7. Achievement levels (replaces visible scoring)

Display-only mapping of overall score → level, stored in **presentation config** (scoring engine untouched). Five levels, all aspirational, minimum two stars filled (No Shame — a one-star achievement is a contradiction):

| Score  | Stars  | Level name | Feel                        |
| ------ | ------ | ---------- | --------------------------- |
| 0–24   | ★★☆☆☆  | **Spark**  | "every mastery starts here" |
| 25–44  | ★★★☆☆  | **Rising** | momentum beginning          |
| 45–64  | ★★★★☆  | **Flow**   | in stride                   |
| 65–84  | ★★★★★  | **Surge**  | operating at force          |
| 85–100 | ★★★★★+ | **Apex**   | rare air (5 stars + glow)   |

Raw numbers survive in: expandable full profile, and the **PDF certificate** (Decision 6 says the certificate shows the overall score; it's the professional artifact — my recommendation is keep it there, your call).

### 8. Language sweep (No Shame pass across all strings)

- "Blind spots" → **"Your next unlocks"**
- "Profile confidence: Moderate" → removed from hero; low-confidence case becomes an invitation: _"8 scenarios sketch your outline — your next session sharpens it."_
- "Your three recommended actions" → **"Three moves for this week"** (title + how visible; why behind a tap — Reduce Reading)
- "None identified in this session" → _"Still emerging — retake to reveal them"_
- "Retake available on Aug 14" → **"Your next evolution unlocks Aug 14"** (anticipation, not lockout)

### 9. Dashboard → "Your identity home"

**Now:** stat card + history list + line chart. Functional, cold.
**Proposed:** persona artwork + name + stars as the hero card; history becomes **"Your journey"** (persona-per-entry timeline — identity changes over time are the story, scores in small type); the retake lock uses the "evolution unlocks" framing.

### 10. Share surfaces (first-class feature)

- **OG/share card v2**: persona artwork prominent, persona name huge, stars + level, holder first name, "aiq" mark — zero analytics, readable in 3 seconds, tested against LinkedIn/X/Telegram/FB preview ratios. Add an **Instagram-Story-ratio variant** (1080×1920) as a downloadable image.
- **Results share row**: native share sheet on mobile (`navigator.share`), plus copy-link — one tap from the hero.
- **Certificate PDF v2**: persona artwork + stars/level added; score retained (per Decision 6, pending your call above).
- **Email v2**: subject "You're an AI Builder — your AIQ profile is ready"; body leads with artwork + identity sentence, one button.

### 11. Verify page

Minor: gets artwork (done) + level stars; stays disclosure-safe (name/persona/date only).

---

## Content needing your approval (product words, not code)

**A. Level names:** Spark · Rising · Flow · Surge · Apex _(alternatives on request)_

**B. Persona taglines (the "one memorable sentence"):**

- Explorer — _"You're the one who tries it first."_
- Assistant User — _"You get things done — AI just makes it faster."_
- AI Collaborator — _"You and AI make each other better."_
- AI Builder — _"You don't use AI. You build with it."_
- AI Architect — _"You're designing how everyone else will work."_

**C. Certificate score:** keep the number on the PDF (recommended) or switch it to stars too?

## Implementation plan (after approval — no engine/schema changes anywhere)

- **Phase A — the reveal & hero v2** (biggest emotional ROI): reveal sequence, results hero, achievement levels (presentation config), language sweep.
- **Phase B — runner delight**: milestone messages, progress spring, submit copy.
- **Phase C — share loop v2**: OG card redesign, story-ratio image, native share, claim-gate "sealed card".
- **Phase D — dashboard, certificate, email warmth.**

Estimated as one milestone-sized effort; verified against the Smile-count and a Screenshot Test on every Phase-A surface.
