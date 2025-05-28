import type { APIRoute } from "astro";
import { z } from "zod";
import { getFlashcardService } from "../../../lib/services/flashcardService";
import type { FlashcardDto } from "../../../types";

export const prerender = false;

// Schema walidacji dla flashcardId
const FlashcardIdSchema = z.string().uuid({ message: "Flashcard ID must be a valid UUID." });

/**
 * GET /api/flashcards/{flashcardId}
 *
 * Retrieves a single flashcard by its ID for the authenticated user.
 * The user must be the owner of the flashcard and the flashcard must not be deleted.
 *
 * @param locals - Astro locals containing session and supabase client
 * @param params - Route parameters containing flashcardId
 *
 * @returns JSON response with flashcard data
 *
 * Response Codes:
 * - 200: Success with flashcard data
 * - 400: Invalid flashcard ID format
 * - 401: User not authenticated
 * - 403: User doesn't have permission to access this flashcard
 * - 404: Flashcard not found or deleted
 * - 500: Internal server error
 */
export const GET: APIRoute = async ({ locals, params }) => {
  // 1. Uwierzytelnianie i autoryzacja (z Astro.locals)
  const { session, supabase } = locals;

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "User not authenticated." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = session.user.id;

  if (!supabase) {
    console.error("Supabase client not found in locals. Check middleware setup.");
    return new Response(JSON.stringify({ error: "Server configuration error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Pobranie i walidacja flashcardId z parametrów ścieżki
  const { flashcardId } = params;

  if (!flashcardId) {
    return new Response(JSON.stringify({ error: "Flashcard ID is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. Walidacja formatu flashcardId
  const validationResult = FlashcardIdSchema.safeParse(flashcardId);
  if (!validationResult.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid flashcard ID format.",
        details: validationResult.error.flatten().formErrors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const validatedFlashcardId = validationResult.data;

  // 4. Wywołanie serwisu
  try {
    console.log("Fetching flashcard:", validatedFlashcardId, "for user:", userId); // Debug log

    const flashcardService = getFlashcardService(supabase);
    const flashcard = await flashcardService.getFlashcardById(validatedFlashcardId, userId);

    if (!flashcard) {
      return new Response(JSON.stringify({ error: "Flashcard not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Mapowanie wyniku na DTO i zwrócenie odpowiedzi
    const responseDto: FlashcardDto = {
      id: flashcard.id,
      userId: flashcard.user_id,
      question: flashcard.question,
      answer: flashcard.answer,
      sourceTextForAi: flashcard.source_text_for_ai,
      isAiGenerated: flashcard.is_ai_generated,
      aiAcceptedAt: flashcard.ai_accepted_at,
      createdAt: flashcard.created_at,
      updatedAt: flashcard.updated_at,
      isDeleted: flashcard.is_deleted,
    };

    return new Response(JSON.stringify(responseDto), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in GET /api/flashcards/[flashcardId]:", error);

    // Handle edge cases and specific service errors first
    if (error instanceof Error) {
      if (error.message.includes("Forbidden")) {
        return new Response(JSON.stringify({ error: "Access forbidden. You can only access your own flashcards." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (error.message.includes("Not found")) {
        return new Response(JSON.stringify({ error: "Flashcard not found." }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Fallback error handling with proper logging
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
