import { google } from "@ai-sdk/google";
import { generateText, Output, type ModelMessage } from "ai";
import type { z } from "zod";

const PRIMARY_MODEL = process.env["GEMINI_MODEL"] || "gemini-3.5-flash-lite";
const FALLBACK_MODELS = ["gemini-flash-lite-latest", "gemini-3.5-flash"];

export class AiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AiError";
    this.status = status;
  }
}

/** Runs a fast structured Gemini request server-side and returns the parsed object. */
export async function runStructured<T extends z.ZodType>(
  schema: T,
  system: string,
  messages: ModelMessage[],
): Promise<z.infer<T>> {
  if (!process.env["GOOGLE_GENERATIVE_AI_API_KEY"]) {
    throw new AiError("Gemini API key is not configured.", 500);
  }

  const modelsToTry = [
    PRIMARY_MODEL,
    ...FALLBACK_MODELS.filter((m) => m !== PRIMARY_MODEL),
  ];

  let lastError: unknown;

  for (const modelName of modelsToTry) {
    const start = Date.now();
    console.log(`[Gemini] Requesting "${modelName}"...`);

    try {
      const result = await generateText({
        model: google(modelName),
        system,
        messages,
        output: Output.object({ schema }),
        maxRetries: 1, // Fail over fast instead of waiting 10+ seconds on rate limits
      });

      console.log(
        `[Gemini] Success with "${modelName}" in ${Date.now() - start}ms`,
      );
      return result.output as z.infer<T>;
    } catch (error) {
      const duration = Date.now() - start;
      console.warn(
        `[Gemini] Model "${modelName}" failed after ${duration}ms, trying next fallback...`,
      );
      lastError = error;
    }
  }

  const err = lastError as {
    statusCode?: number;
    status?: number;
    message?: string;
  };
  const status = err?.statusCode ?? err?.status ?? 500;

  if (status === 429) {
    throw new AiError("Gemini rate limit reached. Please try again shortly.", 429);
  }
  if (status === 401 || status === 403) {
    throw new AiError(
      "Gemini API authentication failed. Check your API key and access.",
      status,
    );
  }

  throw new AiError(
    err?.message || "Gemini couldn't complete this request. Please try again.",
    status,
  );
}
