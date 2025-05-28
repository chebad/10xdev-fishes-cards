import type { SupabaseClient } from "../../db/supabase.client";
import type { Tables, TablesInsert } from "../../db/database.types";
import type {
  CreateFlashcardCommand,
  UpdateFlashcardCommand,
  GetFlashcardsQuery,
  FlashcardsListDto,
  FlashcardListItemDto,
  PaginationDetails,
} from "../../types";

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

  /**
   * Retrieves a paginated list of flashcards for a specific user.
   *
   * @param userId - The ID of the user whose flashcards to retrieve.
   * @param query - Query parameters for filtering, sorting, and pagination.
   * @returns A promise that resolves to the flashcards list with pagination details.
   * @throws Error if the database operation fails.
   */
  async getUserFlashcards(userId: string, query: GetFlashcardsQuery): Promise<FlashcardsListDto> {
    try {
      // Validate userId
      if (!userId || typeof userId !== "string" || userId.trim() === "") {
        throw new Error("Invalid user ID provided");
      }

      // Build the base query
      let supabaseQuery = this.supabase
        .from("flashcards")
        .select("id, user_id, question, answer, is_ai_generated, ai_accepted_at, created_at, updated_at", {
          count: "exact",
        });

      // Apply search filter if provided (trim and validate)
      if (query.search && query.search !== null && query.search.trim() !== "") {
        const searchTerm = query.search.trim();
        // Escape special characters for ILIKE to prevent injection
        const escapedSearch = searchTerm.replace(/[%_\\]/g, "\\$&");
        supabaseQuery = supabaseQuery.ilike("question", `%${escapedSearch}%`);
      }

      // Apply AI generated filter if provided
      if (query.isAiGenerated !== undefined && query.isAiGenerated !== null) {
        supabaseQuery = supabaseQuery.eq("is_ai_generated", query.isAiGenerated);
      }

      // Apply sorting
      const sortColumn = this.mapSortByToDbColumn(query.sortBy || "createdAt");
      supabaseQuery = supabaseQuery.order(sortColumn, { ascending: query.sortOrder === "asc" });

      // Apply pagination
      const offset = ((query.page || 1) - 1) * (query.limit || 10);
      const limit = query.limit || 10;
      supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

      // Execute the query
      const { data, error, count } = await supabaseQuery;

      if (error) {
        console.error("Error fetching flashcards from Supabase:", error);
        throw new Error(`Failed to fetch flashcards: ${error.message}`);
      }

      if (!data) {
        console.error("No data returned from flashcards query, despite no error.");
        throw new Error("Failed to fetch flashcards: no data returned.");
      }

      // Map database results to DTOs
      const flashcardItems: FlashcardListItemDto[] = data.map((item) => ({
        id: item.id,
        userId: item.user_id,
        question: item.question,
        answer: item.answer,
        isAiGenerated: item.is_ai_generated,
        aiAcceptedAt: item.ai_accepted_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      // Calculate pagination details
      const totalItems = count || 0;
      const currentPage = query.page || 1;
      const limitValue = query.limit || 10;
      const totalPages = totalItems > 0 ? Math.ceil(totalItems / limitValue) : 0;

      // Validate pagination bounds
      if (currentPage > totalPages && totalPages > 0) {
        console.warn(`Requested page ${currentPage} exceeds total pages ${totalPages}`);
        // Return empty result for out-of-bounds page requests
        return {
          data: [],
          pagination: {
            currentPage,
            totalPages,
            totalItems,
            limit: limitValue,
          },
        };
      }

      const paginationDetails: PaginationDetails = {
        currentPage,
        totalPages,
        totalItems,
        limit: limitValue,
      };

      return {
        data: flashcardItems,
        pagination: paginationDetails,
      };
    } catch (error) {
      console.error("Error in getUserFlashcards:", error);

      // Handle specific Supabase errors
      if (error && typeof error === "object" && "code" in error) {
        const supabaseError = error as { code: string; message: string };
        switch (supabaseError.code) {
          case "PGRST116":
            throw new Error("Invalid query parameters or table structure");
          case "PGRST301":
            throw new Error("Database connection error");
          default:
            throw new Error(`Database error: ${supabaseError.message}`);
        }
      }

      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred while fetching flashcards.");
    }
  }

  /**
   * Retrieves a single flashcard by its ID for a specific user.
   *
   * @param flashcardId - The ID of the flashcard to retrieve.
   * @param userId - The ID of the user who should own the flashcard.
   * @returns A promise that resolves to the flashcard data or null if not found.
   * @throws Error if the database operation fails or user doesn't have permission.
   */
  async getFlashcardById(flashcardId: string, userId: string): Promise<Tables<"flashcards"> | null> {
    try {
      // Validate inputs
      if (!flashcardId || typeof flashcardId !== "string" || flashcardId.trim() === "") {
        throw new Error("Invalid flashcard ID provided");
      }
      if (!userId || typeof userId !== "string" || userId.trim() === "") {
        throw new Error("Invalid user ID provided");
      }

      // Build the query to get the flashcard
      // RLS policies automatically enforce user_id = auth.uid() AND is_deleted = FALSE
      // So we only need to filter by ID for optimal performance
      const { data, error } = await this.supabase.from("flashcards").select("*").eq("id", flashcardId).single();

      if (error) {
        // Handle specific Supabase errors
        if (error.code === "PGRST116") {
          // No rows returned (not found or access denied by RLS)
          console.log(`Flashcard ${flashcardId} not found or access denied for user ${userId}`);
          return null;
        }

        console.error("Error fetching flashcard from Supabase:", error);
        throw new Error(`Failed to fetch flashcard: ${error.message}`);
      }

      if (!data) {
        console.log(`Flashcard ${flashcardId} not found for user ${userId}`);
        return null;
      }

      return data as Tables<"flashcards">;
    } catch (error) {
      console.error("Error in getFlashcardById:", error);

      // Handle specific Supabase errors
      if (error && typeof error === "object" && "code" in error) {
        const supabaseError = error as { code: string; message: string };
        switch (supabaseError.code) {
          case "PGRST116":
            // No rows returned - flashcard not found or user doesn't have access
            return null;
          case "PGRST301":
            throw new Error("Database connection error");
          default:
            throw new Error(`Database error: ${supabaseError.message}`);
        }
      }

      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred while fetching the flashcard.");
    }
  }

  /**
   * Updates an existing flashcard for a specific user.
   * Only provided fields will be updated - the updated_at field is automatically managed by database trigger.
   *
   * @param userId - The ID of the user who should own the flashcard.
   * @param flashcardId - The ID of the flashcard to update.
   * @param data - The update data containing optional question and/or answer fields.
   * @returns A promise that resolves to the updated flashcard data.
   * @throws Error if the database operation fails, flashcard not found, or user doesn't have permission.
   */
  async updateFlashcard(
    userId: string,
    flashcardId: string,
    data: UpdateFlashcardCommand
  ): Promise<Tables<"flashcards">> {
    try {
      // Validate inputs
      if (!userId || typeof userId !== "string" || userId.trim() === "") {
        throw new Error("Invalid user ID provided");
      }
      if (!flashcardId || typeof flashcardId !== "string" || flashcardId.trim() === "") {
        throw new Error("Invalid flashcard ID provided");
      }
      if (!data || typeof data !== "object") {
        throw new Error("Invalid update data provided");
      }

      // Construct update object with only provided fields
      const updateData: { question?: string; answer?: string } = {};
      if (data.question !== undefined) {
        updateData.question = data.question;
      }
      if (data.answer !== undefined) {
        updateData.answer = data.answer;
      }

      // Ensure at least one field is being updated
      if (Object.keys(updateData).length === 0) {
        throw new Error("At least one field (question or answer) must be provided for update");
      }

      // Perform the update operation
      // RLS policies automatically enforce user_id = auth.uid() AND is_deleted = FALSE
      // The updated_at field will be automatically updated by the database trigger
      const { data: updatedData, error } = await this.supabase
        .from("flashcards")
        .update(updateData)
        .eq("id", flashcardId)
        .eq("user_id", userId)
        .eq("is_deleted", false)
        .select()
        .single();

      if (error) {
        // Handle specific Supabase errors
        if (error.code === "PGRST116") {
          // No rows returned (not found, access denied by RLS, or already deleted)
          console.log(`Flashcard ${flashcardId} not found, access denied, or deleted for user ${userId}`);
          throw new Error("Flashcard not found");
        }

        console.error("Error updating flashcard in Supabase:", error);
        throw new Error(`Failed to update flashcard: ${error.message}`);
      }

      if (!updatedData) {
        // This should not happen if there was no error, but handle it as a precaution
        console.error("No data returned after flashcard update, despite no error.");
        throw new Error("Flashcard not found");
      }

      console.log(`Successfully updated flashcard ${flashcardId} for user ${userId}`);
      return updatedData as Tables<"flashcards">;
    } catch (error) {
      console.error("Error in updateFlashcard:", error);

      // Handle specific Supabase errors
      if (error && typeof error === "object" && "code" in error) {
        const supabaseError = error as { code: string; message: string };
        switch (supabaseError.code) {
          case "PGRST116":
            // No rows updated - flashcard not found or user doesn't have access
            throw new Error("Flashcard not found");
          case "PGRST301":
            throw new Error("Database connection error");
          case "23514": // CHECK constraint violation
            throw new Error("Invalid data: check constraints violated");
          default:
            throw new Error(`Database error: ${supabaseError.message}`);
        }
      }

      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred while updating the flashcard.");
    }
  }

  /**
   * Maps the API sortBy parameter to the corresponding database column name.
   *
   * @param sortBy - The sort field from the API.
   * @returns The corresponding database column name.
   */
  private mapSortByToDbColumn(sortBy: string): string {
    switch (sortBy) {
      case "createdAt":
        return "created_at";
      case "updatedAt":
        return "updated_at";
      case "question":
        return "question";
      default:
        return "created_at";
    }
  }
}

// Helper function to instantiate the service, can be used in API routes
export function getFlashcardService(supabase: SupabaseClient): FlashcardService {
  return new FlashcardService(supabase);
}
