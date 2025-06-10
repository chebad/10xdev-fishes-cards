import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import FlashcardsControls from "./FlashcardsControls";
import FlashcardsList from "./FlashcardsList";
import FlashcardCreateModal from "../modals/FlashcardCreateModal";
import FlashcardEditModal from "../modals/FlashcardEditModal";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";
import { useMyFlashcardsView } from "@/hooks/useMyFlashcardsView";
import type { MyFlashcardsViewProps } from "@/types";

/**
 * Główny kontener widoku "Moje Fiszki"
 * Zarządza stanem aplikacji, orchestruje komunikację między komponentami i wywołania API
 */
export default function MyFlashcardsView({ initialFilters }: MyFlashcardsViewProps) {
  const {
    flashcardsState,
    modalState,
    updateFilters,
    changePage,
    createModal,
    editModal,
    deleteModal,
    handleDeleteFlashcardDirect,
    fetchFlashcards,
  } = useMyFlashcardsView(initialFilters);

  // Loading state dla pierwszego ładowania
  if (flashcardsState.isLoading && !flashcardsState.lastFetchedAt) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="controls" />
        <LoadingSkeleton variant="list" count={6} />
      </div>
    );
  }

  // Error state z opcją retry
  if (flashcardsState.error && !flashcardsState.lastFetchedAt) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">❌</span>
                <h3 className="font-semibold">Nie udało się załadować fiszek</h3>
              </div>

              <p className="text-sm">{flashcardsState.error}</p>

              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchFlashcards()}
                  className="flex items-center gap-2"
                >
                  🔄 Spróbuj ponownie
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  🔃 Odśwież stronę
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Kontrolki filtrowania i wyszukiwania */}
        <FlashcardsControls
          filters={flashcardsState.filters}
          onFiltersChange={updateFilters}
          onCreateNew={createModal.open}
          totalCount={flashcardsState.pagination.totalItems}
        />

        {/* Error state dla błędów podczas filtrowania */}
        {flashcardsState.error && flashcardsState.lastFetchedAt && (
          <Alert variant="destructive">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>{flashcardsState.error}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchFlashcards(flashcardsState.filters)}>
                  Spróbuj ponownie
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Lista fiszek z paginacją */}
        <FlashcardsList
          flashcards={flashcardsState.flashcards}
          pagination={flashcardsState.pagination}
          isLoading={flashcardsState.isLoading}
          onEdit={editModal.open}
          onDelete={handleDeleteFlashcardDirect}
          onPageChange={changePage}
        />

        {/* Modal tworzenia nowej fiszki */}
        <FlashcardCreateModal
          isOpen={modalState.createModal.isOpen}
          onClose={createModal.close}
          onSubmit={createModal.submit}
          isSubmitting={modalState.createModal.isSubmitting}
        />

        {/* Modal edycji fiszki */}
        {modalState.editModal.flashcard && (
          <FlashcardEditModal
            isOpen={modalState.editModal.isOpen}
            onClose={editModal.close}
            onSubmit={editModal.submit}
            isSubmitting={modalState.editModal.isSubmitting}
            flashcard={modalState.editModal.flashcard}
          />
        )}

        {/* Modal potwierdzenia usunięcia fiszki */}
        <DeleteConfirmModal
          isOpen={modalState.deleteModal.isOpen}
          onClose={deleteModal.close}
          onConfirm={deleteModal.confirm}
          flashcard={modalState.deleteModal.flashcard}
          isDeleting={modalState.deleteModal.isDeleting}
        />

        {/* Toast notifications */}
        <Toaster position="top-right" expand={false} richColors closeButton />
      </div>
    </ErrorBoundary>
  );
}
