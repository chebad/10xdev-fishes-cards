import type { SupabaseClient } from "../../db/supabase.client";
import type { Tables, TablesInsert } from "../../db/database.types";
import type { CreateFlashcardCommand } from "../../types";

/**
 * Handles business logic related to flashcards.
 */
export class FlashcardService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Creates a new flashcard in the database.
   *
   * @param command - The command object containing flashcard data.
   * @param userId - The ID of the user creating the flashcard.
   * @returns A promise that resolves to the created flashcard data.
   * @throws Error if the database operation fails.
   */
  async createFlashcard(command: CreateFlashcardCommand, userId: string): Promise<Tables<"flashcards">> {
    const flashcardInsertData: TablesInsert<"flashcards"> = {
      user_id: userId,
      question: command.question,
      answer: command.answer,
      is_ai_generated: command.isAiGenerated ?? false,
      source_text_for_ai: command.sourceTextForAi ?? null,
      ai_accepted_at: command.isAiGenerated ? new Date().toISOString() : null,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // is_deleted and deleted_at will use default values from DB schema
      // created_at and updated_at will use default values or be set by DB trigger
    };

    const { data: sessionData, error: sessionError } = await this.supabase.auth.getSession();
    console.log("Session:", sessionData);
    console.log("Session error:", sessionError);

    const { data, error } = await this.supabase.from("flashcards").insert(flashcardInsertData).select().single(); // .single() is used to get the inserted row back and ensures it's just one

    if (error) {
      // Log the error for server-side diagnostics
      console.error("Error creating flashcard in Supabase:", error);
      console.error("Error details:", JSON.stringify(error, null, 2)); // More detailed error log
      // Rethrow a more generic error or a custom error type
      throw new Error(`Failed to create flashcard: ${error.message}`);
    }

    if (!data) {
      // This case should ideally not happen if insert was successful and error is null,
      // but it's a good practice to handle it.
      console.error("No data returned after flashcard insert, despite no error.");
      throw new Error("Failed to create flashcard: no data returned.");
    }

    return data as Tables<"flashcards">; // Cast to ensure type correctness
  }
}

// Helper function to instantiate the service, can be used in API routes
export function getFlashcardService(supabase: SupabaseClient): FlashcardService {
  return new FlashcardService(supabase);
}
