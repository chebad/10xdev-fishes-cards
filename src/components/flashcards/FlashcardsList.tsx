import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import FlashcardItem from "./FlashcardItem";
import type { FlashcardsListProps } from "@/types";

export default function FlashcardsList({
  flashcards,
  pagination,
  isLoading,
  onEdit,
  onDelete,
  onPageChange,
}: FlashcardsListProps) {
  if (isLoading) {
    return <LoadingSkeleton variant="list" count={3} />;
  }

  if (flashcards.length === 0) {
    return (
      <EmptyState
        icon="📚"
        title="Brak fiszek"
        description="Nie znaleziono fiszek spełniających kryteria wyszukiwania. Spróbuj zmienić filtry lub utwórz nową fiszkę."
        className="bg-white rounded-lg border shadow-sm"
      />
    );
  }

  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;

    // Zawsze pokazuj pierwszą stronę
    if (totalPages > 0) {
      pages.push(1);
    }

    // Dodaj separator jeśli potrzebny
    if (currentPage > 3) {
      pages.push("...");
    }

    // Dodaj strony wokół bieżącej strony
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Dodaj separator jeśli potrzebny
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Zawsze pokazuj ostatnią stronę
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Lista fiszek */}
      <div className="space-y-4">
        {flashcards.map((flashcard) => (
          <FlashcardItem key={flashcard.id} flashcard={flashcard} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>

      {/* Paginacja */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Informacje o paginacji */}
              <div className="text-sm text-gray-600 order-2 sm:order-1">
                Strona {pagination.currentPage} z {pagination.totalPages}
                {" • "}
                Wyświetlono {flashcards.length} z {pagination.totalItems} fiszek
              </div>

              {/* Przyciski paginacji */}
              <div className="flex items-center space-x-2 order-1 sm:order-2">
                {/* Poprzednia strona */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className="px-3"
                >
                  <span className="hidden sm:inline">← Poprzednia</span>
                  <span className="sm:hidden">←</span>
                </Button>

                {/* Numery stron */}
                <div className="hidden md:flex items-center space-x-1">
                  {generatePageNumbers().map((page, index) => {
                    if (page === "...") {
                      return (
                        <span key={`separator-${index}`} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }

                    return (
                      <Button
                        key={page}
                        variant={page === pagination.currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(page as number)}
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                {/* Mobilny selektor strony */}
                <div className="md:hidden flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {pagination.currentPage}/{pagination.totalPages}
                  </span>
                </div>

                {/* Następna strona */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="px-3"
                >
                  <span className="hidden sm:inline">Następna →</span>
                  <span className="sm:hidden">→</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
