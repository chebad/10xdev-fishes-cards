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

/**
 * Schema for validating path parameters for PATCH /api/flashcards/{flashcardId} endpoint
 */
export const updateFlashcardPathParamsSchema = z.object({
  flashcardId: z.string().uuid({ message: "Invalid flashcard ID format." }),
});

/**
 * Schema for validating request body for PATCH /api/flashcards/{flashcardId} endpoint
 */
export const updateFlashcardBodySchema = z
  .object({
    question: z.string().min(5, { message: "Question must be at least 5 characters long." }).optional(),
    answer: z.string().min(3, { message: "Answer must be at least 3 characters long." }).optional(),
  })
  .refine((data) => data.question !== undefined || data.answer !== undefined, {
    message: "At least one field (question or answer) must be provided for update.",
    path: [], // Apply error to the whole object if refinement fails
  });

/**
 * Schema for validating path parameters for DELETE /api/flashcards/{flashcardId} endpoint
 */
export const deleteFlashcardPathParamsSchema = z.object({
  flashcardId: z.string().uuid({ message: "Invalid flashcard ID format." }),
});
