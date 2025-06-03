import { useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useAiGeneration } from "@/hooks/useAiGeneration";
import AiGeneratorForm from "../ai/AiGeneratorForm";
import AiSuggestionsList from "../ai/AiSuggestionsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AiFlashcardSuggestionItem, FlashcardDto } from "@/types";

export default function AiGeneratorTab() {
  const { 
    state, 
    generateSuggestions, 
    acceptSuggestion, 
    rejectSuggestion, 
    clearSuggestions,
    cancelRequest,
    getStats,
    clearCache 
  } = useAiGeneration();

  // Statistics and analytics
  const analytics = useMemo(() => {
    const stats = getStats();
    const successRate = stats.totalRequests > 0 ? Math.round((stats.successfulRequests / stats.totalRequests) * 100) : 0;
    const cacheHitRate = stats.totalRequests > 0 ? Math.round((stats.cachedRequests / stats.totalRequests) * 100) : 0;
    
    return {
      ...stats,
      successRate,
      cacheHitRate,
      hasData: stats.totalRequests > 0,
    };
  }, [getStats]);

  // Session state
  const sessionStats = useMemo(() => {
    const total = state.suggestions.length;
    const processed = 0; // Will be tracked by AiSuggestionsList
    const remaining = total - processed;
    
    return { total, processed, remaining };
  }, [state.suggestions.length]);

  // Performance monitoring
  useEffect(() => {
    if (state.lastGeneratedAt) {
      const generateTime = Date.now() - state.lastGeneratedAt.getTime();
      if (generateTime > 30000) {
        // Performance monitoring - could be replaced with analytics
      }
    }
  }, [state.lastGeneratedAt]);

  // Enhanced accept handler with analytics
  const handleAcceptSuggestion = useCallback(async (suggestion: AiFlashcardSuggestionItem): Promise<FlashcardDto | null> => {
    const startTime = Date.now();
    
    try {
      const result = await acceptSuggestion(suggestion);
      const duration = Date.now() - startTime;
      
      if (result) {
        toast.success("✅ Fiszka zapisana!", {
          description: `${suggestion.suggestedQuestion.slice(0, 50)}${suggestion.suggestedQuestion.length > 50 ? '...' : ''}`,
          duration: 3000,
          action: duration > 3000 ? undefined : {
            label: "Zobacz",
            onClick: () => {
              // Could navigate to "Moje Fiszki" tab
            },
          },
        });

        if (duration > 5000) {
          toast("⏱️ Zapisywanie trwało dłużej niż zwykle", {
            description: "Sprawdź połączenie internetowe",
            duration: 3000,
          });
        }
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd";
      
      toast.error("❌ Nie udało się zapisać fiszki", {
        description: errorMessage,
        duration: 6000,
        action: {
          label: "Ponów",
          onClick: () => handleAcceptSuggestion(suggestion),
        },
      });
      
      throw error;
    }
  }, [acceptSuggestion]);

  // Enhanced reject handler with feedback
  const handleRejectSuggestion = useCallback((suggestion: AiFlashcardSuggestionItem) => {
    rejectSuggestion(suggestion);
    
    // Contextual feedback based on number of remaining suggestions
    const remaining = state.suggestions.length - 1;
    let description = "Fiszka nie zostanie zapisana";
    
    if (remaining === 0) {
      description = "Wszystkie sugestie zostały przejrzane";
    } else if (remaining <= 2) {
      description = `Pozostało ${remaining} fiszek do przejrzenia`;
    }
    
    toast.info("🗑️ Sugestia odrzucona", {
      description,
      duration: 2000,
    });
  }, [rejectSuggestion, state.suggestions.length]);

  // Enhanced generate handler with smart notifications
  const handleGenerateSuggestions = useCallback(async (command: { sourceText: string }) => {
    try {
      // Smart loading notification based on text length
      const estimatedTime = Math.max(10, Math.min(45, command.sourceText.length / 200));
      
      const loadingToast = toast.loading("🤖 AI analizuje tekst...", {
        description: `Szacowany czas: ${Math.round(estimatedTime)}s`,
      });

      const startTime = Date.now();
      await generateSuggestions(command);
      const actualTime = Math.round((Date.now() - startTime) / 1000);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Success feedback is handled by the hook's cache logic or here for fresh generation
      if (state.suggestions.length > 0) {
        toast.success("🎉 Fiszki wygenerowane!", {
          description: `${state.suggestions.length} sugestii w ${actualTime}s`,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error in generate suggestions:", error);
      // Error handling is done in the hook
    }
  }, [generateSuggestions, state.suggestions.length]);

  // Utility functions
  const handleClearCache = useCallback(() => {
    clearCache();
    toast.info("🗑️ Pamięć podręczna wyczyszczona", {
      description: "Kolejne generowanie będzie używać świeżych danych",
      duration: 3000,
    });
  }, [clearCache]);

  const handleCancelGeneration = useCallback(() => {
    cancelRequest();
  }, [cancelRequest]);

  return (
    <div className="space-y-8">
      {/* Enhanced header with analytics */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                🤖 Generator Fiszek AI
                {state.isGenerating && (
                  <Badge variant="outline" className="text-blue-600 animate-pulse">
                    Generowanie...
                  </Badge>
                )}
                {sessionStats.total > 0 && !state.isGenerating && (
                  <Badge variant="outline" className="text-green-600">
                    {sessionStats.total} wygenerowanych
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Wprowadź tekst edukacyjny (1000-10000 znaków), a AI automatycznie wygeneruje dla Ciebie fiszki do nauki.
                {analytics.hasData && (
                  <span className="block text-xs text-gray-500 mt-1">
                    Wydajność sesji: {analytics.successRate}% sukces
                    {analytics.cacheHitRate > 0 && `, ${analytics.cacheHitRate}% z cache`}
                  </span>
                )}
              </CardDescription>
            </div>
            
            {/* Quick actions */}
            {(analytics.cacheSize > 0 || state.isGenerating) && (
              <div className="flex items-center gap-2">
                {state.isGenerating && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelGeneration}
                    className="text-red-600 hover:text-red-800"
                  >
                    🚫 Anuluj
                  </Button>
                )}
                {analytics.cacheSize > 0 && !state.isGenerating && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCache}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    🗑️ Wyczyść cache ({analytics.cacheSize})
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-purple-600">📝</span>
              <span>Minimum 1000 znaków tekstu</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">⚡</span>
              <span>Inteligentne cache'owanie</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✏️</span>
              <span>Edycja przed zapisem</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced form with performance tracking */}
      <AiGeneratorForm 
        onGenerate={handleGenerateSuggestions} 
        isGenerating={state.isGenerating} 
        error={state.error} 
      />

      {/* Enhanced generation status */}
      {state.isGenerating && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-blue-700 font-medium">
                  🤖 AI analizuje Twój tekst i generuje fiszki...
                </span>
              </div>
              <div className="text-center space-y-2">
                <div className="text-sm text-gray-600">
                  Proces trwa zwykle 10-45 sekund w zależności od długości tekstu
                </div>
                {analytics.hasData && (
                  <div className="text-xs text-gray-500">
                    Średni czas w tej sesji: ~{Math.round((analytics.totalRequests > 0 ? 25 : 20))}s
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelGeneration}
                  className="text-red-600 hover:text-red-800"
                >
                  🚫 Anuluj generowanie
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced error display */}
      {state.error && !state.isGenerating && (
        <Alert variant="destructive">
          <AlertDescription className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-lg">❌</span>
              <div className="flex-1">
                <strong>Wystąpił błąd podczas generowania:</strong>
                <br />
                {state.error}
              </div>
            </div>
            <div className="text-sm space-y-2">
              <div className="font-medium">Możliwe rozwiązania:</div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Sprawdź połączenie internetowe</li>
                <li>Spróbuj ponownie za chwilę</li>
                <li>Skróć tekst jeśli przekracza 10000 znaków</li>
                <li>Użyj tekstu o charakterze edukacyjnym</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGenerateSuggestions({ sourceText: state.sourceText })}
                disabled={!state.sourceText || state.sourceText.length < 1000}
              >
                🔄 Spróbuj ponownie
              </Button>
              {analytics.cacheSize > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearCache}
                >
                  🗑️ Wyczyść cache
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced suggestions list */}
      {state.suggestions.length > 0 && !state.isGenerating && (
        <div className="space-y-4">
          {/* Success message with stats */}
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="flex items-center gap-2">
              <span>🎉</span>
              <div className="flex-1">
                <strong>Świetnie!</strong> AI wygenerował {state.suggestions.length} sugest
                {state.suggestions.length === 1 ? 'ię' : 
                 state.suggestions.length < 5 ? 'ie' : 'ii'} fiszek.
                <br />
                <span className="text-sm">
                  Przejrzyj je, edytuj w razie potrzeby i zapisz te, które uznasz za przydatne.
                </span>
              </div>
              {state.lastGeneratedAt && (
                <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                  {new Date(state.lastGeneratedAt).toLocaleTimeString('pl-PL')}
                </div>
              )}
            </AlertDescription>
          </Alert>

          <AiSuggestionsList 
            suggestions={state.suggestions} 
            onAccept={handleAcceptSuggestion} 
            onReject={handleRejectSuggestion} 
          />
        </div>
      )}

      {/* Enhanced empty state */}
      {state.suggestions.length === 0 && !state.isGenerating && state.lastGeneratedAt && !state.error && (
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <span className="text-4xl">🤔</span>
              <h3 className="font-medium text-gray-900">Brak sugestii</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  AI nie udało się wygenerować fiszek z podanego tekstu.
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Możliwe przyczyny:</div>
                  <ul className="list-disc list-inside">
                    <li>Tekst ma zbyt mało treści edukacyjnej</li>
                    <li>Brak jasnych koncepcji do stworzenia pytań</li>
                    <li>Tekst jest zbyt techniczny lub specjalistyczny</li>
                  </ul>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => clearSuggestions()}
              >
                🔄 Spróbuj z innym tekstem
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced instructions */}
      {!state.lastGeneratedAt && state.suggestions.length === 0 && !state.isGenerating && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">🚀 Jak zacząć?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-blue-800">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <strong>Wklej tekst edukacyjny</strong> (1000-10000 znaków) - może to być fragment podręcznika, artykuł naukowy, notatki z wykładu, lub dowolny materiał do nauki.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <strong>Kliknij "Generuj fiszki"</strong> i poczekaj, aż AI przeanalizuje treść i stworzy pytania oraz odpowiedzi. Pierwsza generacja może potrwać 10-45 sekund.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <div>
                  <strong>Przejrzyj i dostosuj</strong> wygenerowane fiszki - możesz edytować pytania i odpowiedzi przed zapisaniem. Każda zmiana jest natychmiast walidowana.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <div>
                  <strong>Zapisz wybrane fiszki</strong> i rozpocznij naukę! Zapisane fiszki znajdziesz w zakładce "Moje Fiszki". Możesz też użyć akcji grupowych dla szybszego przetwarzania.
                </div>
              </div>
            </div>
            
            {/* Pro tips */}
            {analytics.hasData && (
              <div className="mt-6 p-3 bg-blue-100 rounded border border-blue-300">
                <div className="text-sm font-medium text-blue-900 mb-2">💡 Wskazówki dla doświadczonych:</div>
                <div className="text-xs text-blue-800 space-y-1">
                  <div>• Podobny tekst będzie załadowany z cache w sekundę</div>
                  <div>• Użyj Ctrl+Enter dla szybkiego zapisywania fiszek</div>
                  <div>• Akcje grupowe pozwalają przetworzyć wiele fiszek naraz</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

