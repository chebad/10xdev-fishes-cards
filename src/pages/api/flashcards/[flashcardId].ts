import type { APIRoute } from "astro";
import { z } from "zod";
import { getFlashcardService } from "../../../lib/services/flashcardService";
import type { FlashcardDto } from "../../../types";
import {
  updateFlashcardPathParamsSchema,
  updateFlashcardBodySchema,
  deleteFlashcardPathParamsSchema,
} from "../../../lib/validation/flashcardSchemas";
import type { UpdateFlashcardCommand } from "../../../types";

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

/**
 * PATCH /api/flashcards/{flashcardId}
 *
 * Updates an existing flashcard by its ID for the authenticated user.
 * The user must be the owner of the flashcard and the flashcard must not be deleted.
 * Only provided fields (question and/or answer) will be updated.
 *
 * @param locals - Astro locals containing session and supabase client
 * @param params - Route parameters containing flashcardId
 * @param request - HTTP request object containing the update data
 *
 * @returns JSON response with updated flashcard data
 *
 * Response Codes:
 * - 200: Success with updated flashcard data
 * - 400: Invalid flashcard ID format or request body validation errors
 * - 401: User not authenticated
 * - 403: User doesn't have permission to update this flashcard
 * - 404: Flashcard not found or deleted
 * - 500: Internal server error
 */
export const PATCH: APIRoute = async ({ locals, params, request }) => {
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

  try {
    // 2. Walidacja flashcardId z parametrów ścieżki
    const pathParamsValidation = updateFlashcardPathParamsSchema.safeParse({
      flashcardId: params.flashcardId,
    });

    if (!pathParamsValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: pathParamsValidation.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { flashcardId } = pathParamsValidation.data;

    // 3. Pobranie i walidacja ciała żądania
    let requestBody: unknown;

    try {
      requestBody = await request.json();
    } catch (error) {
      console.error("Error in PATCH /api/flashcards/[flashcardId]:", error);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON format in request body.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const bodyValidation = updateFlashcardBodySchema.safeParse(requestBody);

    if (!bodyValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: bodyValidation.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validatedBody: UpdateFlashcardCommand = bodyValidation.data;

    // 4. Wywołanie serwisu do aktualizacji fiszki
    console.log("Updating flashcard:", flashcardId, "for user:", userId, "with data:", validatedBody); // Debug log

    const flashcardService = getFlashcardService(supabase);
    const updatedFlashcard = await flashcardService.updateFlashcard(userId, flashcardId, validatedBody);

    // 5. Mapowanie wyniku na DTO i zwrócenie odpowiedzi
    const responseDto: FlashcardDto = {
      id: updatedFlashcard.id,
      userId: updatedFlashcard.user_id,
      question: updatedFlashcard.question,
      answer: updatedFlashcard.answer,
      sourceTextForAi: updatedFlashcard.source_text_for_ai,
      isAiGenerated: updatedFlashcard.is_ai_generated,
      aiAcceptedAt: updatedFlashcard.ai_accepted_at,
      createdAt: updatedFlashcard.created_at,
      updatedAt: updatedFlashcard.updated_at,
      isDeleted: updatedFlashcard.is_deleted,
    };

    return new Response(JSON.stringify(responseDto), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in PATCH /api/flashcards/[flashcardId]:", error);

    // Handle specific service errors first
    if (error instanceof Error) {
      if (error.message.includes("Flashcard not found")) {
        return new Response(JSON.stringify({ error: "Flashcard not found." }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (error.message.includes("Database connection error")) {
        return new Response(JSON.stringify({ error: "Database connection error." }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (error.message.includes("Invalid data")) {
        return new Response(JSON.stringify({ error: "Invalid data provided." }), {
          status: 400,
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

/**
 * DELETE /api/flashcards/{flashcardId}
 *
 * Soft deletes a flashcard by its ID for the authenticated user.
 * The user must be the owner of the flashcard and the flashcard must not be already deleted.
 * The flashcard is marked as deleted (is_deleted = true, deleted_at = NOW()) but not physically removed.
 *
 * @param locals - Astro locals containing session and supabase client
 * @param params - Route parameters containing flashcardId
 *
 * @returns Empty response with status code
 *
 * Response Codes:
 * - 204: No Content - Flashcard soft deleted successfully
 * - 400: Bad Request - Invalid flashcard ID format
 * - 401: Unauthorized - User not authenticated
 * - 403: Forbidden - User doesn't have permission to delete this flashcard
 * - 404: Not Found - Flashcard not found or already deleted
 * - 500: Internal Server Error - Unexpected server error
 */
export const DELETE: APIRoute = async ({ locals, params }) => {
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

  try {
    // 2. Walidacja flashcardId z parametrów ścieżki
    const pathParamsValidation = deleteFlashcardPathParamsSchema.safeParse({
      flashcardId: params.flashcardId,
    });

    if (!pathParamsValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID.",
          details: pathParamsValidation.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { flashcardId } = pathParamsValidation.data;

    // 3. Wywołanie serwisu do miękkiego usunięcia fiszki
    console.log("Soft deleting flashcard:", flashcardId, "for user:", userId); // Debug log

    const flashcardService = getFlashcardService(supabase);
    await flashcardService.softDeleteFlashcard(userId, flashcardId);

    // 4. Zwrócenie odpowiedzi sukcesu (204 No Content)
    return new Response(null, {
      status: 204,
    });
  } catch (error: unknown) {
    console.error("Error in DELETE /api/flashcards/[flashcardId]:", error);

    // Handle specific service errors first
    if (error instanceof Error) {
      if (error.message.includes("Flashcard not found")) {
        return new Response(null, {
          status: 404,
        });
      }

      if (error.message.includes("Access forbidden")) {
        return new Response(null, {
          status: 403,
        });
      }

      if (error.message.includes("Database connection error")) {
        return new Response(JSON.stringify({ error: "Database connection error." }), {
          status: 500,
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
