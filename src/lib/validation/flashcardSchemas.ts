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

/**
 * Schema for validating query parameters for GET /api/flashcards endpoint
 */
export const GetFlashcardsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).nullable().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).nullable().optional().default(10),
  sortBy: z.enum(["createdAt", "updatedAt", "question"]).nullable().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).nullable().optional().default("desc"),
  search: z.string().nullable().optional(),
  isAiGenerated: z.coerce.boolean().nullable().optional(),
});
