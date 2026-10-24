import { describe, expect, it } from "vitest";
import { validateDisposal } from "@/lib/disposal-rules";
import type { DisposalAi } from "@/lib/schemas";

const base: DisposalAi = {
  status: "verified",
  category: "Dry Waste",
  explanation: "",
  preparation: ["Rinse and clean"],
  conditions: [],
  exceptions: [],
  limitations: [],
  missing_information: [],
  general_advice: "",
  citations: [{ passage_id: "swm-dry", relevance: "x" }],
};

describe("validateDisposal", () => {
  it("keeps verified when cited and no open questions", () => {
    expect(
      validateDisposal({ ai: base, retrievedIds: ["swm-dry"], unansweredQuestions: 0 }).status,
    ).toBe("verified");
  });

  it("downgrades to conditional when questions are open", () => {
    expect(
      validateDisposal({ ai: base, retrievedIds: ["swm-dry"], unansweredQuestions: 1 }).status,
    ).toBe("conditional");
  });

  it("drops fabricated citations and marks insufficient", () => {
    const r = validateDisposal({
      ai: { ...base, citations: [{ passage_id: "made-up", relevance: "" }] },
      retrievedIds: ["swm-dry"],
      unansweredQuestions: 0,
    });
    expect(r.status).toBe("insufficient");
    expect(r.citations).toHaveLength(0);
  });

  it("is insufficient when nothing was retrieved", () => {
    expect(validateDisposal({ ai: base, retrievedIds: [], unansweredQuestions: 0 }).status).toBe(
      "insufficient",
    );
  });

  it("downgrades when model category does not match cited passage category", () => {
    const r = validateDisposal({
      ai: { ...base, category: "Wet Waste" }, // cited passage "swm-dry" is Dry Waste!
      retrievedIds: ["swm-dry"],
      unansweredQuestions: 0,
    });
    expect(r.status).toBe("insufficient");
    expect(r.downgraded_reason).toBe("Category not supported by cited passage");
  });

  it("filters preparation steps to only those supported by cited passage", () => {
    const r = validateDisposal({
      ai: {
        ...base,
        preparation: [
          "Rinse and clean to remove all food or chemical residue", // matches swm-dry
          "Cook in microwave for 10 minutes", // fabricated / unsupported
        ],
      },
      retrievedIds: ["swm-dry"],
      unansweredQuestions: 0,
    });
    expect(r.preparation).toContain(
      "Rinse and clean to remove all food or chemical residue",
    );
    expect(r.preparation).not.toContain("Cook in microwave for 10 minutes");
  });
});
