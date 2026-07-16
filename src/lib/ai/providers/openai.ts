import "server-only";

import { serverEnv } from "@/lib/env.server";

/**
 * OpenAI chat-completions call (Decision 10: default provider). Plain fetch —
 * no SDK dependency for one endpoint. Throws on any failure; the caller owns
 * fallback behavior.
 */
export async function completeJson(input: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  if (!serverEnv.OPENAI_API_KEY)
    throw new Error("OPENAI_API_KEY not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serverEnv.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: serverEnv.OPENAI_MODEL,
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: input.maxTokens ?? 700,
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI ${response.status}: ${body.slice(0, 200)}`);
  }
  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned no content");
  return content;
}

export function getModelName(): string {
  return serverEnv.OPENAI_MODEL;
}
