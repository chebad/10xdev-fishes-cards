import type { APIRoute } from "astro";
import { GenerateAiFlashcardsSchema } from "../../../lib/validation/flashcardSchemas";
import { getAiFlashcardGeneratorService } from "../../../lib/services/aiFlashcardGeneratorService";
import type { GenerateAiFlashcardsCommand, AiFlashcardSuggestionsDto } from "../../../types";

export const prerender = false;

/**
 * POST /api/flashcards/generate-ai
 *
 * Generates flashcard suggestions using AI based on provided source text.
 * The suggestions are not saved to the database - they are returned for user review.
 *
 * @param request - The HTTP request object containing source text in body
 * @param locals - Astro locals containing session and supabase client
 *
 * Request Body:
 * - sourceText: string (1000-10000 chars) - Text to generate flashcards from
 *
 * @returns JSON response with AI-generated flashcard suggestions
 *
 * Response Codes:
 * - 200: Success with AI suggestions
 * - 400: Invalid request body (validation failed)
 * - 401: User not authenticated
 * - 500: Internal server error (AI processing failed)
 * - 503: AI service temporarily unavailable
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  console.log(`[API:${requestId}] POST /api/flashcards/generate-ai - Request started`);

  // 1. Uwierzytelnianie i autoryzacja (z Astro.locals)
  const { session } = locals;

  if (!session?.user) {
    console.log(`[API:${requestId}] Authentication failed - no session or user`);
    return new Response(JSON.stringify({ error: "User not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(`[API:${requestId}] User authenticated: ${session.user.id}`);

  // 2. Odczytanie i parsowanie ciała żądania
  let requestBody: GenerateAiFlashcardsCommand;
  try {
    requestBody = await request.json();
    console.log(`[API:${requestId}] Request body parsed successfully`);
  } catch (error) {
    console.error(`[API:${requestId}] Failed to parse JSON body:`, error);
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. Walidacja danych wejściowych
  const validationResult = GenerateAiFlashcardsSchema.safeParse(requestBody);
  if (!validationResult.success) {
    console.log(`[API:${requestId}] Validation failed:`, validationResult.error.flatten().fieldErrors);
    return new Response(
      JSON.stringify({
        error: "Validation failed",
        details: validationResult.error.flatten().fieldErrors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const validatedData = validationResult.data;
  console.log(`[API:${requestId}] Data validated - source text length: ${validatedData.sourceText.length}`);

  // 4. Wywołanie serwisu AI
  try {
    console.log(`[API:${requestId}] Starting AI flashcard generation`);

    const aiService = getAiFlashcardGeneratorService();
    const suggestions = await aiService.generateFlashcardSuggestions(validatedData.sourceText);

    // 5. Konstrukcja odpowiedzi
    const responseDto: AiFlashcardSuggestionsDto = {
      suggestions,
      sourceTextEcho: validatedData.sourceText,
    };

    console.log(`[API:${requestId}] Successfully generated ${suggestions.length} AI flashcard suggestions`);

    // 6. Zwrócenie odpowiedzi sukcesu
    return new Response(JSON.stringify(responseDto), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    // 5. Obsługa błędów z mapowaniem na odpowiednie kody HTTP
    console.error(`[API:${requestId}] Error during AI generation:`, error);

    if (error instanceof Error) {
      // Mapowanie błędów serwisu na kody HTTP
      if (error.message === "AI_SERVICE_UNAVAILABLE") {
        console.error(`[API:${requestId}] AI service unavailable`);
        return new Response(
          JSON.stringify({ error: "The AI service is temporarily unavailable. Please try again later." }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (error.message === "AI_SERVICE_ERROR") {
        console.error(`[API:${requestId}] AI service error`);
        return new Response(JSON.stringify({ error: "The AI service encountered an error. Please try again later." }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (error.message.includes("OPENAI_API_KEY")) {
        console.error(`[API:${requestId}] Configuration error - missing API key`);
        return new Response(JSON.stringify({ error: "AI service configuration error." }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (error.message.includes("Source text must be between")) {
        console.error(`[API:${requestId}] Text length validation error:`, error.message);
        return new Response(
          JSON.stringify({
            error: "Validation failed",
            details: { sourceText: error.message },
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Inne błędy - 500 Internal Server Error
      console.error(`[API:${requestId}] Unexpected error:`, error.message);
    } else {
      console.error(`[API:${requestId}] Non-Error exception:`, error);
    }

    return new Response(JSON.stringify({ error: "An unexpected error occurred on the server." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
