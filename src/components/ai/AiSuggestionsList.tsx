import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AiSuggestionItem from "./AiSuggestionItem";
import type { AiSuggestionsListProps, AiFlashcardSuggestionItem, FlashcardDto } from "@/types";

export default function AiSuggestionsList({ suggestions, onAccept, onReject }: AiSuggestionsListProps) {
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const suggestionsWithKeys = useMemo(() => 
    suggestions.map((suggestion, index) => ({
      ...suggestion,
      key: `${suggestion.suggestedQuestion.slice(0, 50)}-${index}`,
    })), [suggestions]
  );

  const stats = useMemo(() => {
    const total = suggestionsWithKeys.length;
    const remaining = total;
    const completed = acceptedCount;
    const progress = total > 0 ? Math.round((completed / (total + completed)) * 100) : 0;
    
    return { total, remaining, completed, progress };
  }, [suggestionsWithKeys.length, acceptedCount]);

  const handleAccept = useCallback(async (suggestion: AiFlashcardSuggestionItem): Promise<FlashcardDto | null> => {
    const key = `${suggestion.suggestedQuestion.slice(0, 50)}-${suggestions.indexOf(suggestion)}`;
    
    setProcessing(prev => new Set(prev).add(key));
    
    try {
      const result = await onAccept(suggestion);
      if (result) {
        setAcceptedCount(prev => prev + 1);
      }
      return result;
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  }, [onAccept, suggestions]);

  const handleReject = useCallback((suggestion: AiFlashcardSuggestionItem) => {
    onReject(suggestion);
  }, [onReject]);

  const handleAcceptAll = useCallback(async () => {
    const confirmMessage = `Czy na pewno chcesz zapisać wszystkie ${suggestionsWithKeys.length} fiszek?\n\nWszystkie sugestie zostaną dodane do Twojej kolekcji bez możliwości edycji.`;
    
    if (!confirm(confirmMessage)) return;

    setProcessing(new Set(suggestionsWithKeys.map(s => s.key)));
    
    try {
      const batchSize = 3;
      for (let i = 0; i < suggestionsWithKeys.length; i += batchSize) {
        const batch = suggestionsWithKeys.slice(i, i + batchSize);
        await Promise.all(
          batch.map(suggestion => handleAccept(suggestion).catch(console.error))
        );
        
        if (i + batchSize < suggestionsWithKeys.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } finally {
      setProcessing(new Set());
    }
  }, [suggestionsWithKeys, handleAccept]);

  const handleRejectAll = useCallback(() => {
    const confirmMessage = `Czy na pewno chcesz odrzucić wszystkie ${suggestionsWithKeys.length} fiszek?\n\nTa akcja jest nieodwracalna.`;
    
    if (!confirm(confirmMessage)) return;

    suggestionsWithKeys.forEach(suggestion => {
      handleReject(suggestion);
    });
  }, [suggestionsWithKeys, handleReject]);

  if (suggestions.length === 0) {
    return null;
  }

  const processingCount = processing.size;
  const hasProcessing = processingCount > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              🎯 Sugestie Fiszek AI
              <Badge variant="outline" className="text-blue-600">
                {stats.remaining} do przejrzenia
              </Badge>
            </CardTitle>
            <CardDescription>
              Wygenerowano {stats.total} {" "}
              {stats.total === 1 ? "fiszkę" : stats.total < 5 ? "fiszki" : "fiszek"}. 
              {stats.completed > 0 && ` Zapisano już ${stats.completed}.`}
              {" "}Przejrzyj każdą i wybierz te, które chcesz zachować.
            </CardDescription>
          </div>
          
          {stats.completed > 0 && (
            <div className="text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full">
              ✅ Postęp: {stats.completed}/{stats.total + stats.completed}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkActions(!showBulkActions)}
            className="text-xs"
            disabled={hasProcessing}
          >
            {showBulkActions ? "🔽 Ukryj akcje" : "🔼 Akcje grupowe"}
          </Button>
          
          {showBulkActions && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcceptAll}
                disabled={hasProcessing || suggestions.length === 0}
                className="text-xs text-green-700 hover:text-green-800"
              >
                ✅ Zapisz wszystkie ({suggestions.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
                disabled={hasProcessing || suggestions.length === 0}
                className="text-xs text-red-700 hover:text-red-800"
              >
                🗑️ Odrzuć wszystkie
              </Button>
            </>
          )}

          {hasProcessing && (
            <div className="text-xs text-blue-600 flex items-center gap-1">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
              Przetwarzanie {processingCount} fiszek...
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {hasProcessing && (
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <AlertDescription className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>
                <strong>Przetwarzanie...</strong> Zapisywanie {processingCount} fiszek do kolekcji.
                Może to potrwać kilka sekund.
              </span>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {suggestionsWithKeys.map((suggestion, index) => (
            <AiSuggestionItem
              key={suggestion.key}
              suggestion={suggestion}
              onAccept={handleAccept}
              onReject={handleReject}
              index={index + 1}
            />
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                🎯 Jakość fiszek
              </h4>
              <ul className="text-purple-800 space-y-1 text-xs">
                <li>• Sprawdź czy pytania są jednoznaczne</li>
                <li>• Upewnij się, że odpowiedzi są kompletne</li>
                <li>• Edytuj zbyt długie lub skomplikowane treści</li>
                <li>• Dodaj przykłady jeśli brakuje kontekstu</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                ⚡ Personalizacja
              </h4>
              <ul className="text-purple-800 space-y-1 text-xs">
                <li>• Dostosuj język do swojego poziomu</li>
                <li>• Zmień format pytań (np. "Co to?" → "Zdefiniuj")</li>
                <li>• Dodaj mnemoniki lub skojarzenia</li>
                <li>• Połącz powiązane koncepcje</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-purple-200">
            <p className="text-xs text-purple-700 flex items-center gap-2">
              💡 <strong>Wskazówka:</strong> Najlepiej działają fiszki, które edytujesz pod swoje potrzeby!
              Używaj <kbd className="px-1 py-0.5 bg-purple-100 rounded text-xs">Ctrl+Enter</kbd> dla szybkiego zapisywania.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
