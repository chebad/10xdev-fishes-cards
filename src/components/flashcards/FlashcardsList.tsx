import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie fiszek...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-gray-400">📚</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Brak fiszek</h3>
              <p className="text-gray-600">
                Nie znaleziono fiszek spełniających kryteria wyszukiwania.
                <br />
                Spróbuj zmienić filtry lub utwórz nową fiszkę.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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
            <div className="flex items-center justify-between">
              {/* Informacje o paginacji */}
              <div className="text-sm text-gray-600">
                Strona {pagination.currentPage} z {pagination.totalPages}
                {" • "}
                Wyświetlono {flashcards.length} z {pagination.totalItems} fiszek
              </div>

              {/* Przyciski paginacji */}
              <div className="flex items-center space-x-2">
                {/* Poprzednia strona */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                >
                  ← Poprzednia
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

                {/* Następna strona */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                >
                  Następna →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
