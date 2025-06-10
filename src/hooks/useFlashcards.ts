import { useState, useCallback, useEffect, useRef } from "react";
import { flashcardsApiService } from "@/lib/services/flashcardsApiService";
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
  const filtersRef = useRef<GetFlashcardsQuery>({});
  const initializedRef = useRef(false);

  // Aktualizuj ref przy każdej zmianie filtrów
  useEffect(() => {
    filtersRef.current = state.filters;
  }, [state.filters]);

  const fetchFlashcards = useCallback(async (query: GetFlashcardsQuery = {}) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: undefined,
      filters: { ...prev.filters, ...query },
    }));

    try {
      const data: FlashcardsListDto = await flashcardsApiService.fetchFlashcards(query);

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
  }, []);

  const createFlashcard = useCallback(
    async (command: CreateFlashcardCommand): Promise<FlashcardDto | null> => {
      try {
        const flashcard: FlashcardDto = await flashcardsApiService.createFlashcard(command);

        // Odśwież listę fiszek po utworzeniu używając aktualnych filtrów
        await fetchFlashcards(filtersRef.current);

        return flashcard;
      } catch (error) {
        console.error("Błąd podczas tworzenia fiszki:", error);
        throw error;
      }
    },
    [fetchFlashcards]
  );

  const updateFlashcard = useCallback(
    async (id: string, command: UpdateFlashcardCommand): Promise<FlashcardDto | null> => {
      try {
        const flashcard: FlashcardDto = await flashcardsApiService.updateFlashcard(id, command);

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
      await flashcardsApiService.deleteFlashcard(id);

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
      const updatedFilters = { ...filtersRef.current, ...newFilters };
      fetchFlashcards(updatedFilters);
    },
    [fetchFlashcards]
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
    // Używamy wersji inline żeby nie było dependency na fetchFlashcards
    const loadInitialFlashcards = async () => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: undefined,
      }));

      try {
        const data: FlashcardsListDto = await flashcardsApiService.fetchFlashcards();

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
    };

    if (!initializedRef.current) {
      loadInitialFlashcards();
      initializedRef.current = true;
    }
  }, []); // Pusta dependency array - ładujemy tylko raz

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
