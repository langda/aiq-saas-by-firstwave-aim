/** Client-facing assessment shapes. NEVER add signal/competency data here. */

export type PublicOption = {
  id: string;
  content: string;
};

export type PublicQuestion = {
  id: string;
  title: string;
  scenario: string;
  options: PublicOption[];
};

/** Everything the runner needs to render and resume a session. */
export type RunnerState = {
  sessionId: string;
  assessmentTitle: string;
  questions: PublicQuestion[];
  /** questionId → chosen optionId (for resume). */
  answers: Record<string, string>;
};
