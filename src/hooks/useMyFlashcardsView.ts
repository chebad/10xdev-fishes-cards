import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useFlashcards } from "./useFlashcards";
import type {
  ModalState,
  FlashcardListItemDto,
  FlashcardDto,
  CreateFlashcardCommand,
  UpdateFlashcardCommand,
  GetFlashcardsQuery,
  MyFlashcardsViewProps,
} from "@/types";

/**
 * Custom hook dla zarządzania stanem widoku My Flashcards
 * Integruje useFlashcards z zarządzaniem modalami i toast notifications
 */
export const useMyFlashcardsView = (initialFilters?: Partial<GetFlashcardsQuery>) => {
  const flashcardsHook = useFlashcards();
  
  // Stan modali
  const [modalState, setModalState] = useState<ModalState>({
    createModal: {
      isOpen: false,
      isSubmitting: false,
    },
    editModal: {
      isOpen: false,
      isSubmitting: false,
      flashcard: undefined,
    },
    deleteModal: {
      isOpen: false,
      isDeleting: false,
      flashcard: undefined,
    },
  });

  // Aplikuj inicjalne filtry jeśli zostały przekazane
  useEffect(() => {
    if (initialFilters) {
      flashcardsHook.updateFilters(initialFilters);
    }
  }, []); // Tylko przy pierwszym renderze

  // === OBSŁUGA BŁĘDÓW AUTORYZACJI ===
  const handleAuthError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Sprawdź czy to błąd autoryzacji
      if (message.includes('unauthorized') || message.includes('401')) {
        toast.error("Sesja wygasła. Przekierowuję do logowania...");
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return true;
      }
      
      if (message.includes('forbidden') || message.includes('403')) {
        toast.error("Brak uprawnień do wykonania tej operacji");
        return true;
      }
      
      // Sprawdź błędy sieciowe
      if (message.includes('failed to fetch') || message.includes('network')) {
        toast.error("Sprawdź połączenie internetowe");
        return true;
      }
      
      if (message.includes('timeout')) {
        toast.error("Żądanie przekroczyło limit czasu");
        return true;
      }
    }
    
    return false; // Nie jest to znany błąd autoryzacji/sieciowy
  }, []);

  // === OBSŁUGA MODALU TWORZENIA ===
  const openCreateModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      createModal: { isOpen: true, isSubmitting: false },
    }));
  }, []);

  const closeCreateModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      createModal: { isOpen: false, isSubmitting: false },
    }));
  }, []);

  const handleCreateFlashcard = useCallback(async (data: CreateFlashcardCommand) => {
    setModalState(prev => ({
      ...prev,
      createModal: { ...prev.createModal, isSubmitting: true },
    }));

    try {
      await flashcardsHook.createFlashcard(data);
      
      // Sukces - zamknij modal i pokaż toast
      setModalState(prev => ({
        ...prev,
        createModal: { isOpen: false, isSubmitting: false },
      }));
      
      toast.success("Fiszka została utworzona pomyślnie! ✨");
    } catch (error) {
      // Błąd - zostaw modal otwarty ale przestań ładować
      setModalState(prev => ({
        ...prev,
        createModal: { ...prev.createModal, isSubmitting: false },
      }));
      
      // Sprawdź czy to błąd autoryzacji
      const isAuthError = handleAuthError(error);
      if (!isAuthError) {
        const errorMessage = error instanceof Error ? error.message : "Wystąpił błąd podczas tworzenia fiszki";
        toast.error(errorMessage);
      }
      throw error; // Re-throw żeby modal mógł obsłużyć błąd
    }
  }, [flashcardsHook, handleAuthError]);

  // === OBSŁUGA MODALU EDYCJI ===
  const openEditModal = useCallback((flashcard: FlashcardListItemDto) => {
    // Konwertuj FlashcardListItemDto na FlashcardDto dla edycji
    const fullFlashcard: FlashcardDto = {
      ...flashcard,
      sourceTextForAi: null, // FlashcardListItemDto nie zawiera tego pola
      isDeleted: false, // FlashcardListItemDto nie zawiera tego pola
    };

    setModalState(prev => ({
      ...prev,
      editModal: {
        isOpen: true,
        isSubmitting: false,
        flashcard: fullFlashcard,
      },
    }));
  }, []);

  const closeEditModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      editModal: {
        isOpen: false,
        isSubmitting: false,
        flashcard: undefined,
      },
    }));
  }, []);

  const handleEditFlashcard = useCallback(async (id: string, data: UpdateFlashcardCommand) => {
    setModalState(prev => ({
      ...prev,
      editModal: { ...prev.editModal, isSubmitting: true },
    }));

    try {
      await flashcardsHook.updateFlashcard(id, data);
      
      // Sukces - zamknij modal i pokaż toast
      setModalState(prev => ({
        ...prev,
        editModal: {
          isOpen: false,
          isSubmitting: false,
          flashcard: undefined,
        },
      }));
      
      toast.success("Fiszka została zaktualizowana pomyślnie! ✏️");
    } catch (error) {
      // Błąd - zostaw modal otwarty ale przestań ładować
      setModalState(prev => ({
        ...prev,
        editModal: { ...prev.editModal, isSubmitting: false },
      }));
      
      // Sprawdź czy to błąd autoryzacji
      const isAuthError = handleAuthError(error);
      if (!isAuthError) {
        const errorMessage = error instanceof Error ? error.message : "Wystąpił błąd podczas aktualizacji fiszki";
        toast.error(errorMessage);
      }
      throw error; // Re-throw żeby modal mógł obsłużyć błąd
    }
  }, [flashcardsHook, handleAuthError]);

  // === OBSŁUGA MODALU USUWANIA ===
  const openDeleteModal = useCallback((flashcard: FlashcardListItemDto) => {
    setModalState(prev => ({
      ...prev,
      deleteModal: {
        isOpen: true,
        isDeleting: false,
        flashcard,
      },
    }));
  }, []);

  const closeDeleteModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      deleteModal: {
        isOpen: false,
        isDeleting: false,
        flashcard: undefined,
      },
    }));
  }, []);

  const handleDeleteFlashcard = useCallback(async () => {
    const flashcardId = modalState.deleteModal.flashcard?.id;
    if (!flashcardId) {
      toast.error("Nie można usunąć fiszki - brak ID");
      return;
    }

    setModalState(prev => ({
      ...prev,
      deleteModal: { ...prev.deleteModal, isDeleting: true },
    }));

    try {
      await flashcardsHook.deleteFlashcard(flashcardId);
      
      // Sukces - zamknij modal i pokaż toast
      setModalState(prev => ({
        ...prev,
        deleteModal: {
          isOpen: false,
          isDeleting: false,
          flashcard: undefined,
        },
      }));
      
      toast.success("Fiszka została usunięta pomyślnie! 🗑️");
    } catch (error) {
      // Błąd - zostaw modal otwarty ale przestań ładować
      setModalState(prev => ({
        ...prev,
        deleteModal: { ...prev.deleteModal, isDeleting: false },
      }));
      
      // Sprawdź czy to błąd autoryzacji
      const isAuthError = handleAuthError(error);
      if (!isAuthError) {
        const errorMessage = error instanceof Error ? error.message : "Wystąpił błąd podczas usuwania fiszki";
        toast.error(errorMessage);
      }
      throw error;
    }
  }, [flashcardsHook, modalState.deleteModal.flashcard?.id, handleAuthError]);

  // === OBSŁUGA DELETE PRZEZ FLASHCARD ITEM (alternatywny sposób) ===
  const handleDeleteFlashcardDirect = useCallback(async (flashcardId: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tę fiszkę?")) {
      return;
    }

    try {
      await flashcardsHook.deleteFlashcard(flashcardId);
      toast.success("Fiszka została usunięta pomyślnie! 🗑️");
    } catch (error) {
      // Sprawdź czy to błąd autoryzacji
      const isAuthError = handleAuthError(error);
      if (!isAuthError) {
        const errorMessage = error instanceof Error ? error.message : "Wystąpił błąd podczas usuwania fiszki";
        toast.error(errorMessage);
      }
      throw error;
    }
  }, [flashcardsHook, handleAuthError]);

  return {
    // Stan fiszek
    flashcardsState: flashcardsHook.state,
    
    // Stan modali
    modalState,
    
    // Akcje dla fiszek
    updateFilters: flashcardsHook.updateFilters,
    changePage: flashcardsHook.changePage,
    fetchFlashcards: flashcardsHook.fetchFlashcards,
    resetState: flashcardsHook.resetState,
    
    // Akcje dla modali
    createModal: {
      open: openCreateModal,
      close: closeCreateModal,
      submit: handleCreateFlashcard,
    },
    editModal: {
      open: openEditModal,
      close: closeEditModal,
      submit: handleEditFlashcard,
    },
    deleteModal: {
      open: openDeleteModal,
      close: closeDeleteModal,
      confirm: handleDeleteFlashcard,
    },
    
    // Dodatkowe akcje
    handleDeleteFlashcardDirect, // dla FlashcardItem
    handleAuthError, // eksport dla innych komponentów
  };
}; 