import { useState, useCallback, useEffect } from "react";
import type {
  FlashcardsState,
  GetFlashcardsQuery,
  FlashcardsListDto,
  CreateFlashcardCommand,
  UpdateFlashcardCommand,
  FlashcardDto,
} from "@/types";

const initialState: FlashcardsState = {
  flashcards: [],
  isLoading: false,
  pagination: { currentPage: 1, totalPages: 1, totalItems: 0, limit: 10 },
  filters: {},
  error: undefined,
  lastFetchedAt: undefined,
};

export const useFlashcards = () => {
  const [state, setState] = useState<FlashcardsState>(initialState);

  const buildQueryString = useCallback((query: GetFlashcardsQuery): string => {
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
  }, []);

  const fetchFlashcards = useCallback(
    async (query: GetFlashcardsQuery = {}) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: undefined,
        filters: { ...prev.filters, ...query },
      }));

      try {
        const queryString = buildQueryString(query);
        const url = `/api/flashcards${queryString ? `?${queryString}` : ""}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Błąd podczas pobierania fiszek");
        }

        const data: FlashcardsListDto = await response.json();

        setState((prev) => ({
          ...prev,
          isLoading: false,
          flashcards: data.data,
          pagination: data.pagination,
          lastFetchedAt: new Date(),
          error: undefined,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd",
        }));
      }
    },
    [buildQueryString]
  );

  const createFlashcard = useCallback(
    async (command: CreateFlashcardCommand): Promise<FlashcardDto | null> => {
      try {
        const response = await fetch("/api/flashcards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Błąd podczas tworzenia fiszki");
        }

        const flashcard: FlashcardDto = await response.json();

        // Odśwież listę fiszek po utworzeniu
        await fetchFlashcards(state.filters);

        return flashcard;
      } catch (error) {
        console.error("Błąd podczas tworzenia fiszki:", error);
        throw error;
      }
    },
    [fetchFlashcards, state.filters]
  );

  const updateFlashcard = useCallback(
    async (id: string, command: UpdateFlashcardCommand): Promise<FlashcardDto | null> => {
      try {
        const response = await fetch(`/api/flashcards/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Błąd podczas aktualizacji fiszki");
        }

        const flashcard: FlashcardDto = await response.json();

        // Zaktualizuj fiszkę w lokalnym stanie
        setState((prev) => ({
          ...prev,
          flashcards: prev.flashcards.map((f) =>
            f.id === id ? { ...f, ...command, updatedAt: flashcard.updatedAt } : f
          ),
        }));

        return flashcard;
      } catch (error) {
        console.error("Błąd podczas aktualizacji fiszki:", error);
        throw error;
      }
    },
    []
  );

  const deleteFlashcard = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Błąd podczas usuwania fiszki");
      }

      // Usuń fiszkę z lokalnego stanu
      setState((prev) => ({
        ...prev,
        flashcards: prev.flashcards.filter((f) => f.id !== id),
        pagination: {
          ...prev.pagination,
          totalItems: Math.max(0, prev.pagination.totalItems - 1),
        },
      }));
    } catch (error) {
      console.error("Błąd podczas usuwania fiszki:", error);
      throw error;
    }
  }, []);

  const updateFilters = useCallback(
    (newFilters: Partial<GetFlashcardsQuery>) => {
      const updatedFilters = { ...state.filters, ...newFilters };
      fetchFlashcards(updatedFilters);
    },
    [state.filters, fetchFlashcards]
  );

  const changePage = useCallback(
    (page: number) => {
      updateFilters({ page });
    },
    [updateFilters]
  );

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  // Załaduj fiszki przy pierwszym renderze
  useEffect(() => {
    fetchFlashcards();
  }, []); // Celowo pusta dependency array - chcemy załadować tylko raz

  return {
    state,
    fetchFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    updateFilters,
    changePage,
    resetState,
  };
};
