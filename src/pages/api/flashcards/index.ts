import type { APIRoute } from "astro";
import { CreateFlashcardSchema, GetFlashcardsQuerySchema } from "../../../lib/validation/flashcardSchemas";
import { getFlashcardService } from "../../../lib/services/flashcardService";
import type { FlashcardDto, CreateFlashcardCommand, FlashcardsListDto } from "../../../types";
// import type { SupabaseClient } from "../../../db/supabase.client"; // Użyj, gdy typ będzie dostępny

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
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

  // 2. Odczytanie i parsowanie ciała żądania
  let requestBody: CreateFlashcardCommand;
  try {
    requestBody = await request.json();
  } catch {
    // Błąd parsowania JSON, zmienna błędu nie jest potrzebna
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. Walidacja danych wejściowych
  const validationResult = CreateFlashcardSchema.safeParse(requestBody);
  if (!validationResult.success) {
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

  // 4. Wywołanie serwisu
  try {
    console.log("Creating flashcard for user:", userId); // Debug log
    console.log("Validated data:", validatedData); // Debug log
    const flashcardService = getFlashcardService(supabase);
    const newFlashcardDb = await flashcardService.createFlashcard(validatedData, userId);

    // 5. Mapowanie wyniku na DTO
    const responseDto: FlashcardDto = {
      id: newFlashcardDb.id,
      userId: newFlashcardDb.user_id,
      question: newFlashcardDb.question,
      answer: newFlashcardDb.answer,
      sourceTextForAi: newFlashcardDb.source_text_for_ai,
      isAiGenerated: newFlashcardDb.is_ai_generated,
      aiAcceptedAt: newFlashcardDb.ai_accepted_at,
      createdAt: newFlashcardDb.created_at,
      updatedAt: newFlashcardDb.updated_at,
      isDeleted: newFlashcardDb.is_deleted,
    };

    // 6. Zwrócenie odpowiedzi
    return new Response(JSON.stringify(responseDto), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in POST /api/flashcards:", error);
    let errorMessage = "Failed to create flashcard due to a server error.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * GET /api/flashcards
 *
 * Retrieves a paginated list of flashcards for the authenticated user.
 * Supports filtering, sorting, and text search.
 *
 * @param request - The HTTP request object
 * @param locals - Astro locals containing session and supabase client
 *
 * Query Parameters:
 * - page?: number (default: 1) - Page number for pagination
 * - limit?: number (default: 10, max: 100) - Items per page
 * - sortBy?: "createdAt" | "updatedAt" | "question" (default: "createdAt") - Sort field
 * - sortOrder?: "asc" | "desc" (default: "desc") - Sort direction
 * - search?: string - Search term for question text (case-insensitive)
 * - isAiGenerated?: boolean - Filter by AI generation status
 *
 * @returns JSON response with flashcards data and pagination info
 *
 * Response Codes:
 * - 200: Success with flashcards list
 * - 400: Invalid query parameters
 * - 401: User not authenticated
 * - 500: Internal server error
 */
export const GET: APIRoute = async ({ request, locals }) => {
  // 1. Uwierzytelnianie i autoryzacja (z Astro.locals)
  const { session, supabase } = locals;

  if (!session?.user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const userId = session.user.id;

  if (!supabase) {
    console.error("Supabase client not found in locals. Check middleware setup.");
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Odczytanie i parsowanie parametrów zapytania
  const url = new URL(request.url);
  const queryParams = {
    page: url.searchParams.get("page"),
    limit: url.searchParams.get("limit"),
    sortBy: url.searchParams.get("sortBy"),
    sortOrder: url.searchParams.get("sortOrder"),
    search: url.searchParams.get("search"),
    isAiGenerated: url.searchParams.get("isAiGenerated"),
  };

  // 3. Walidacja parametrów zapytania
  const validationResult = GetFlashcardsQuerySchema.safeParse(queryParams);
  if (!validationResult.success) {
    return new Response(
      JSON.stringify({
        message: "Invalid query parameters",
        errors: validationResult.error.flatten().fieldErrors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const validatedQuery = validationResult.data;

  // 4. Wywołanie serwisu
  try {
    console.log("Fetching flashcards for user:", userId); // Debug log
    console.log("Validated query:", validatedQuery); // Debug log

    const flashcardService = getFlashcardService(supabase);
    const flashcardsListDto: FlashcardsListDto = await flashcardService.getUserFlashcards(userId, validatedQuery);

    // 5. Zwrócenie odpowiedzi
    return new Response(JSON.stringify(flashcardsListDto), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in GET /api/flashcards:", error);
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      // W produkcji nie ujawniamy szczegółów błędu
      errorMessage = "Internal Server Error";
    }
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
