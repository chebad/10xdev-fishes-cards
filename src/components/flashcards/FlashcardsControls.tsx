import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { FlashcardsControlsProps, GetFlashcardsSortBy } from "@/types";

export default function FlashcardsControls({
  filters,
  onFiltersChange,
  onCreateNew,
  totalCount = 0,
}: FlashcardsControlsProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [isExpanded, setIsExpanded] = useState(false);
  const isInitialRender = useRef(true);

  // Debounce search input
  useEffect(() => {
    // Pomiń pierwsze wywołanie przy inicjalizacji
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      if (searchValue !== filters.search) {
        console.log("[FLASHCARDS_CONTROLS] Triggering onFiltersChange with search:", searchValue); // Debug log
        onFiltersChange({ search: searchValue || undefined });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue, filters.search, onFiltersChange]);

  const handleSortByChange = useCallback(
    (value: string) => {
      onFiltersChange({ sortBy: value as GetFlashcardsSortBy });
    },
    [onFiltersChange]
  );

  const handleSortOrderChange = useCallback(
    (value: string) => {
      onFiltersChange({ sortOrder: value as "asc" | "desc" });
    },
    [onFiltersChange]
  );

  const handleAiFilterChange = useCallback(
    (value: string) => {
      let isAiGenerated: boolean | undefined;
      if (value === "ai") isAiGenerated = true;
      else if (value === "manual") isAiGenerated = false;
      else isAiGenerated = undefined;

      onFiltersChange({ isAiGenerated });
    },
    [onFiltersChange]
  );

  const handleClearFilters = useCallback(() => {
    setSearchValue("");
    onFiltersChange({
      search: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
      isAiGenerated: undefined,
      page: 1,
    });
  }, [onFiltersChange]);

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.sortBy !== "createdAt" ||
      filters.sortOrder !== "desc" ||
      filters.isAiGenerated !== undefined
  );

  return (
    <Card className="shadow-sm border-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          {/* Nagłówek z liczbą fiszek i przyciskiem dodawania */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>📚</span>
                Moje Fiszki
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                  {totalCount}
                </span>
                {totalCount === 0
                  ? "Brak fiszek"
                  : totalCount === 1
                    ? "fiszka w kolekcji"
                    : totalCount < 5
                      ? "fiszki w kolekcji"
                      : "fiszek w kolekcji"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Przycisk rozwijania filtrów na mobile */}
              <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="sm:hidden">
                {isExpanded ? "🔼 Zwiń" : "🔽 Filtry"}
              </Button>

              <Button
                onClick={onCreateNew}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200 hover:scale-105"
              >
                <span className="mr-2">✨</span>
                Dodaj fiszkę
              </Button>
            </div>
          </div>

          {/* Kontrolki filtrowania */}
          <div className={`space-y-4 ${!isExpanded ? "hidden sm:block" : ""}`}>
            {/* Wyszukiwanie - zawsze widoczne */}
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <span>🔍</span>
                Wyszukaj
              </label>
              <Input
                id="search"
                placeholder="Szukaj w pytaniach i odpowiedziach..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full bg-white/70 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>

            {/* Zaawansowane filtry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sortowanie */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <span>📊</span>
                  Sortuj według
                </span>
                <Select value={filters.sortBy || "createdAt"} onValueChange={handleSortByChange}>
                  <SelectTrigger className="bg-white/70 backdrop-blur-sm border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">📅 Data utworzenia</SelectItem>
                    <SelectItem value="updatedAt">📝 Data modyfikacji</SelectItem>
                    <SelectItem value="question">🔤 Pytanie (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Kierunek sortowania */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <span>↕️</span>
                  Kierunek
                </span>
                <Select value={filters.sortOrder || "desc"} onValueChange={handleSortOrderChange}>
                  <SelectTrigger className="bg-white/70 backdrop-blur-sm border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">📉 Malejąco (najnowsze)</SelectItem>
                    <SelectItem value="asc">📈 Rosnąco (najstarsze)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtr AI */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <span>🏷️</span>
                  Typ fiszki
                </span>
                <Select
                  value={filters.isAiGenerated === true ? "ai" : filters.isAiGenerated === false ? "manual" : "all"}
                  onValueChange={handleAiFilterChange}
                >
                  <SelectTrigger className="bg-white/70 backdrop-blur-sm border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">📋 Wszystkie</SelectItem>
                    <SelectItem value="ai">🤖 Wygenerowane AI</SelectItem>
                    <SelectItem value="manual">✏️ Utworzone ręcznie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Przycisk czyszczenia filtrów */}
            {hasActiveFilters && (
              <div className="flex justify-center sm:justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-50"
                >
                  <span className="mr-1">🗑️</span>
                  Wyczyść filtry
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
