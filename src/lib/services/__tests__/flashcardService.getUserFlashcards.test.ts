import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { GetFlashcardsQuery, FlashcardListItemDto } from "../../../types";

// Mock Supabase client z fluent API
const createMockSupabaseClient = () => {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
  };

  return {
    from: vi.fn().mockReturnValue(mockQuery),
    auth: {
      getSession: vi.fn(),
    },
    _mockQuery: mockQuery, // Dodajemy referencję dla łatwego dostępu w testach
  };
};

// Mock data factory
const createMockFlashcardData = (overrides = {}) => ({
  id: "flashcard-123",
  user_id: "user-456",
  question: "Co to jest TypeScript?",
  answer: "TypeScript to typowany nadzbiór JavaScript.",
  is_ai_generated: false,
  ai_accepted_at: null,
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
  ...overrides,
});

const createMockFlashcardDto = (overrides = {}): FlashcardListItemDto => ({
  id: "flashcard-123",
  userId: "user-456",
  question: "Co to jest TypeScript?",
  answer: "TypeScript to typowany nadzbiór JavaScript.",
  isAiGenerated: false,
  aiAcceptedAt: null,
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
  ...overrides,
});

describe("FlashcardService.getUserFlashcards", () => {
  let flashcardService: FlashcardService;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  let mockQuery: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    range: ReturnType<typeof vi.fn>;
    ilike: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabaseClient();
    mockQuery = mockSupabase._mockQuery;
    flashcardService = new FlashcardService(mockSupabase as unknown as SupabaseClient);
  });

  describe("Walidacja parametrów wejściowych", () => {
    it("powinien rzucać błąd dla pustego userId", async () => {
      const query: GetFlashcardsQuery = {};

      await expect(flashcardService.getUserFlashcards("", query)).rejects.toThrow("Invalid user ID provided");
    });

    it("powinien rzucać błąd dla userId zawierającego tylko białe znaki", async () => {
      const query: GetFlashcardsQuery = {};

      await expect(flashcardService.getUserFlashcards("   ", query)).rejects.toThrow("Invalid user ID provided");
    });

    it("powinien rzucać błąd dla userId typu null/undefined przekazanego jako string", async () => {
      const query: GetFlashcardsQuery = {};

      // @ts-expect-error - testujemy przypadek przekazania nieprawidłowego typu
      await expect(flashcardService.getUserFlashcards(null, query)).rejects.toThrow("Invalid user ID provided");
    });

    it("powinien akceptować poprawny userId i pusty obiekt query", async () => {
      const userId = "valid-user-123";
      const query: GetFlashcardsQuery = {};
      const mockData = [createMockFlashcardData()];

      mockQuery.range.mockResolvedValueOnce({
        data: mockData,
        error: null,
        count: 1,
      });

      const result = await flashcardService.getUserFlashcards(userId, query);

      expect(result).toEqual({
        data: [createMockFlashcardDto()],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          limit: 10,
        },
      });
    });
  });

  describe("Filtrowanie wyszukiwania", () => {
    const userId = "user-123";

    it("nie powinien stosować filtra wyszukiwania gdy search jest null", async () => {
      const query: GetFlashcardsQuery = { search: null };
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.ilike).not.toHaveBeenCalled();
    });

    it("nie powinien stosować filtra wyszukiwania gdy search jest pustym stringiem", async () => {
      const query: GetFlashcardsQuery = { search: "" };
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.ilike).not.toHaveBeenCalled();
    });

    it("nie powinien stosować filtra wyszukiwania gdy search zawiera tylko białe znaki", async () => {
      const query: GetFlashcardsQuery = { search: "   " };
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.ilike).not.toHaveBeenCalled();
    });

    it("powinien stosować filtr wyszukiwania z prawidłowym escapowaniem znaków specjalnych", async () => {
      const query: GetFlashcardsQuery = { search: "test%_\\query" };
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.ilike).toHaveBeenCalledWith("question", "%test\\%\\_\\\\query%");
    });

    it("powinien przycinać białe znaki z frazy wyszukiwania", async () => {
      const query: GetFlashcardsQuery = { search: "  JavaScript  " };
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.ilike).toHaveBeenCalledWith("question", "%JavaScript%");
    });
  });

  describe("Filtrowanie AI-generated", () => {
    const userId = "user-123";

    it("nie powinien stosować filtra gdy isAiGenerated jest undefined", async () => {
      const query: GetFlashcardsQuery = { isAiGenerated: undefined };
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.eq).toHaveBeenCalledTimes(0);
    });

    it("nie powinien stosować filtra gdy isAiGenerated jest null", async () => {
      const query: GetFlashcardsQuery = { isAiGenerated: null };
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.eq).toHaveBeenCalledTimes(0);
    });

    it("powinien filtrować flashcards generowane przez AI", async () => {
      const query: GetFlashcardsQuery = { isAiGenerated: true };
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.eq).toHaveBeenCalledWith("is_ai_generated", true);
    });

    it("powinien filtrować flashcards nie generowane przez AI", async () => {
      const query: GetFlashcardsQuery = { isAiGenerated: false };
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.eq).toHaveBeenCalledWith("is_ai_generated", false);
    });
  });

  describe("Sortowanie", () => {
    const userId = "user-123";

    it("powinien sortować domyślnie po created_at descending", async () => {
      const query: GetFlashcardsQuery = {};
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.order).toHaveBeenCalledWith("created_at", { ascending: false });
    });

    it("powinien sortować po created_at ascending", async () => {
      const query: GetFlashcardsQuery = { sortBy: "createdAt", sortOrder: "asc" };
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.order).toHaveBeenCalledWith("created_at", { ascending: true });
    });

    it("powinien sortować po updated_at descending", async () => {
      const query: GetFlashcardsQuery = { sortBy: "updatedAt", sortOrder: "desc" };
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.order).toHaveBeenCalledWith("updated_at", { ascending: false });
    });

    it("powinien sortować po question ascending", async () => {
      const query: GetFlashcardsQuery = { sortBy: "question", sortOrder: "asc" };
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.order).toHaveBeenCalledWith("question", { ascending: true });
    });

    it("powinien używać domyślnego sortowania dla nieprawidłowego sortBy", async () => {
      const query: GetFlashcardsQuery = { sortBy: "invalid" as GetFlashcardsQuery["sortBy"] };
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.order).toHaveBeenCalledWith("created_at", { ascending: false });
    });
  });

  describe("Paginacja", () => {
    const userId = "user-123";

    it("powinien używać domyślnych wartości paginacji (strona 1, limit 10)", async () => {
      const query: GetFlashcardsQuery = {};
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.range).toHaveBeenCalledWith(0, 9); // 0-9 to pierwsze 10 elementów
    });

    it("powinien obliczać prawidłowy offset dla strony 2", async () => {
      const query: GetFlashcardsQuery = { page: 2, limit: 5 };
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.range).toHaveBeenCalledWith(5, 9); // offset 5, limit 5 (5-9)
    });

    it("powinien obliczać prawidłowy offset dla strony 3 z limitem 20", async () => {
      const query: GetFlashcardsQuery = { page: 3, limit: 20 };
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.range).toHaveBeenCalledWith(40, 59); // offset 40, limit 20 (40-59)
    });

    it("powinien używać domyślnych wartości dla null page i limit", async () => {
      const query: GetFlashcardsQuery = { page: null, limit: null };
      mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.range).toHaveBeenCalledWith(0, 9);
    });
  });

  describe("Mapowanie danych z bazy do DTO", () => {
    const userId = "user-123";

    it("powinien poprawnie mapować dane z bazy do FlashcardListItemDto", async () => {
      const mockDatabaseData = [
        createMockFlashcardData({
          id: "card-1",
          user_id: "user-123",
          question: "Pytanie 1",
          answer: "Odpowiedź 1",
          is_ai_generated: true,
          ai_accepted_at: "2024-01-15T12:00:00Z",
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T11:00:00Z",
        }),
        createMockFlashcardData({
          id: "card-2",
          user_id: "user-123",
          question: "Pytanie 2",
          answer: "Odpowiedź 2",
          is_ai_generated: false,
          ai_accepted_at: null,
          created_at: "2024-01-16T10:00:00Z",
          updated_at: "2024-01-16T10:00:00Z",
        }),
      ];

      mockQuery.range.mockResolvedValueOnce({
        data: mockDatabaseData,
        error: null,
        count: 2,
      });

      const result = await flashcardService.getUserFlashcards(userId, {});

      expect(result.data).toEqual([
        {
          id: "card-1",
          userId: "user-123",
          question: "Pytanie 1",
          answer: "Odpowiedź 1",
          isAiGenerated: true,
          aiAcceptedAt: "2024-01-15T12:00:00Z",
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T11:00:00Z",
        },
        {
          id: "card-2",
          userId: "user-123",
          question: "Pytanie 2",
          answer: "Odpowiedź 2",
          isAiGenerated: false,
          aiAcceptedAt: null,
          createdAt: "2024-01-16T10:00:00Z",
          updatedAt: "2024-01-16T10:00:00Z",
        },
      ]);
    });
  });

  describe("Obliczanie szczegółów paginacji", () => {
    const userId = "user-123";

    it("powinien obliczać prawidłowe szczegóły paginacji dla pierwszej strony", async () => {
      mockQuery.range.mockResolvedValueOnce({
        data: [createMockFlashcardData()],
        error: null,
        count: 25,
      });

      const result = await flashcardService.getUserFlashcards(userId, { page: 1, limit: 10 });

      expect(result.pagination).toEqual({
        currentPage: 1,
        totalPages: 3,
        totalItems: 25,
        limit: 10,
      });
    });

    it("powinien obliczać prawidłowe szczegóły paginacji dla ostatniej strony", async () => {
      mockQuery.range.mockResolvedValueOnce({
        data: [createMockFlashcardData()],
        error: null,
        count: 25,
      });

      const result = await flashcardService.getUserFlashcards(userId, { page: 3, limit: 10 });

      expect(result.pagination).toEqual({
        currentPage: 3,
        totalPages: 3,
        totalItems: 25,
        limit: 10,
      });
    });

    it("powinien zwracać 0 stron dla pustego wyniku", async () => {
      mockQuery.range.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      });

      const result = await flashcardService.getUserFlashcards(userId, {});

      expect(result.pagination).toEqual({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        limit: 10,
      });
    });

    it("powinien obsługiwać przypadek gdy count jest null", async () => {
      mockQuery.range.mockResolvedValueOnce({
        data: [],
        error: null,
        count: null,
      });

      const result = await flashcardService.getUserFlashcards(userId, {});

      expect(result.pagination).toEqual({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        limit: 10,
      });
    });
  });

  describe("Obsługa przypadków brzegowych paginacji", () => {
    const userId = "user-123";

    it("powinien zwracać pustą listę dla strony poza zakresem", async () => {
      mockQuery.range.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 25,
      });

      const result = await flashcardService.getUserFlashcards(userId, { page: 5, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.pagination).toEqual({
        currentPage: 5,
        totalPages: 3,
        totalItems: 25,
        limit: 10,
      });
    });

    it("powinien ostrzegać o przekroczeniu zakresu stron w logach", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {
        // Mock implementation - suppress console output in tests
      });

      mockQuery.range.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 25,
      });

      await flashcardService.getUserFlashcards(userId, { page: 5, limit: 10 });

      expect(consoleSpy).toHaveBeenCalledWith("Requested page 5 exceeds total pages 3");

      consoleSpy.mockRestore();
    });

    it("nie powinien ostrzegać dla żądanej strony w zakresie", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {
        // Mock implementation - suppress console output in tests
      });

      mockQuery.range.mockResolvedValueOnce({
        data: [createMockFlashcardData()],
        error: null,
        count: 25,
      });

      await flashcardService.getUserFlashcards(userId, { page: 3, limit: 10 });

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("Obsługa błędów Supabase", () => {
    const userId = "user-123";

    it("powinien obsługiwać błąd PGRST116 (nieprawidłowe parametry)", async () => {
      const supabaseError = {
        code: "PGRST116",
        message: "Invalid query parameters",
      };

      mockQuery.range.mockResolvedValueOnce({
        data: null,
        error: supabaseError,
        count: null,
      });

      await expect(flashcardService.getUserFlashcards(userId, {})).rejects.toThrow(
        "Failed to fetch flashcards: Invalid query parameters"
      );
    });

    it("powinien obsługiwać błąd PGRST301 (błąd połączenia)", async () => {
      const supabaseError = {
        code: "PGRST301",
        message: "Database connection failed",
      };

      mockQuery.range.mockResolvedValueOnce({
        data: null,
        error: supabaseError,
        count: null,
      });

      await expect(flashcardService.getUserFlashcards(userId, {})).rejects.toThrow(
        "Failed to fetch flashcards: Database connection failed"
      );
    });

    it("powinien obsługiwać nieznane błędy Supabase", async () => {
      const supabaseError = {
        code: "UNKNOWN_ERROR",
        message: "Something went wrong",
      };

      mockQuery.range.mockResolvedValueOnce({
        data: null,
        error: supabaseError,
        count: null,
      });

      await expect(flashcardService.getUserFlashcards(userId, {})).rejects.toThrow(
        "Failed to fetch flashcards: Something went wrong"
      );
    });

    it("powinien logować błędy Supabase", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - suppress console output in tests
      });

      const supabaseError = {
        code: "TEST_ERROR",
        message: "Test error message",
      };

      mockQuery.range.mockResolvedValueOnce({
        data: null,
        error: supabaseError,
        count: null,
      });

      await expect(flashcardService.getUserFlashcards(userId, {})).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith("Error fetching flashcards from Supabase:", supabaseError);

      consoleSpy.mockRestore();
    });

    it("powinien obsługiwać przypadek gdy data jest null mimo braku błędu", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - suppress console output in tests
      });

      mockQuery.range.mockResolvedValueOnce({
        data: null,
        error: null,
        count: 0,
      });

      await expect(flashcardService.getUserFlashcards(userId, {})).rejects.toThrow(
        "Failed to fetch flashcards: no data returned."
      );

      expect(consoleSpy).toHaveBeenCalledWith("No data returned from flashcards query, despite no error.");

      consoleSpy.mockRestore();
    });
  });

  describe("Obsługa błędów generycznych", () => {
    const userId = "user-123";

    it("powinien obsługiwać błędy JavaScript Error", async () => {
      const jsError = new Error("JavaScript error");
      mockQuery.range.mockRejectedValueOnce(jsError);

      await expect(flashcardService.getUserFlashcards(userId, {})).rejects.toThrow("JavaScript error");
    });

    it("powinien obsługiwać nieoczekiwane błędy", async () => {
      mockQuery.range.mockRejectedValueOnce("Unexpected error");

      await expect(flashcardService.getUserFlashcards(userId, {})).rejects.toThrow(
        "An unexpected error occurred while fetching flashcards."
      );
    });

    it("powinien logować błędy w catch block", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - suppress console output in tests
      });

      const testError = new Error("Test error");
      mockQuery.range.mockRejectedValueOnce(testError);

      await expect(flashcardService.getUserFlashcards(userId, {})).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith("Error in getUserFlashcards:", testError);

      consoleSpy.mockRestore();
    });
  });

  describe("Integracyjne scenariusze biznesowe", () => {
    const userId = "user-123";

    it("powinien zwracać przefiltrowane i posortowane wyniki z paginacją", async () => {
      const query: GetFlashcardsQuery = {
        page: 2,
        limit: 5,
        sortBy: "question",
        sortOrder: "asc",
        search: "JavaScript",
        isAiGenerated: true,
      };

      const mockData = [
        createMockFlashcardData({
          id: "card-1",
          question: "Co to jest JavaScript?",
          is_ai_generated: true,
        }),
      ];

      mockQuery.range.mockResolvedValueOnce({
        data: mockData,
        error: null,
        count: 12,
      });

      const result = await flashcardService.getUserFlashcards(userId, query);

      // Sprawdź czy wszystkie filtry zostały zastosowane
      expect(mockQuery.ilike).toHaveBeenCalledWith("question", "%JavaScript%");
      expect(mockQuery.eq).toHaveBeenCalledWith("is_ai_generated", true);
      expect(mockQuery.order).toHaveBeenCalledWith("question", { ascending: true });
      expect(mockQuery.range).toHaveBeenCalledWith(5, 9); // strona 2, limit 5

      // Sprawdź wynik
      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual({
        currentPage: 2,
        totalPages: 3,
        totalItems: 12,
        limit: 5,
      });
    });

    it("powinien obsługiwać scenariusz bez rezultatów dla specyficznych filtrów", async () => {
      const query: GetFlashcardsQuery = {
        search: "nonexistent",
        isAiGenerated: true,
      };

      mockQuery.range.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      });

      const result = await flashcardService.getUserFlashcards(userId, query);

      expect(result).toEqual({
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          limit: 10,
        },
      });
    });

    it("powinien obsługiwać maksymalną liczbę wyników na stronie", async () => {
      const query: GetFlashcardsQuery = { limit: 100 };

      mockQuery.range.mockResolvedValueOnce({
        data: Array(100).fill(createMockFlashcardData()),
        error: null,
        count: 150,
      });

      const result = await flashcardService.getUserFlashcards(userId, query);

      expect(mockQuery.range).toHaveBeenCalledWith(0, 99); // 0-99 to pierwsze 100 elementów
      expect(result.data).toHaveLength(100);
      expect(result.pagination.limit).toBe(100);
    });
  });

  describe("Walidacja łańcucha wywołań Supabase", () => {
    const userId = "user-123";

    it("powinien konstruować prawidłowy łańcuch zapytań Supabase", async () => {
      const query: GetFlashcardsQuery = {
        page: 2,
        limit: 15,
        sortBy: "updatedAt",
        sortOrder: "desc",
        search: "React",
        isAiGenerated: false,
      };

      mockQuery.range.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      });

      await flashcardService.getUserFlashcards(userId, query);

      // Sprawdź kolejność wywołań
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
      expect(mockQuery.select).toHaveBeenCalledWith(
        "id, user_id, question, answer, is_ai_generated, ai_accepted_at, created_at, updated_at",
        { count: "exact" }
      );
      expect(mockQuery.ilike).toHaveBeenCalledWith("question", "%React%");
      expect(mockQuery.eq).toHaveBeenCalledWith("is_ai_generated", false);
      expect(mockQuery.order).toHaveBeenCalledWith("updated_at", { ascending: false });
      expect(mockQuery.range).toHaveBeenCalledWith(15, 29); // strona 2, limit 15
    });

    it("powinien wywołać tylko niezbędne metody dla minimalnego query", async () => {
      const query: GetFlashcardsQuery = {};

      mockQuery.range.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      });

      await flashcardService.getUserFlashcards(userId, query);

      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
      expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.ilike).not.toHaveBeenCalled();
      expect(mockQuery.eq).not.toHaveBeenCalled();
      expect(mockQuery.order).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(mockQuery.range).toHaveBeenCalledWith(0, 9);
    });
  });
});
