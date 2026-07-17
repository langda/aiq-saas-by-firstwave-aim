# AIQ — Experience Review v2: The Office Worker Pivot

> Against the Decision-21 directive (identity platform, office-worker lens,
> radical result simplification). Status: **proposal — awaiting founder
> approval.** Companion to UX_PHILOSOPHY.md (v1 rules remain in force).

## The honest audit

Phases A–D fixed the _emotional shape_ (reveal, stars, taglines, share cards).
What they did not fix — and this directive correctly names — is the **voice
and the lens**. Concretely:

1. **The landing page still teaches our vocabulary.** "A 3-minute behavioral
   assessment that reveals your AI work style" — _behavioral assessment_ is
   our term, not the user's question. Office workers don't search for
   assessments; they wonder _"am I using ChatGPT right?"_
2. **The questions still smell technical.** "The sensitive analysis" says
   _anonymization step_ (a banned word, in our own seed content). "The Monday
   report" says _automated pipeline_. Q4 says _dataset_. An accounts person
   in a normal office has never "designed an anonymization step."
3. **The results page is still half a report.** Below a great hero sit
   competency bars, a radar, a score line, strengths/unlocks, and a
   recommendations card — a dashboard wearing a party hat. On mobile it's
   4–5 screens of scrolling.
4. **The word "assessment" appears on nearly every surface.**

## Conflicts I must flag before you approve (CTO duty)

- **A. Scores must survive internally.** Competency scores and the overall
  score are not decoration — they _are_ how the persona is chosen (signature
  affinity needs the competency vector), how the stars are computed, and what
  the Superpower badge reads. I will remove every user-facing rendering of
  them, but the engine, database fields, and stored results stay. Removing
  those would un-approve the assessment model you re-approved in this same
  directive. **Proposal: remove from every screen; keep engine + data intact.**
- **B. "Three Moves" removal rolls back Milestone 5.** Removing it _entirely_
  (your instruction: including supporting features) means deleting the AI
  recommendation engine, the fallback library, its two database tables, and
  the OpenAI integration — built and verified last session, and BLUEPRINT
  says "results must be actionable." I'll follow your call; my
  recommendation: **full clean removal** (git history preserves it for a
  one-command revival if a "growth" surface returns post-launch, e.g. inside
  a future weekly email rather than the reveal screen). Half-removed dead
  code would be worse than either choice.
- **C. Certificate score = Decision 6 amendment.** Two days ago you chose to
  keep "/100" on the PDF. Under "no analytics anywhere," I now recommend the
  PDF drops the number too (persona + stars + level + QR). Needs your
  explicit yes since it supersedes a recorded decision.
- **D. Question immutability (§4.5).** Live questions with responses can't be
  edited. The rewrite ships as a **new v2 question set**: publish 8 new,
  archive the old — reproducibility preserved, zero engine changes.

---

## Screen-by-screen proposal

### 1. Landing — three hero concepts (pick one)

**Concept 1 — "The Question" (recommended).**

> # What kind of AI user are you?
>
> Everyone uses AI differently. 8 everyday work moments. 3 minutes. Find out.
> [ Find out → ] · five persona cards below: "One of these is you."
> _Psychology: opens with the exact question users already ask themselves —
> self-curiosity is the strongest click motive there is. Zero vocabulary to
> learn before clicking._

**Concept 2 — "The Doubt".**

> # Am I using AI the right way?
>
> Stop wondering. Three minutes, no sign-up, and you'll know your answer.
> _Psychology: names the private insecurity ~80% of office workers carry;
> relief-seeking is a powerful driver — but it opens on a slightly anxious
> note, which brushes against No Shame._

**Concept 3 — "The Reveal".**

> Five ways people work with AI. _(five cards, one glowing face-down)_
>
> # One of these is you.
>
> [ Turn the card → ]
> _Psychology: pure Wrapped-style mystery-box; strongest visual, weakest for
> SEO/clarity for cold traffic._

**Recommendation: Concept 1 headline + Concept 3's card visual** as the
persona strip (already built). Subtitle drops "behavioral assessment"
forever.

### 2. The word "assessment" — banned from user surfaces

"Reveal", "discover", "find out", "your work style" everywhere a user reads.
(Stays in: admin, docs, SEO metadata where it earns search traffic.)
_Psychology: tests trigger evaluation anxiety; discovery triggers curiosity.
Same product, opposite emotional posture._

### 3. Questions v2 — the office-worker rewrite (all 9)

Every scenario re-grounded in your task list (emails, slides, meeting notes,
customer replies, quotations, spreadsheets); every option rewritten as
something a colleague would _say_; banned-word sweep (our own seed used
"anonymization", "pipeline", "dataset"). Signals/weights per option keep the
same competency intent — the engine notices nothing. Two worked examples:

> **"The salary spreadsheet"** _(replaces "The sensitive analysis")_
> HR asks you to tidy up a spreadsheet — it has everyone's salaries in it.
> AI would finish it in minutes.
>
> 1. Take the names and salaries out first, then let AI sort the rest.
> 2. Ask your manager if it's okay to use AI for this one.
> 3. Just use AI — it stays inside the company anyway.
> 4. Set it up so the names come out automatically every time — then anyone
>    on the team can do this safely.

> **"The 4:50pm email"** _(replaces "The last-minute review")_
> A teammate asks you to quickly check an important customer email that AI
> wrote for them. It goes out at 5:00.
>
> 1. Read the two or three lines that could cause real trouble, check those.
> 2. Paste it back into AI and ask "what's wrong with this email?"
> 3. Tell them to send it — they know the customer better than you do.
> 4. Ask the customer contact for 30 more minutes and check everything.

Plus a standing prompt under every scenario in the runner:
**"What would you normally do?"** — the Coffee Break Rule as literal UI.
_Psychology: recognition ("that happened to me last week") produces
engagement and honest answers; unfamiliar scenarios produce guessing, which
also corrupts the signal quality. This change improves the product AND the
data._

### 4. Runner

Already has milestones/springs/reveal (Phase B). Adds: the standing
"What would you normally do?" line; intro copy loses "no right answers —
answer honestly" preachiness in favor of _"Just pick what you'd actually do."_

### 5. Result v3 — one phone screen, nothing else

**Keeps (the seven approved elements):** big artwork · persona name · stars +
level · tagline · Superpower badge · Share · Continue.
**Removes entirely (not collapsed, not moved):** competency bars, radar,
"Overall score: N/100" line, Strengths, Your Next Unlocks, Three Moves This
Week — components, panels, and (per B above) the whole recommendations
feature: `features/recommendations/`, `lib/ai/`, prompts, fallback templates,
the submit-time generation trigger, and a migration dropping
`ai_recommendations` + `recommendation_templates`. Dashboard's score line
chart also goes (a score chart is analytics); "Your journey" keeps
persona + level timeline.
**Below the Continue scroll:** only the certificate/share card and the date.
_Psychology: one screen = one message = "that's me." Every extra section
dilutes pride into homework. Duolingo never shows you the gradebook._

### 6. Certificate

Persona artwork attempt + stars + level + QR. **Score removed (pending your
C answer).** Copy sweep: "This certifies that" stays (pride language).

### 7. Share

Already identity-only (Phase C). Adds "I got AI Builder" as the share text
("I got X" is the proven viral formula — it invites "what did you get?").

### 8. Emails

Already identity-led; sweep for banned words; subject A/B-ready copy:
"You got AI Builder ⭐"

---

## What this costs (so the approval is informed)

- Deletes a shipped milestone's code (M5) and two DB tables — revivable from
  git, but a real rollback.
- Amends Decision 6 (certificate score) if C = yes.
- Question set v2 invalidates the old set's calibration continuity (trivial
  now — all data is test data; would matter post-launch).
- `OPENAI_API_KEY` becomes unused (remove from Vercel or keep for later).

## Approval checklist

1. Landing: Concept 1 (recommended) / 2 / 3?
2. Recommendations engine: full clean removal (recommended) or park it?
3. Certificate: drop the /100 too (recommended)?
4. Question set v2: approve the two samples' voice → I author all 9 in that
   register and publish/archive per §4.5.
