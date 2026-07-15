/**
 * Hand-authored database types covering the columns Milestone 1 code touches.
 * TEMPORARY: replace with `npm run db:types` output once the cloud project is
 * linked (CI will then fail if this file drifts from the real schema).
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Required extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<{
        id: string;
        email: string;
        full_name: string | null;
        role: "super_admin" | "org_admin" | "trainer" | "user";
        org_id: string | null;
      }>;
      competencies: Table<{
        id: string;
        slug: string;
        name: string;
        description: string;
        display_order: number;
        status: string;
      }>;
      personas: Table<{
        id: string;
        slug: string;
        name: string;
        description: string;
        display_order: number;
        status: string;
      }>;
      assessments: Table<{
        id: string;
        slug: string;
        title: string;
        description: string;
        question_count: number;
        selection_strategy: Json;
        status: string;
        settings: Json;
      }>;
      assessment_questions: Table<{
        assessment_id: string;
        question_id: string;
        position: number;
      }>;
      questions: Table<{
        id: string;
        title: string;
        scenario: string;
        status: string;
        version: number;
        industry_tags: string[];
      }>;
      answer_options: Table<{
        id: string;
        question_id: string;
        content: string;
        author_position: number;
      }>;
      option_signals: Table<{
        id: string;
        option_id: string;
        competency_id: string;
        trait_id: string | null;
        weight: number;
      }>;
      scoring_configs: Table<{
        id: string;
        version: number;
        config: Json;
        status: "draft" | "active" | "retired";
      }>;
      assessment_sessions: Table<
        {
          id: string;
          user_id: string;
          assessment_id: string;
          org_id: string | null;
          status: "in_progress" | "completed" | "abandoned" | "expired";
          served_questions: Json;
          seed: string;
          scoring_config_id: string;
          claim_token: string | null;
          started_at: string;
          completed_at: string | null;
        },
        | "user_id"
        | "assessment_id"
        | "served_questions"
        | "seed"
        | "scoring_config_id"
      >;
      responses: Table<
        {
          id: string;
          session_id: string;
          question_id: string;
          option_id: string;
          answered_at: string;
          time_spent_ms: number | null;
        },
        "session_id" | "question_id" | "option_id"
      >;
      results: Table<
        {
          id: string;
          session_id: string;
          user_id: string;
          overall_score: number;
          competency_scores: Json;
          persona_id: string;
          secondary_persona_id: string | null;
          persona_affinities: Json;
          strengths: Json;
          blind_spots: Json;
          confidence: Json;
          scoring_config_id: string;
          scoring_snapshot: Json;
          created_at: string;
        },
        | "session_id"
        | "user_id"
        | "overall_score"
        | "competency_scores"
        | "persona_id"
        | "confidence"
        | "scoring_config_id"
        | "scoring_snapshot"
      >;
      events: Table<
        {
          id: number;
          user_id: string | null;
          session_id: string | null;
          type: string;
          payload: Json;
        },
        "type"
      >;
      audit_logs: Table<
        {
          id: number;
          actor_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          diff: Json;
          created_at: string;
        },
        "actor_id" | "action" | "entity_type" | "entity_id"
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
