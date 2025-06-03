import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import type {
  AiGenerationState,
  GenerateAiFlashcardsCommand,
  AiFlashcardSuggestionItem,
  AiFlashcardSuggestionsDto,
  CreateFlashcardCommand,
  FlashcardDto,
} from "@/types";

const initialState: AiGenerationState = {
  isGenerating: false,
  suggestions: [],
  sourceText: "",
  error: undefined,
  lastGeneratedAt: undefined,
};

// Enhanced configuration
const CONFIG = {
  retry: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 8000,
    backoffFactor: 2,
  },
  cache: {
    enabled: true,
    maxEntries: 5,
    ttl: 1000 * 60 * 30, // 30 minutes
  },
  performance: {
    slowRequestThreshold: 10000, // 10 seconds
    timeout: 45000, // 45 seconds for AI generation
    batchSize: 3,
    batchDelay: 1000,
  },
} as const;

// Cache for generated suggestions
interface CacheEntry {
  suggestions: AiFlashcardSuggestionItem[];
  timestamp: number;
  sourceText: string;
  hash: string;
}

const suggestionCache = new Map<string, CacheEntry>();

// Utility functions
const generateHash = (text: string): string => {
  // Safe hash generation that handles Unicode characters (including Polish diacritics)
  let hash = 0;
  const textSample = text.slice(0, 100) + text.length;
  
  for (let i = 0; i < textSample.length; i++) {
    const char = textSample.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive string and ensure it's alphanumeric
  return Math.abs(hash).toString(36);
};

const getCacheKey = (sourceText: string): string => {
  return generateHash(sourceText);
};

const isCacheValid = (entry: CacheEntry): boolean => {
  return Date.now() - entry.timestamp < CONFIG.cache.ttl;
};

const cleanCache = (): void => {
  const now = Date.now();
  for (const [key, entry] of suggestionCache.entries()) {
    if (now - entry.timestamp > CONFIG.cache.ttl) {
      suggestionCache.delete(key);
    }
  }
  
  // Keep only the most recent entries
  if (suggestionCache.size > CONFIG.cache.maxEntries) {
    const entries = Array.from(suggestionCache.entries())
      .sort(([, a], [, b]) => b.timestamp - a.timestamp);
    
    suggestionCache.clear();
    entries.slice(0, CONFIG.cache.maxEntries).forEach(([key, value]) => {
      suggestionCache.set(key, value);
    });
  }
};

const getRetryDelay = (attempt: number): number => {
  const delay = CONFIG.retry.baseDelay * Math.pow(CONFIG.retry.backoffFactor, attempt - 1);
  return Math.min(delay, CONFIG.retry.maxDelay);
};

const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = CONFIG.retry.maxAttempts,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors except rate limits
      if (error instanceof Error) {
        const isRateLimitError = error.message.includes('429') || error.message.includes('rate limit');
        const isClientError = /^4\d\d/.test(error.message) && !isRateLimitError;
        
        if (isClientError) {
          throw error;
        }
      }
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delay = getRetryDelay(attempt);
      onRetry?.(attempt, lastError);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

export const useAiGeneration = () => {
  const [state, setState] = useState<AiGenerationState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const performanceRef = useRef<{ startTime: number; requestId: string } | null>(null);
  const statsRef = useRef({ totalRequests: 0, successfulRequests: 0, cachedRequests: 0 });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const generateSuggestions = useCallback(async (command: GenerateAiFlashcardsCommand) => {
    const requestId = Math.random().toString(36).substr(2, 9);
    const startTime = Date.now();
    
    performanceRef.current = { startTime, requestId };
    statsRef.current.totalRequests += 1;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const cacheKey = getCacheKey(command.sourceText);
    if (CONFIG.cache.enabled && suggestionCache.has(cacheKey)) {
      const cached = suggestionCache.get(cacheKey)!;
      if (isCacheValid(cached)) {
        statsRef.current.cachedRequests += 1;
        
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          suggestions: cached.suggestions,
          sourceText: command.sourceText,
          error: undefined,
          lastGeneratedAt: new Date(cached.timestamp),
        }));

        toast.success("⚡ Fiszki załadowane z pamięci podręcznej", {
          description: `Znaleziono ${cached.suggestions.length} zapisanych sugestii`,
          duration: 3000,
        });

        return;
      }
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setState((prev) => ({
      ...prev,
      isGenerating: true,
      error: undefined,
      sourceText: command.sourceText,
    }));

    try {
      const result = await retryWithBackoff(
        async () => {
          const response = await fetch("/api/flashcards/generate-ai", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(command),
            signal: abortController.signal,
          });

          if (!response.ok) {
            let errorMessage = "Błąd podczas generowania fiszek";
            
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch {
              errorMessage = `${response.status}: ${response.statusText}`;
            }
            
            if (response.status === 429) {
              errorMessage = "Zbyt wiele żądań. Spróbuj ponownie za 1-2 minuty.";
            } else if (response.status === 401) {
              errorMessage = "Sesja wygasła. Odśwież stronę i zaloguj się ponownie.";
            } else if (response.status === 403) {
              errorMessage = "Brak uprawnień. Sprawdź swoje konto.";
            } else if (response.status === 413) {
              errorMessage = "Tekst jest zbyt długi. Skróć go do maksymalnie 10000 znaków.";
            } else if (response.status === 503) {
              errorMessage = "Serwis AI jest chwilowo niedostępny. Spróbuj ponownie za kilka minut.";
            } else if (response.status >= 500) {
              errorMessage = "Tymczasowy problem z serwerem. Spróbuj ponownie.";
            }
            
            throw new Error(errorMessage);
          }

          return await response.json();
        },
        CONFIG.retry.maxAttempts,
        (attempt, error) => {
          toast.loading(`Ponów ${attempt}/3...`, {
            id: `retry-${requestId}`,
            duration: 2000,
          });
        }
      );

      const data: AiFlashcardSuggestionsDto = result;
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (duration > CONFIG.performance.slowRequestThreshold) {
        toast("⏱️ Generowanie trwało dłużej niż zwykle", {
          description: `Czas: ${Math.round(duration / 1000)}s. Sprawdź połączenie internetowe.`,
          duration: 5000,
        });
      }

      if (CONFIG.cache.enabled && data.suggestions.length > 0) {
        cleanCache();
        suggestionCache.set(cacheKey, {
          suggestions: data.suggestions,
          timestamp: Date.now(),
          sourceText: command.sourceText,
          hash: cacheKey,
        });
      }

      setState((prev) => ({
        ...prev,
        isGenerating: false,
        suggestions: data.suggestions,
        lastGeneratedAt: new Date(),
        error: undefined,
      }));

      statsRef.current.successfulRequests += 1;

    } catch (error) {
      if (!abortController.signal.aborted) {
        const errorMessage = error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd";
        
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: errorMessage,
        }));

        toast.error("❌ Błąd generowania", {
          description: errorMessage,
          duration: 8000,
          action: {
            label: "Ponów",
            onClick: () => generateSuggestions(command),
          },
        });
      }
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      performanceRef.current = null;
    }
  }, []);

  const acceptSuggestion = useCallback(
    async (suggestion: AiFlashcardSuggestionItem): Promise<FlashcardDto | null> => {
      try {
        const command: CreateFlashcardCommand = {
          question: suggestion.suggestedQuestion.trim(),
          answer: suggestion.suggestedAnswer.trim(),
          isAiGenerated: true,
          sourceTextForAi: state.sourceText,
        };

        const result = await retryWithBackoff(async () => {
          const response = await fetch("/api/flashcards", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(command),
          });

          if (!response.ok) {
            let errorMessage = "Błąd podczas zapisywania fiszki";
            
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch {
              errorMessage = `${response.status}: ${response.statusText}`;
            }
            
            if (response.status === 409) {
              errorMessage = "Taka fiszka już istnieje w Twojej kolekcji";
            } else if (response.status === 413) {
              errorMessage = "Fiszka jest zbyt długa. Skróć treść pytania lub odpowiedzi.";
            }
            
            throw new Error(errorMessage);
          }

          return await response.json();
        });

        const flashcard: FlashcardDto = result;

        setState((prev) => ({
          ...prev,
          suggestions: prev.suggestions.filter(
            (s) =>
              s.suggestedQuestion !== suggestion.suggestedQuestion || 
              s.suggestedAnswer !== suggestion.suggestedAnswer
          ),
        }));

        return flashcard;

      } catch (error) {
        throw error;
      }
    },
    [state.sourceText]
  );

  const rejectSuggestion = useCallback((suggestion: AiFlashcardSuggestionItem) => {
    setState((prev) => ({
      ...prev,
      suggestions: prev.suggestions.filter(
        (s) => 
          s.suggestedQuestion !== suggestion.suggestedQuestion || 
          s.suggestedAnswer !== suggestion.suggestedAnswer
      ),
    }));
  }, []);

  const clearSuggestions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      suggestions: [],
      error: undefined,
    }));
  }, []);

  const resetState = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    
    setState(initialState);
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (state.isGenerating) {
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        error: "Żądanie zostało anulowane przez użytkownika",
      }));
      
      toast.info("🚫 Generowanie zostało anulowane", {
        duration: 3000,
      });
    }
  }, [state.isGenerating]);

  // Bulk operations
  const acceptAllSuggestions = useCallback(
    async (suggestions: AiFlashcardSuggestionItem[]): Promise<FlashcardDto[]> => {
      const results: FlashcardDto[] = [];
      const batchSize = CONFIG.performance.batchSize;
      
      for (let i = 0; i < suggestions.length; i += batchSize) {
        const batch = suggestions.slice(i, i + batchSize);
        
        const batchResults = await Promise.allSettled(
          batch.map(suggestion => acceptSuggestion(suggestion))
        );
        
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value) {
            results.push(result.value);
          }
        });
        
        if (i + batchSize < suggestions.length) {
          await new Promise(resolve => setTimeout(resolve, CONFIG.performance.batchDelay));
        }
      }
      
      return results;
    },
    [acceptSuggestion]
  );

  // Debug/stats helpers
  const getStats = useCallback(() => {
    return {
      ...statsRef.current,
      cacheSize: suggestionCache.size,
      currentRequest: performanceRef.current,
    };
  }, []);

  const clearCache = useCallback(() => {
    suggestionCache.clear();
  }, []);

  return {
    state,
    generateSuggestions,
    acceptSuggestion,
    rejectSuggestion,
    clearSuggestions,
    resetState,
    cancelRequest,
    acceptAllSuggestions,
    getStats,
    clearCache,
  };
};
