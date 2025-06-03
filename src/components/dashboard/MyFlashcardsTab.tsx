import React from "react";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import MyFlashcardsView from "../flashcards/MyFlashcardsView";
import type { GetFlashcardsQuery } from "@/types";

/**
 * Tab komponent dla sekcji "Moje Fiszki" w dashboard
 * Wrapper dla MyFlashcardsView z domyślnymi ustawieniami dla dashboard
 */
export default function MyFlashcardsTab() {
  // Domyślne filtry dla dashboard - najnowsze fiszki z większym limitem
  const initialFilters: Partial<GetFlashcardsQuery> = {
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 12, // Większy limit dla dashboard
    page: 1,
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Opcjonalny nagłówek lub wprowadzenie dla dashboard */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <span>📚</span>
            Zarządzaj swoimi fiszkami
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Przeglądaj, edytuj i organizuj swoje fiszki edukacyjne. 
            Używaj filtrów i wyszukiwania żeby szybko znaleźć to czego szukasz.
          </p>
        </div>

        {/* Główny widok fiszek */}
        <MyFlashcardsView initialFilters={initialFilters} />
      </div>
    </ErrorBoundary>
  );
}
