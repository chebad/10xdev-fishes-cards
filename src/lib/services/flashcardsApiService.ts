import type {
  FlashcardsListDto,
  FlashcardDto,
  CreateFlashcardCommand,
  UpdateFlashcardCommand,
  GetFlashcardsQuery,
  ApiError,
} from "@/types";

/**
 * Dedykowany service dla komunikacji z API endpointami fiszek
 * Centralizuje wszystkie wywołania API z proper error handling
 */

// === HELPER FUNCTIONS ===

/**
 * Buduje query string z parametrów GetFlashcardsQuery
 */
const buildQueryString = (query: GetFlashcardsQuery): string => {
  const params = new URLSearchParams();

  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());
  if (query.sortBy) params.append("sortBy", query.sortBy);
  if (query.sortOrder) params.append("sortOrder", query.sortOrder);
  if (query.search) params.append("search", query.search);
  if (query.isAiGenerated !== undefined && query.isAiGenerated !== null) {
    params.append("isAiGenerated", query.isAiGenerated.toString());
  }

  return params.toString();
};

/**
 * Przetwarza response API i obsługuje błędy
 */
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // Jeśli nie udało się sparsować JSON błędu, użyj domyślnego
      switch (response.status) {
        case 400:
          errorMessage = "Nieprawidłowe dane żądania";
          break;
        case 401:
          errorMessage = "Sesja wygasła. Zaloguj się ponownie";
          break;
        case 403:
          errorMessage = "Brak uprawnień do wykonania tej operacji";
          break;
        case 404:
          errorMessage = "Zasób nie został znaleziony";
          break;
        case 500:
          errorMessage = "Wystąpił błąd serwera. Spróbuj ponownie";
          break;
        default:
          errorMessage = "Wystąpił nieoczekiwany błąd";
      }
    }

    const apiError: ApiError = {
      message: errorMessage,
      status: response.status,
    };

    throw new Error(apiError.message);
  }

  // Dla 204 No Content zwróć pustą odpowiedź
  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return await response.json();
  } catch {
    throw new Error("Błąd podczas przetwarzania odpowiedzi serwera");
  }
};

/**
 * Wykonuje request z retry logic dla operacji GET
 */
const fetchWithRetry = async <T>(url: string, options: RequestInit, maxRetries = 3): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Log attempt only in development
      if (import.meta.env.DEV) {
        console.log(`[API] Attempt ${attempt}/${maxRetries}: ${options.method} ${url}`);
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      return await handleApiResponse<T>(response);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Unknown error");

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Max retries exceeded");
};

// === MAIN API SERVICE ===

export const flashcardsApiService = {
  /**
   * Pobiera listę fiszek z filtrami i paginacją
   * GET /api/flashcards
   */
  async fetchFlashcards(filters: GetFlashcardsQuery = {}): Promise<FlashcardsListDto> {
    const queryString = buildQueryString(filters);
    const url = `/api/flashcards${queryString ? `?${queryString}` : ""}`;

    return fetchWithRetry<FlashcardsListDto>(url, {
      method: "GET",
    });
  },

  /**
   * Tworzy nową fiszkę
   * POST /api/flashcards
   */
  async createFlashcard(data: CreateFlashcardCommand): Promise<FlashcardDto> {
    return fetchWithRetry<FlashcardDto>(
      "/api/flashcards",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      1
    ); // Nie retry dla operacji POST
  },

  /**
   * Aktualizuje istniejącą fiszkę
   * PATCH /api/flashcards/{flashcardId}
   */
  async updateFlashcard(id: string, data: UpdateFlashcardCommand): Promise<FlashcardDto> {
    if (!id) {
      throw new Error("ID fiszki jest wymagane do aktualizacji");
    }

    return fetchWithRetry<FlashcardDto>(
      `/api/flashcards/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      1
    ); // Nie retry dla operacji PATCH
  },

  /**
   * Usuwa fiszkę (soft delete)
   * DELETE /api/flashcards/{flashcardId}
   */
  async deleteFlashcard(id: string): Promise<void> {
    if (!id) {
      throw new Error("ID fiszki jest wymagane do usunięcia");
    }

    const url = `/api/flashcards/${id}`;
    const response = await fetch(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  },

  /**
   * Pobiera pojedynczą fiszkę po ID
   * GET /api/flashcards/{flashcardId}
   */
  async getFlashcardById(id: string): Promise<FlashcardDto> {
    if (!id) {
      throw new Error("ID fiszki jest wymagane");
    }

    return fetchWithRetry<FlashcardDto>(`/api/flashcards/${id}`, {
      method: "GET",
    });
  },
};

/**
 * Eksport domyślny dla wygody
 */
export default flashcardsApiService;
