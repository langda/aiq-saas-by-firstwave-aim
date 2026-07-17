-- Decision 21 (office-worker pivot): the recommendations feature is removed
-- from the product entirely — results are an identity reveal, not a report.
-- The engine, tables, and UI go together ("keep the project clean").
-- Revival path if a growth surface returns post-launch: git history has the
-- full implementation (Milestone 5, commit 6b30a32).

drop table if exists public.ai_recommendations;
drop table if exists public.recommendation_templates;
drop type if exists public.recommendation_status;
