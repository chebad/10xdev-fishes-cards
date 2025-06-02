import { useState } from "react";
import { useFlashcards } from "@/hooks/useFlashcards";
import FlashcardsControls from "../flashcards/FlashcardsControls";
import FlashcardsList from "../flashcards/FlashcardsList";
import FlashcardCreateModal from "../modals/FlashcardCreateModal";
import FlashcardEditModal from "../modals/FlashcardEditModal";
import type { FlashcardListItemDto, CreateFlashcardCommand, UpdateFlashcardCommand } from "@/types";

export default function MyFlashcardsTab() {
  const { state, updateFilters, changePage, deleteFlashcard, createFlashcard, updateFlashcard } = useFlashcards();
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardListItemDto | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (flashcard: FlashcardListItemDto) => {
    setEditingFlashcard(flashcard);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setEditingFlashcard(null);
  };

  const handleCreateSubmit = async (data: CreateFlashcardCommand) => {
    setIsSubmitting(true);
    try {
      await createFlashcard(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (id: string, data: UpdateFlashcardCommand) => {
    setIsSubmitting(true);
    try {
      await updateFlashcard(id, data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <FlashcardsControls
        filters={state.filters}
        onFiltersChange={updateFilters}
        onCreateNew={handleCreateNew}
        totalCount={state.pagination.totalItems}
      />

      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Błąd</h3>
              <div className="mt-2 text-sm text-red-700">{state.error}</div>
            </div>
          </div>
        </div>
      )}

      <FlashcardsList
        flashcards={state.flashcards}
        pagination={state.pagination}
        isLoading={state.isLoading}
        onEdit={handleEdit}
        onDelete={deleteFlashcard}
        onPageChange={changePage}
      />

      {/* Modal tworzenia fiszki */}
      <FlashcardCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Modal edycji fiszki */}
      {editingFlashcard && (
        <FlashcardEditModal
          isOpen={true}
          onClose={handleCloseEditModal}
          onSubmit={handleEditSubmit}
          isSubmitting={isSubmitting}
          flashcard={editingFlashcard}
        />
      )}
    </div>
  );
}
