import { useState, useCallback } from "react";
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

export const useAiGeneration = () => {
  const [state, setState] = useState<AiGenerationState>(initialState);

  const generateSuggestions = useCallback(async (command: GenerateAiFlashcardsCommand) => {
    setState((prev) => ({
      ...prev,
      isGenerating: true,
      error: undefined,
      sourceText: command.sourceText,
    }));

    try {
      const response = await fetch("/api/flashcards/generate-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Błąd podczas generowania fiszek");
      }

      const data: AiFlashcardSuggestionsDto = await response.json();

      setState((prev) => ({
        ...prev,
        isGenerating: false,
        suggestions: data.suggestions,
        lastGeneratedAt: new Date(),
        error: undefined,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd",
      }));
    }
  }, []);

  const acceptSuggestion = useCallback(
    async (suggestion: AiFlashcardSuggestionItem): Promise<FlashcardDto | null> => {
      try {
        const command: CreateFlashcardCommand = {
          question: suggestion.suggestedQuestion,
          answer: suggestion.suggestedAnswer,
          isAiGenerated: true,
          sourceTextForAi: state.sourceText,
        };

        const response = await fetch("/api/flashcards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Błąd podczas zapisywania fiszki");
        }

        const flashcard: FlashcardDto = await response.json();

        // Usuń zaakceptowaną sugestię z listy
        setState((prev) => ({
          ...prev,
          suggestions: prev.suggestions.filter(
            (s) =>
              s.suggestedQuestion !== suggestion.suggestedQuestion || s.suggestedAnswer !== suggestion.suggestedAnswer
          ),
        }));

        return flashcard;
      } catch (error) {
        console.error("Błąd podczas akceptowania sugestii:", error);
        throw error;
      }
    },
    [state.sourceText]
  );

  const rejectSuggestion = useCallback((suggestion: AiFlashcardSuggestionItem) => {
    setState((prev) => ({
      ...prev,
      suggestions: prev.suggestions.filter(
        (s) => s.suggestedQuestion !== suggestion.suggestedQuestion || s.suggestedAnswer !== suggestion.suggestedAnswer
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
    setState(initialState);
  }, []);

  return {
    state,
    generateSuggestions,
    acceptSuggestion,
    rejectSuggestion,
    clearSuggestions,
    resetState,
  };
};
