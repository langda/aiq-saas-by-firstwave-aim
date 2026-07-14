-- AIQ seed: taxonomy, scoring config v1, the free assessment, 8 questions.
-- Fixed UUIDs so seed is idempotent and content is referenceable.
-- Question authoring follows ASSESSMENT_MODEL.md §9 (signal profiles, not
-- right answers; style parity; every option defensible).

-- ---------- competencies ----------
insert into public.competencies (id, slug, name, description, display_order) values
  ('c1000000-0000-4000-8000-000000000001', 'curiosity',        'Curiosity',        'Experiments unprompted; asks what else a tool can do.', 1),
  ('c1000000-0000-4000-8000-000000000002', 'problem-solving',  'Problem Solving',  'Reframes stuck problems for AI; decomposes before delegating.', 2),
  ('c1000000-0000-4000-8000-000000000003', 'decision-making',  'Decision Making',  'Verifies proportionally to stakes; owns the outcome.', 3),
  ('c1000000-0000-4000-8000-000000000004', 'learning-agility', 'Learning Agility', 'Each AI interaction changes the next one.', 4),
  ('c1000000-0000-4000-8000-000000000005', 'efficiency',       'Efficiency',       'Routes repetitive work to AI; protects deep-work time.', 5),
  ('c1000000-0000-4000-8000-000000000006', 'workflow-design',  'Workflow Design',  'Builds reusable prompts and flows; documents them for others.', 6),
  ('c1000000-0000-4000-8000-000000000007', 'judgment',         'Judgment',         'Knows what not to paste into a model; flags AI risk to others.', 7),
  ('c1000000-0000-4000-8000-000000000008', 'vision',           'Vision',           'Proposes process-level AI change; anticipates skill shifts.', 8)
on conflict (id) do nothing;

-- ---------- traits (ASSESSMENT_MODEL §3.2, v1) ----------
insert into public.traits (id, competency_id, slug, name, description, display_order) values
  ('a1000000-0000-4000-8000-000000000101', 'c1000000-0000-4000-8000-000000000001', 'exploration',            'Exploration',            'Tries new tools and features.', 1),
  ('a1000000-0000-4000-8000-000000000102', 'c1000000-0000-4000-8000-000000000001', 'interrogation',          'Interrogation',          'Probes how and why AI behaves.', 2),
  ('a1000000-0000-4000-8000-000000000103', 'c1000000-0000-4000-8000-000000000001', 'boundary-testing',       'Boundary-testing',       'Pushes past defaults and templates.', 3),
  ('a1000000-0000-4000-8000-000000000201', 'c1000000-0000-4000-8000-000000000002', 'decomposition',          'Decomposition',          'Breaks work into AI-suitable pieces.', 1),
  ('a1000000-0000-4000-8000-000000000202', 'c1000000-0000-4000-8000-000000000002', 'tool-task-fit',          'Tool–task fit',          'Picks the right instrument.', 2),
  ('a1000000-0000-4000-8000-000000000203', 'c1000000-0000-4000-8000-000000000002', 'iteration',              'Iteration',              'Refines rather than accepts or abandons.', 3),
  ('a1000000-0000-4000-8000-000000000301', 'c1000000-0000-4000-8000-000000000003', 'verification',           'Verification',           'Checks AI output before acting.', 1),
  ('a1000000-0000-4000-8000-000000000302', 'c1000000-0000-4000-8000-000000000003', 'ownership',              'Ownership',              'Keeps accountability for AI-assisted decisions.', 2),
  ('a1000000-0000-4000-8000-000000000303', 'c1000000-0000-4000-8000-000000000003', 'calibration',            'Calibration',            'Matches scrutiny to stakes.', 3),
  ('a1000000-0000-4000-8000-000000000401', 'c1000000-0000-4000-8000-000000000004', 'feedback-incorporation', 'Feedback incorporation', 'Adjusts approach from results.', 1),
  ('a1000000-0000-4000-8000-000000000402', 'c1000000-0000-4000-8000-000000000004', 'transfer',               'Transfer',               'Applies AI patterns across contexts.', 2),
  ('a1000000-0000-4000-8000-000000000403', 'c1000000-0000-4000-8000-000000000004', 'unlearning',             'Unlearning',             'Drops outdated workflows.', 3),
  ('a1000000-0000-4000-8000-000000000501', 'c1000000-0000-4000-8000-000000000005', 'automation-instinct',    'Automation instinct',    'Spots repetition worth automating.', 1),
  ('a1000000-0000-4000-8000-000000000502', 'c1000000-0000-4000-8000-000000000005', 'prioritization',         'Prioritization',         'Aims AI at high-value work.', 2),
  ('a1000000-0000-4000-8000-000000000503', 'c1000000-0000-4000-8000-000000000005', 'effort-calibration',     'Effort calibration',     'Knows when AI is overkill.', 3),
  ('a1000000-0000-4000-8000-000000000601', 'c1000000-0000-4000-8000-000000000006', 'systematization',        'Systematization',        'Turns one-offs into repeatable flows.', 1),
  ('a1000000-0000-4000-8000-000000000602', 'c1000000-0000-4000-8000-000000000006', 'delegation-design',      'Delegation design',      'Clear human/AI division of labor.', 2),
  ('a1000000-0000-4000-8000-000000000603', 'c1000000-0000-4000-8000-000000000006', 'composition',            'Composition',            'Chains steps and tools into pipelines.', 3),
  ('a1000000-0000-4000-8000-000000000701', 'c1000000-0000-4000-8000-000000000007', 'risk-awareness',         'Risk awareness',         'Data sensitivity, hallucination exposure.', 1),
  ('a1000000-0000-4000-8000-000000000702', 'c1000000-0000-4000-8000-000000000007', 'ethical-discernment',    'Ethical discernment',    'People-impact of AI use.', 2),
  ('a1000000-0000-4000-8000-000000000703', 'c1000000-0000-4000-8000-000000000007', 'skepticism-calibration', 'Skepticism calibration', 'Neither naive trust nor reflexive dismissal.', 3),
  ('a1000000-0000-4000-8000-000000000801', 'c1000000-0000-4000-8000-000000000008', 'opportunity-spotting',   'Opportunity spotting',   'Sees where AI changes the game.', 1),
  ('a1000000-0000-4000-8000-000000000802', 'c1000000-0000-4000-8000-000000000008', 'strategic-framing',      'Strategic framing',      'Connects AI use to business outcomes.', 2),
  ('a1000000-0000-4000-8000-000000000803', 'c1000000-0000-4000-8000-000000000008', 'change-advocacy',        'Change advocacy',        'Brings others along.', 3)
on conflict (id) do nothing;

-- ---------- personas ----------
insert into public.personas (id, slug, name, description, display_order) values
  ('b1000000-0000-4000-8000-000000000001', 'explorer',        'Explorer',        'Enthusiastic experimenter; tries everything, systematizes little — energy precedes structure.', 1),
  ('b1000000-0000-4000-8000-000000000002', 'assistant-user',  'Assistant User',  'Practical task-delegator; AI is a competent helper summoned for discrete jobs.', 2),
  ('b1000000-0000-4000-8000-000000000003', 'ai-collaborator', 'AI Collaborator', 'Iterative partner; drafts, critiques, verifies, refines — strong quality instincts.', 3),
  ('b1000000-0000-4000-8000-000000000004', 'ai-builder',      'AI Builder',      'Systems constructor; converts discoveries into repeatable workflows the whole team can run.', 4),
  ('b1000000-0000-4000-8000-000000000005', 'ai-architect',    'AI Architect',    'Organizational strategist; designs how groups adopt AI — processes, guardrails, direction.', 5)
on conflict (id) do nothing;

-- ---------- scoring config v1 (Decision 15: signatures are config) ----------
insert into public.scoring_configs (id, version, status, config) values (
  'f2000000-0000-4000-8000-000000000001', 1, 'active',
  '{
    "version": 1,
    "competencies": ["curiosity","problem-solving","decision-making","learning-agility","efficiency","workflow-design","judgment","vision"],
    "overall": { "competencyWeights": {} },
    "strengths": { "count": 3, "minScore": 65 },
    "blindSpots": { "count": 3, "maxScore": 45 },
    "personas": {
      "signatures": [
        { "persona": "explorer",        "profile": { "curiosity": 1.0, "problem-solving": 0.4, "decision-making": 0.3, "learning-agility": 0.8, "efficiency": 0.3, "workflow-design": 0.2, "judgment": 0.3, "vision": 0.4 } },
        { "persona": "assistant-user",  "profile": { "curiosity": 0.3, "problem-solving": 0.7, "decision-making": 0.5, "learning-agility": 0.4, "efficiency": 0.8, "workflow-design": 0.3, "judgment": 0.4, "vision": 0.2 } },
        { "persona": "ai-collaborator", "profile": { "curiosity": 0.6, "problem-solving": 0.7, "decision-making": 0.9, "learning-agility": 0.8, "efficiency": 0.5, "workflow-design": 0.5, "judgment": 1.0, "vision": 0.5 } },
        { "persona": "ai-builder",      "profile": { "curiosity": 0.6, "problem-solving": 0.8, "decision-making": 0.6, "learning-agility": 0.6, "efficiency": 0.9, "workflow-design": 1.0, "judgment": 0.5, "vision": 0.6 } },
        { "persona": "ai-architect",    "profile": { "curiosity": 0.6, "problem-solving": 0.6, "decision-making": 0.7, "learning-agility": 0.6, "efficiency": 0.5, "workflow-design": 0.8, "judgment": 0.8, "vision": 1.0 }, "gates": { "overallGte": 60 } }
      ],
      "baseline": 0.2,
      "secondary": { "minAffinity": 0.55, "display": false },
      "fallback": "explorer"
    },
    "confidence": {
      "weights": { "volume": 1, "consistency": 1, "coverage": 1 },
      "minSignalsPerCompetency": 2,
      "targetSignalVolume": 24,
      "levels": { "high": 0.75, "moderate": 0.45 }
    }
  }'::jsonb
)
on conflict (id) do nothing;

-- ---------- the free assessment (Decision 8: 8 questions) ----------
insert into public.assessments (id, slug, title, description, question_count, selection_strategy, status, settings) values (
  'f1000000-0000-4000-8000-000000000001', 'aiq', 'AIQ Work Style Assessment',
  'Eight everyday work scenarios. There are no right answers — answer honestly.',
  8, '{"type":"fixed","shuffle":true}'::jsonb, 'published',
  '{"retakeCooldownDays": 30}'::jsonb
)
on conflict (id) do nothing;

-- ---------- questions, options, signals ----------
insert into public.questions (id, title, scenario, status) values
  ('d1000000-0000-4000-8000-000000000001', 'The last-minute review',
   'A teammate sends you a client-ready report drafted with AI and asks you to "quickly sanity-check it" — the deadline is in 20 minutes.', 'published'),
  ('d1000000-0000-4000-8000-000000000002', 'The new tool',
   'Your company rolls out a new AI assistant this morning. Your week is already fully booked.', 'published'),
  ('d1000000-0000-4000-8000-000000000003', 'The Monday report',
   'Every Monday you spend two hours compiling a status report from the same three sources. It goes to management.', 'published'),
  ('d1000000-0000-4000-8000-000000000004', 'The wrong answer',
   'You ask an AI tool to analyze a dataset and the result looks clearly off.', 'published'),
  ('d1000000-0000-4000-8000-000000000005', 'The sensitive analysis',
   'You are preparing an analysis that involves salary data and personal details. AI would speed it up considerably.', 'published'),
  ('d1000000-0000-4000-8000-000000000006', 'The discovery',
   'You have found an AI workflow that saves you three hours a week. Nobody else on the team knows about it yet.', 'published'),
  ('d1000000-0000-4000-8000-000000000007', 'The disagreement',
   'An AI tool suggests an approach that directly contradicts what a senior colleague recommended.', 'published'),
  ('d1000000-0000-4000-8000-000000000008', 'The planning meeting',
   'Your team is planning next quarter. You have been asked where AI should fit into the team''s work.', 'published')
on conflict (id) do nothing;

insert into public.answer_options (id, question_id, content, author_position) values
  -- Q1: the last-minute review
  ('e1000000-0000-4000-8000-000000000011', 'd1000000-0000-4000-8000-000000000001', 'Skim for the claims that would be most damaging if wrong, verify those, and flag the rest as unreviewed.', 1),
  ('e1000000-0000-4000-8000-000000000012', 'd1000000-0000-4000-8000-000000000001', 'Run the report through the AI again with a critique prompt and compare the two versions.', 2),
  ('e1000000-0000-4000-8000-000000000013', 'd1000000-0000-4000-8000-000000000001', 'Send it — your teammate is capable and the deadline is real.', 3),
  ('e1000000-0000-4000-8000-000000000014', 'd1000000-0000-4000-8000-000000000001', 'Ask for thirty more minutes and check every figure against the source data.', 4),
  -- Q2: the new tool
  ('e1000000-0000-4000-8000-000000000021', 'd1000000-0000-4000-8000-000000000002', 'Block an hour anyway and probe it with your hardest real task from last week.', 1),
  ('e1000000-0000-4000-8000-000000000022', 'd1000000-0000-4000-8000-000000000002', 'Read the official guidance first so you use it within policy from day one.', 2),
  ('e1000000-0000-4000-8000-000000000023', 'd1000000-0000-4000-8000-000000000002', 'Ask a colleague who has tried it which two features are actually worth your time.', 3),
  ('e1000000-0000-4000-8000-000000000024', 'd1000000-0000-4000-8000-000000000002', 'Fold it into your existing routine gradually, replacing one small step at a time.', 4),
  -- Q3: the Monday report
  ('e1000000-0000-4000-8000-000000000031', 'd1000000-0000-4000-8000-000000000003', 'Build a reusable template and checklist so the AI drafts it the same way every week.', 1),
  ('e1000000-0000-4000-8000-000000000032', 'd1000000-0000-4000-8000-000000000003', 'Paste the sources into the AI each Monday and ask for a draft, then polish it.', 2),
  ('e1000000-0000-4000-8000-000000000033', 'd1000000-0000-4000-8000-000000000003', 'Keep it manual — it goes to management and the numbers have to be exactly right.', 3),
  ('e1000000-0000-4000-8000-000000000034', 'd1000000-0000-4000-8000-000000000003', 'Propose an automated pipeline so the whole team''s reports work this way.', 4),
  -- Q4: the wrong answer
  ('e1000000-0000-4000-8000-000000000041', 'd1000000-0000-4000-8000-000000000004', 'Break the analysis into smaller steps and re-run them one at a time.', 1),
  ('e1000000-0000-4000-8000-000000000042', 'd1000000-0000-4000-8000-000000000004', 'Investigate which part of the input confused it — you want to know why it failed.', 2),
  ('e1000000-0000-4000-8000-000000000043', 'd1000000-0000-4000-8000-000000000004', 'Do the analysis manually now and revisit the tooling when the deadline has passed.', 3),
  ('e1000000-0000-4000-8000-000000000044', 'd1000000-0000-4000-8000-000000000004', 'Cross-check the result with a different tool or source before deciding anything.', 4),
  -- Q5: the sensitive analysis
  ('e1000000-0000-4000-8000-000000000051', 'd1000000-0000-4000-8000-000000000005', 'Strip names and identifiers first, then use AI on the anonymized data.', 1),
  ('e1000000-0000-4000-8000-000000000052', 'd1000000-0000-4000-8000-000000000005', 'Check what your company''s policy allows before touching AI with this data.', 2),
  ('e1000000-0000-4000-8000-000000000053', 'd1000000-0000-4000-8000-000000000005', 'Use the AI — the output stays internal and the time savings are significant.', 3),
  ('e1000000-0000-4000-8000-000000000054', 'd1000000-0000-4000-8000-000000000005', 'Design an anonymization step the whole team can reuse for cases like this.', 4),
  -- Q6: the discovery
  ('e1000000-0000-4000-8000-000000000061', 'd1000000-0000-4000-8000-000000000006', 'Write it up and share it with the team so everyone gets the three hours back.', 1),
  ('e1000000-0000-4000-8000-000000000062', 'd1000000-0000-4000-8000-000000000006', 'Keep refining it privately until it is robust enough to recommend.', 2),
  ('e1000000-0000-4000-8000-000000000063', 'd1000000-0000-4000-8000-000000000006', 'Show your manager and propose a small pilot with two other people.', 3),
  ('e1000000-0000-4000-8000-000000000064', 'd1000000-0000-4000-8000-000000000006', 'Bank the time — redirect the saved hours into your most important project.', 4),
  -- Q7: the disagreement
  ('e1000000-0000-4000-8000-000000000071', 'd1000000-0000-4000-8000-000000000007', 'Prototype both approaches quickly and let the results decide.', 1),
  ('e1000000-0000-4000-8000-000000000072', 'd1000000-0000-4000-8000-000000000007', 'Go with your colleague — their experience covers context the AI cannot see.', 2),
  ('e1000000-0000-4000-8000-000000000073', 'd1000000-0000-4000-8000-000000000007', 'Bring the AI''s approach to your colleague and ask them to pick it apart.', 3),
  ('e1000000-0000-4000-8000-000000000074', 'd1000000-0000-4000-8000-000000000007', 'Push the AI to argue the strongest possible case for your colleague''s approach, then compare.', 4),
  -- Q8: the planning meeting
  ('e1000000-0000-4000-8000-000000000081', 'd1000000-0000-4000-8000-000000000008', 'Map the team''s processes and identify where AI changes the economics most.', 1),
  ('e1000000-0000-4000-8000-000000000082', 'd1000000-0000-4000-8000-000000000008', 'Budget dedicated learning time so the whole team levels up its AI skills.', 2),
  ('e1000000-0000-4000-8000-000000000083', 'd1000000-0000-4000-8000-000000000008', 'Point AI at the single biggest bottleneck this quarter and measure the effect.', 3),
  ('e1000000-0000-4000-8000-000000000084', 'd1000000-0000-4000-8000-000000000008', 'Keep the plan AI-neutral — adopt tools task by task as concrete needs appear.', 4)
on conflict (id) do nothing;

-- Signals: competency ids — 1 curiosity, 2 problem-solving, 3 decision-making,
-- 4 learning-agility, 5 efficiency, 6 workflow-design, 7 judgment, 8 vision.
insert into public.option_signals (option_id, competency_id, weight) values
  -- Q1
  ('e1000000-0000-4000-8000-000000000011', 'c1000000-0000-4000-8000-000000000003', 2.0),
  ('e1000000-0000-4000-8000-000000000011', 'c1000000-0000-4000-8000-000000000007', 1.0),
  ('e1000000-0000-4000-8000-000000000012', 'c1000000-0000-4000-8000-000000000002', 2.0),
  ('e1000000-0000-4000-8000-000000000012', 'c1000000-0000-4000-8000-000000000001', 1.0),
  ('e1000000-0000-4000-8000-000000000013', 'c1000000-0000-4000-8000-000000000005', 2.0),
  ('e1000000-0000-4000-8000-000000000013', 'c1000000-0000-4000-8000-000000000003', 0.5),
  ('e1000000-0000-4000-8000-000000000014', 'c1000000-0000-4000-8000-000000000007', 2.0),
  ('e1000000-0000-4000-8000-000000000014', 'c1000000-0000-4000-8000-000000000003', 1.0),
  -- Q2
  ('e1000000-0000-4000-8000-000000000021', 'c1000000-0000-4000-8000-000000000001', 2.0),
  ('e1000000-0000-4000-8000-000000000021', 'c1000000-0000-4000-8000-000000000002', 1.0),
  ('e1000000-0000-4000-8000-000000000022', 'c1000000-0000-4000-8000-000000000007', 2.0),
  ('e1000000-0000-4000-8000-000000000022', 'c1000000-0000-4000-8000-000000000003', 0.5),
  ('e1000000-0000-4000-8000-000000000023', 'c1000000-0000-4000-8000-000000000005', 1.5),
  ('e1000000-0000-4000-8000-000000000023', 'c1000000-0000-4000-8000-000000000004', 1.0),
  ('e1000000-0000-4000-8000-000000000024', 'c1000000-0000-4000-8000-000000000004', 2.0),
  ('e1000000-0000-4000-8000-000000000024', 'c1000000-0000-4000-8000-000000000006', 0.5),
  -- Q3
  ('e1000000-0000-4000-8000-000000000031', 'c1000000-0000-4000-8000-000000000006', 2.0),
  ('e1000000-0000-4000-8000-000000000031', 'c1000000-0000-4000-8000-000000000005', 1.0),
  ('e1000000-0000-4000-8000-000000000032', 'c1000000-0000-4000-8000-000000000005', 2.0),
  ('e1000000-0000-4000-8000-000000000032', 'c1000000-0000-4000-8000-000000000004', 0.5),
  ('e1000000-0000-4000-8000-000000000033', 'c1000000-0000-4000-8000-000000000007', 2.0),
  ('e1000000-0000-4000-8000-000000000033', 'c1000000-0000-4000-8000-000000000003', 0.5),
  ('e1000000-0000-4000-8000-000000000034', 'c1000000-0000-4000-8000-000000000008', 2.0),
  ('e1000000-0000-4000-8000-000000000034', 'c1000000-0000-4000-8000-000000000006', 1.0),
  -- Q4
  ('e1000000-0000-4000-8000-000000000041', 'c1000000-0000-4000-8000-000000000002', 2.0),
  ('e1000000-0000-4000-8000-000000000041', 'c1000000-0000-4000-8000-000000000004', 1.0),
  ('e1000000-0000-4000-8000-000000000042', 'c1000000-0000-4000-8000-000000000001', 2.0),
  ('e1000000-0000-4000-8000-000000000042', 'c1000000-0000-4000-8000-000000000002', 1.0),
  ('e1000000-0000-4000-8000-000000000043', 'c1000000-0000-4000-8000-000000000005', 1.0),
  ('e1000000-0000-4000-8000-000000000043', 'c1000000-0000-4000-8000-000000000003', 1.0),
  ('e1000000-0000-4000-8000-000000000044', 'c1000000-0000-4000-8000-000000000007', 2.0),
  ('e1000000-0000-4000-8000-000000000044', 'c1000000-0000-4000-8000-000000000003', 1.0),
  -- Q5
  ('e1000000-0000-4000-8000-000000000051', 'c1000000-0000-4000-8000-000000000007', 2.0),
  ('e1000000-0000-4000-8000-000000000051', 'c1000000-0000-4000-8000-000000000005', 1.0),
  ('e1000000-0000-4000-8000-000000000052', 'c1000000-0000-4000-8000-000000000007', 1.5),
  ('e1000000-0000-4000-8000-000000000052', 'c1000000-0000-4000-8000-000000000003', 1.0),
  ('e1000000-0000-4000-8000-000000000053', 'c1000000-0000-4000-8000-000000000005', 2.0),
  ('e1000000-0000-4000-8000-000000000054', 'c1000000-0000-4000-8000-000000000006', 2.0),
  ('e1000000-0000-4000-8000-000000000054', 'c1000000-0000-4000-8000-000000000008', 1.0),
  -- Q6
  ('e1000000-0000-4000-8000-000000000061', 'c1000000-0000-4000-8000-000000000008', 2.0),
  ('e1000000-0000-4000-8000-000000000061', 'c1000000-0000-4000-8000-000000000006', 1.0),
  ('e1000000-0000-4000-8000-000000000062', 'c1000000-0000-4000-8000-000000000004', 1.5),
  ('e1000000-0000-4000-8000-000000000062', 'c1000000-0000-4000-8000-000000000001', 1.0),
  ('e1000000-0000-4000-8000-000000000063', 'c1000000-0000-4000-8000-000000000008', 1.0),
  ('e1000000-0000-4000-8000-000000000063', 'c1000000-0000-4000-8000-000000000003', 1.5),
  ('e1000000-0000-4000-8000-000000000064', 'c1000000-0000-4000-8000-000000000005', 2.0),
  -- Q7
  ('e1000000-0000-4000-8000-000000000071', 'c1000000-0000-4000-8000-000000000002', 2.0),
  ('e1000000-0000-4000-8000-000000000071', 'c1000000-0000-4000-8000-000000000004', 1.0),
  ('e1000000-0000-4000-8000-000000000072', 'c1000000-0000-4000-8000-000000000003', 1.5),
  ('e1000000-0000-4000-8000-000000000072', 'c1000000-0000-4000-8000-000000000007', 0.5),
  ('e1000000-0000-4000-8000-000000000073', 'c1000000-0000-4000-8000-000000000004', 2.0),
  ('e1000000-0000-4000-8000-000000000073', 'c1000000-0000-4000-8000-000000000007', 1.0),
  ('e1000000-0000-4000-8000-000000000074', 'c1000000-0000-4000-8000-000000000001', 2.0),
  ('e1000000-0000-4000-8000-000000000074', 'c1000000-0000-4000-8000-000000000003', 1.0),
  -- Q8
  ('e1000000-0000-4000-8000-000000000081', 'c1000000-0000-4000-8000-000000000008', 2.0),
  ('e1000000-0000-4000-8000-000000000081', 'c1000000-0000-4000-8000-000000000006', 1.0),
  ('e1000000-0000-4000-8000-000000000082', 'c1000000-0000-4000-8000-000000000004', 2.0),
  ('e1000000-0000-4000-8000-000000000082', 'c1000000-0000-4000-8000-000000000008', 1.0),
  ('e1000000-0000-4000-8000-000000000083', 'c1000000-0000-4000-8000-000000000005', 2.0),
  ('e1000000-0000-4000-8000-000000000083', 'c1000000-0000-4000-8000-000000000002', 1.0),
  ('e1000000-0000-4000-8000-000000000084', 'c1000000-0000-4000-8000-000000000003', 1.0),
  ('e1000000-0000-4000-8000-000000000084', 'c1000000-0000-4000-8000-000000000007', 1.0)
on conflict (option_id, competency_id) do nothing;

insert into public.assessment_questions (assessment_id, question_id, position)
select 'f1000000-0000-4000-8000-000000000001', id,
       row_number() over (order by id)
from public.questions
where id like 'd1000000%'
on conflict do nothing;
