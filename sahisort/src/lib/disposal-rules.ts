import { GUIDE, type GuidePassage } from "./guide";
import type { DisposalAi } from "./schemas";

export type ValidationInput = {
  ai: DisposalAi;
  retrievedIds: string[];
  unansweredQuestions: number;
  retrievedPassages?: GuidePassage[];
};

/**
 * Enforces strict trust rules on an AI disposal recommendation:
 * - Citations must reference passages actually retrieved from the guide
 * - The model's chosen category must match the category of at least one cited passage
 * - Only supported preparation steps from cited passages are retained
 * - "verified" requires at least one valid citation and zero open clarification questions
 * - Empty retrieval => insufficient evidence
 */
export function validateDisposal({
  ai,
  retrievedIds,
  unansweredQuestions,
  retrievedPassages,
}: ValidationInput) {
  // 1. Keep only citations that were actually retrieved
  const citations = ai.citations.filter((c) => retrievedIds.includes(c.passage_id));

  // Look up cited passages from retrieved set or the full statutory guide
  const passageMap = new Map<string, GuidePassage>();
  for (const p of retrievedPassages ?? []) passageMap.set(p.id, p);
  for (const p of GUIDE) {
    if (!passageMap.has(p.id)) passageMap.set(p.id, p);
  }

  const citedPassages = citations
    .map((c) => passageMap.get(c.passage_id))
    .filter(Boolean) as GuidePassage[];

  let status = ai.status;
  let reason: string | null = null;

  if (retrievedIds.length === 0) {
    status = "insufficient";
    reason = "No guide passage matched this object.";
  } else if (status !== "insufficient" && citations.length === 0) {
    status = "insufficient";
    reason = "The recommendation did not cite any guide passage.";
  } else if (citedPassages.length > 0) {
    // 2. Check if the model's chosen category equals the category of at least one cited passage
    const normAiCategory = ai.category.toLowerCase().replace(/ waste$/i, "").trim();
    const categoryMatches = citedPassages.some((p) => {
      const normPassageCategory = p.category.toLowerCase().replace(/ waste$/i, "").trim();
      return (
        normPassageCategory === normAiCategory ||
        p.category.toLowerCase().trim() === ai.category.toLowerCase().trim()
      );
    });

    if (!categoryMatches) {
      status = "insufficient";
      reason = "Category not supported by cited passage";
    } else if (status === "verified" && unansweredQuestions > 0) {
      status = "conditional";
      reason = "Open clarification questions could change this recommendation.";
    }
  }

  // 3. Filter preparation steps: only show steps supported by cited passages
  const citedPrepSteps = citedPassages.flatMap((p) => p.prep_steps ?? []);
  const validCitedPrep = citedPrepSteps.filter(
    (ps) => !ps.startsWith("// TODO"),
  );

  let verifiedPreparation: string[] = [];
  if (ai.preparation && ai.preparation.length > 0) {
    verifiedPreparation = ai.preparation.filter((step) => {
      const norm = step.toLowerCase().trim();
      return validCitedPrep.some((ps) => {
        const psNorm = ps.toLowerCase().trim();
        return psNorm.includes(norm) || norm.includes(psNorm);
      });
    });
  }

  // If AI prep steps didn't match directly, fall back to the cited passage's verified prep steps
  const preparation =
    verifiedPreparation.length > 0 ? verifiedPreparation : validCitedPrep;

  return {
    ...ai,
    status,
    citations,
    preparation,
    downgraded_reason: reason,
  };
}
