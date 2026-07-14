# AIQ — Assessment Model

> **This document is the intellectual property of AIQ.** It defines *what the platform measures and how* — the conceptual model that every question, score, persona, and recommendation must trace back to. ARCHITECTURE.md implements this model; this document owns its meaning.
> Status: v1.0 (2026-07-14). Persona signature values (§5.4) and trait taxonomy (§3.2) are **drafts pending founder sign-off** — everything else reflects approved Founder Decisions.

---

## 1. What AIQ Measures — and What It Refuses To

AIQ is a **behavioral assessment of AI work style and readiness**, not an AI knowledge exam (Decision 12).

- We never test *what someone knows about AI*. We infer *how someone works with AI* from the decisions they make in realistic situations.
- **There are no right or wrong answers** (Decision 4). An option is never "correct" — it is *characteristic*. Choosing it is evidence of a way of working.
- The output is a **profile**, not a grade. The certificate celebrates a work style; it does not certify a pass.

This stance is a hard design constraint everywhere: no `is_correct` fields in the data model, no pass/fail language in the UI or certificates, no "score" framing in question authoring.

## 2. The Signal Hierarchy

Everything in AIQ flows through one fixed pipeline (Decision 4). Each layer only consumes the layer below it:

```
Answer choice
   └── emits →  BEHAVIORAL SIGNALS      (atomic evidence)
                    └── aggregate →  TRAITS            (fine-grained tendencies)
                                        └── roll up →  COMPETENCIES   (the 8 measured dimensions)
                                                           └── shape →  PERSONAS      (work styles)
                                                                            └── drive →  RECOMMENDATIONS
                                                                                             └── sequence →  LEARNING PATHS
```

Invariants that protect the model:

1. **Signals are the only input to scoring.** Nothing else — not time taken, not question order, not AI inference — may alter a competency score. (Timing data informs *confidence* and question analytics, never scores.)
2. **Personas read competencies, never raw signals.** A persona is a shape over the 8 competencies; it cannot be wired to individual questions.
3. **Recommendations read personas + competency gaps, never raw responses.** The AI recommendation engine receives the profile summary only — it can never see (or leak) question-level data or signal weights.
4. **Each layer is admin-configurable data, not code** (PROJECT_RULES). Adding a trait, re-weighting a signal, or re-shaping a persona is content work, not a deploy.

## 3. Behavioral Signals and Traits

### 3.1 Behavioral Signals

A **behavioral signal** is the atomic unit of evidence: *"choosing this option indicates this trait/competency at this strength."*

Properties of one signal (implemented as one `option_signals` row):

| Property | Meaning |
|---|---|
| `option_id` | The answer choice that emits it |
| `competency_id` | The dimension it evidences |
| `trait_id` (optional) | The specific facet within that competency |
| `weight` | Strength of evidence, typically 0.5–3.0 |

Design rules:

- Every option emits **1–3 signals** (usually 2). An option with zero signals is authoring error; an option with 4+ is unfocused.
- Signals are **positive evidence only** in v1 — an option signals what choosing it *shows*, never penalizes. (Negative weights are representable but banned by authoring policy until we have calibration data; punishment-scoring invites gaming and reads as "wrong answers.")
- A question's four options should collectively cover **2–4 distinct competencies**, so every choice teaches us something different.
- Weights within a question should be balanced: the *total* signal weight of each option should be within ~30% of its siblings. Options are different windows into the person, not bigger/smaller prizes.

### 3.2 Traits — the facet layer (draft taxonomy)

A **trait** is a distinguishable tendency within a competency. Traits exist because "Curiosity 72" hides whether someone explores tools or interrogates outputs — a distinction that matters for recommendations and for authoring coverage at scale (§9).

MVP behavior: signals *may* carry a trait tag; scoring aggregates at competency level; traits surface later in analytics, recommendations, and long-form assessments. The taxonomy (3 per competency, 24 total) — **draft, pending sign-off**:

| Competency | Traits |
|---|---|
| **Curiosity** | Exploration (tries new tools/features) · Interrogation (probes how/why AI behaves) · Boundary-testing (pushes past defaults and templates) |
| **Problem Solving** | Decomposition (breaks work into AI-suitable pieces) · Tool–task fit (picks the right instrument) · Iteration (refines rather than accepts/abandons) |
| **Decision Making** | Verification (checks AI output before acting) · Ownership (keeps accountability for AI-assisted decisions) · Calibration (matches scrutiny to stakes) |
| **Learning Agility** | Feedback incorporation (adjusts approach from results) · Transfer (applies AI patterns across contexts) · Unlearning (drops outdated workflows) |
| **Efficiency** | Automation instinct (spots repetition worth automating) · Prioritization (aims AI at high-value work) · Effort calibration (knows when AI is overkill) |
| **Workflow Design** | Systematization (turns one-offs into repeatable flows) · Delegation design (clear human/AI division of labor) · Composition (chains steps/tools into pipelines) |
| **Judgment** | Risk awareness (data sensitivity, hallucination exposure) · Ethical discernment (people-impact of AI use) · Skepticism calibration (neither naive trust nor reflexive dismissal) |
| **Vision** | Opportunity spotting (sees where AI changes the game) · Strategic framing (connects AI use to business outcomes) · Change advocacy (brings others along) |

Naming note: the source docs use "Learning Agility" (BLUEPRINT) — this is the canonical name (SESSION_1_REVIEW A1.2).

## 4. Competencies

The 8 measured dimensions. Each is defined by what **high** and **low** *behavior* looks like — never by knowledge:

| Competency | High looks like | Low looks like |
|---|---|---|
| Curiosity | Experiments unprompted; asks what else a tool can do | Uses AI only when told to, only as shown |
| Problem Solving | Reframes stuck problems for AI; decomposes before delegating | Pastes the whole problem in; gives up on a bad first answer |
| Decision Making | Verifies proportionally to stakes; owns the outcome | Ships unread AI output, or refuses AI input on decisions entirely |
| Learning Agility | Each AI interaction changes the next one | Repeats the same prompt patterns regardless of results |
| Efficiency | Routes repetitive work to AI; protects deep-work time | Does robotic work manually, or burns time forcing AI onto unsuitable tasks |
| Workflow Design | Builds reusable prompts/flows; documents them for others | Every task starts from scratch |
| Judgment | Knows what not to paste into a model; flags AI-risk to others | Shares sensitive data casually, or blanket-bans AI out of fear |
| Vision | Proposes process-level AI change; anticipates skill shifts | Sees AI as a typing shortcut at most |

Scoring per competency: per-session normalization (`earned / max-possible` for the served question set — ARCHITECTURE §11.1), so scores are comparable across the free (8q), professional (20–30q), and enterprise (40–60q) instruments (Decision 8). A competency with no signals in the served set is "not measured", never zero.

## 5. Personas

### 5.1 Philosophy (Decision 3)

Personas are **work styles, not score ranges**. "AI Builder" does not mean "scored 70–85"; it means *the shape of this person's competency profile resembles the Builder pattern*. Two people with identical overall scores can — and should — land on different personas.

### 5.2 The five personas as work styles

| Persona | Work style | Signature strengths |
|---|---|---|
| **Explorer** | Enthusiastic experimenter; tries everything, systematizes little; energy precedes structure | Curiosity, Learning Agility |
| **Assistant User** | Practical task-delegator; AI is a competent helper summoned for discrete jobs, then dismissed | Efficiency, Problem Solving |
| **AI Collaborator** | Iterative partner; works *with* the model in loops — drafts, critiques, verifies, refines; strong quality instincts | Judgment, Decision Making, Learning Agility |
| **AI Builder** | Systems constructor; converts discoveries into repeatable workflows the whole team can run | Workflow Design, Efficiency, Problem Solving |
| **AI Architect** | Organizational strategist; designs how *groups* adopt AI — processes, guardrails, and direction, not just personal productivity | Vision, Workflow Design, Judgment |

These are **stages of a landscape, not ranks of a ladder**: an Architect is not "better" than a Collaborator — but there *is* a natural growth narrative (Explorer → structured use → systems → strategy) that learning paths exploit (§7).

### 5.3 Assignment: signature-profile affinity

Each persona has a **signature profile** — a weight vector over the 8 competencies describing its characteristic shape. Assignment = similarity between the user's normalized competency vector and each signature (weighted cosine), with optional gates for edge cases. Details in ARCHITECTURE §11.2.

- **Primary persona** = highest affinity → displayed in MVP.
- **Secondary persona** = runner-up above a configurable affinity floor → **computed and stored from day one, displayed post-MVP** (Decision 3), enabling combinations like *Builder–Explorer* ("systematizes fast, never stops experimenting") without re-scoring anyone.

### 5.4 Draft signature profiles (pending founder sign-off — OPEN_QUESTIONS A)

Scale 0–1 per competency; omitted = 0.2 baseline. Values are starting points to be calibrated against real response data:

| Competency | Explorer | Assistant User | Collaborator | Builder | Architect |
|---|---|---|---|---|---|
| Curiosity | **1.0** | 0.3 | 0.6 | 0.6 | 0.6 |
| Problem Solving | 0.4 | **0.7** | 0.7 | **0.8** | 0.6 |
| Decision Making | 0.3 | 0.5 | **0.9** | 0.6 | 0.7 |
| Learning Agility | **0.8** | 0.4 | **0.8** | 0.6 | 0.6 |
| Efficiency | 0.3 | **0.8** | 0.5 | **0.9** | 0.5 |
| Workflow Design | 0.2 | 0.3 | 0.5 | **1.0** | **0.8** |
| Judgment | 0.3 | 0.4 | **1.0** | 0.5 | **0.8** |
| Vision | 0.4 | 0.2 | 0.5 | 0.6 | **1.0** |

Gates (draft): Architect requires overall ≥ 60 (a strategic shape with very weak execution everywhere reads as aspiration, not architecture). No other gates — shape decides.

## 6. Recommendations

**Three recommended actions** per result (QUESTION_FRAMEWORK), generated from the profile — never from raw responses:

- Input: primary persona (+ secondary internally), top strengths, blind spots, confidence level.
- Shape of one recommendation: `{ title, why (ties to their specific profile), how (concrete first step this week) }`.
- Two sources, always in this order of authority:
  1. **Static library** (admin-editable): recommendations keyed by (persona × blind-spot competency). Complete coverage = 5 personas × 8 competencies. This is the guaranteed floor.
  2. **AI generation** (OpenAI default — Decision 10): personalizes tone and specifics, must validate against the recommendation schema, silently falls back to the static library on any failure (ARCHITECTURE §12).
- Voice rules: strengths-first framing ("your Judgment is an asset — aim it at X"), no remediation language ("you failed at..."), actions doable within a week without purchasing anything.

## 7. Learning Paths (future — V5 direction)

A **learning path** is a sequenced set of recommendations targeting a *persona transition* the user chooses (e.g., Assistant User → Builder: "from tasks to systems").

- Structure: path → milestones → recommended actions → (later) re-assessment checkpoints that show competency movement — powered by the preserved result history (Decision 7).
- The 30-day retake cadence is the natural heartbeat of a path: act for a month, re-assess, watch the radar chart move.
- Architectural readiness today: recommendations are stored data (not ephemeral text), results history is preserved, and personas have defined adjacency (§5.2's growth narrative). No path tables are built until V5.

## 8. Scoring Philosophy (summary of commitments)

1. No right answers; signals only (Decision 4).
2. Hidden weights: users never see the mapping (PROJECT_RULES); protected in depth (ARCHITECTURE §16).
3. Per-session normalization → length-agnostic scores (Decision 8).
4. Personas by shape, not bands (Decision 3).
5. **Confidence** (Decision 5) = trust in the profile itself, from signal volume × response consistency × competency coverage. Low confidence says *"we need more information to build an accurate profile"* — and is the honest bridge from the 8-question free profile to longer instruments. An 8-question assessment will typically cap at "Moderate" confidence **by design**; that honesty is brand strategy, not a flaw.
6. Reproducibility: every result snapshots the exact signals + config that produced it.

## 9. Question Design Principles

The formula (QUESTION_FRAMEWORK): **Scenario → Decision → Trade-off → hidden signal mapping.**

1. **Everyday scenario, real stakes.** A Tuesday-afternoon situation (inbox, deadline, meeting, handoff) — not a trolley problem, not a tech demo. Avoid jargon; "the AI tool your team uses," never product names (also keeps questions evergreen).
2. **Force a trade-off.** The scenario must make two goods collide (speed vs. verification, exploration vs. delivery). If one option dominates on every axis, the question measures reading comprehension, not work style.
3. **Four options, four windows.** Each option = a *reasonable person's* genuine response reflecting a different signal profile. The test: a thoughtful colleague could defend any of the four out loud without embarrassment.
4. **Style parity beats position rotation.** Options must match in length (±20%), specificity, tone, and hedging. Runtime shuffling (seeded, server-side) handles position; what authors must prevent is the "most detailed option wins" tell. This supersedes the static "best answer position changes" rule (SESSION_1_REVIEW A1.3).
5. **No virtue-signaling bait.** Never write an option that is obviously The Responsible One ("I would consult my manager and review the policy…"). Social desirability is the #1 validity threat to behavioral self-assessment; every option must carry equal social license.
6. **Signals follow the behavior, not the topic.** A question set in a data-privacy scenario doesn't automatically signal Judgment — the *chosen behavior* does. Map signals to what the choice reveals.
7. **One decision per question.** Compound scenarios ("what would you do first, and then…") produce uninterpretable signals.
8. **Authoring metadata is mandatory**: difficulty, industry tags, competencies touched, trait tags — the coverage machinery of §10 depends on it.

Worked example (authoring format):

> **Scenario:** Your teammate sends a client-ready report drafted by AI and asks you to "quickly sanity-check it" 20 minutes before the deadline.
> **A.** Skim for the claims that would embarrass you if wrong, verify those, flag the rest as unreviewed. → *Decision Making/Calibration +2, Judgment/Risk awareness +1*
> **B.** Run it through the AI again with a critique prompt and compare the two versions. → *Problem Solving/Iteration +2, Curiosity/Interrogation +1*
> **C.** Send it — your teammate is capable and the deadline is real. → *Efficiency/Prioritization +2, Decision Making/Ownership +0.5*
> **D.** Ask for 30 more minutes and check every figure against the source data. → *Judgment/Verification +2, Decision Making/Ownership +1*
>
> Note what makes it work: every option is defensible, each maps to a different behavioral pattern, C is not a "wrong answer" — it's a real work style with real signal.

## 10. Expansion Strategy: 8 → 500 Questions

The question bank is AIQ's compounding asset. Growth is staged by what each scale *unlocks*:

### Stage 1 — Launch: 8 live / ~16 authored
Hand-crafted through the thin admin; every question reviewed against §9 by two humans. Each question feeds 2–3 competencies so 8 questions still produce ~20 signals. Author ~16 so day-one users don't all see an identical set.

### Stage 2 — Rotation: 30–50 (first months)
- **Coverage matrix becomes the authoring dashboard**: signals per competency (target ≥ 6 per competency in-pool), then per trait, per difficulty, per industry tag. Author against the gaps, not by inspiration.
- Random-by-tag selection strategy activates; screenshot-leakage of any single set stops mattering.
- **Calibration begins**: answer distribution (an option chosen by <5% or >60% needs rework), drop-off per question, time-spent outliers, and *discrimination* — does the question actually separate different personas? Questions that don't differentiate are dead weight regardless of how clever they read.

### Stage 3 — Instruments: 100–200
- Unlocks the **professional (20–30q) and enterprise (40–60q) assessments** (Decision 8) with honest "High" confidence — trait-level coverage becomes real, so longer instruments report trait-level insight, not just more precise competency bars.
- **AI-assisted authoring pipeline** (the highest-leverage internal AI feature): the model drafts scenario + options + *suggested* signal mappings from a coverage-gap brief; humans approve every signal weight. AI drafts, humans decide — same authority split as user-facing recommendations.
- Industry packs (tags already in schema) let enterprise assessments feel native to the buyer's world.

### Stage 4 — Adaptive: 300–500 (V4)
- Enough calibrated items for **adaptive selection**: the engine picks the next question to maximize information where the profile is most uncertain — driving confidence up with fewer questions. Architecturally this is only a new `selection_strategy` type; sessions already snapshot exactly what was served (ARCHITECTURE §10).
- Item retirement pipeline: age, exposure rate, and drifting discrimination retire questions automatically into review.

### Version discipline at every stage
Editing a live question with recorded responses is forbidden by admin guardrail — archive and replace (new version). Results always snapshot what they were scored against; the bank can churn freely without corrupting anyone's history.

---

*Any feature, question, or scoring change that cannot be expressed in this document's vocabulary — signal, trait, competency, persona, recommendation, path — is either out of scope or a proposal to amend this model. Amendments require a founder decision and a CHANGELOG entry.*
