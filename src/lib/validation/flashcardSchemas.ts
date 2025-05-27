import { z } from "zod";

export const CreateFlashcardSchema = z
  .object({
    question: z.string().min(5, { message: "Question must be at least 5 characters long." }),
    answer: z.string().min(3, { message: "Answer must be at least 3 characters long." }),
    isAiGenerated: z.boolean().optional().default(false),
    sourceTextForAi: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.isAiGenerated && (typeof data.sourceTextForAi !== "string" || data.sourceTextForAi.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "sourceTextForAi is required if isAiGenerated is true.",
      path: ["sourceTextForAi"], // Wskazuje pole, którego dotyczy błąd
    }
  );
