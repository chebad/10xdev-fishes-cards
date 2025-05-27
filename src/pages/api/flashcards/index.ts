import type { APIRoute } from "astro";
import { CreateFlashcardSchema } from "../../../lib/validation/flashcardSchemas";
import { getFlashcardService } from "../../../lib/services/flashcardService";
import type { FlashcardDto, CreateFlashcardCommand } from "../../../types";
// import type { SupabaseClient } from "../../../db/supabase.client"; // Użyj, gdy typ będzie dostępny

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // 1. Uwierzytelnianie i autoryzacja (z Astro.locals)
  // TODO: Zdefiniuj poprawnie typy dla locals.session i locals.supabase w src/env.d.ts
  // @ts-expect-error // Tymczasowe obejście problemu z typowaniem Astro.locals
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
