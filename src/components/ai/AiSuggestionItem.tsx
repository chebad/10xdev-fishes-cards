import { useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { AiFlashcardSuggestionItem, FlashcardDto, EditableSuggestionState } from "@/types";

interface AiSuggestionItemProps {
  suggestion: AiFlashcardSuggestionItem;
  onAccept: (suggestion: AiFlashcardSuggestionItem) => Promise<FlashcardDto | null>;
  onReject: (suggestion: AiFlashcardSuggestionItem) => void;
  index: number;
}

export default function AiSuggestionItem({ suggestion, onAccept, onReject, index }: AiSuggestionItemProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditableSuggestionState>({
    question: suggestion.suggestedQuestion,
    answer: suggestion.suggestedAnswer,
    isEditing: false,
    hasChanges: false,
    originalSuggestion: suggestion,
  });
  const [validationErrors, setValidationErrors] = useState<{ question?: string; answer?: string }>({});

  const validation = useMemo(() => {
    const questionLength = editState.question.trim().length;
    const answerLength = editState.answer.trim().length;
    const questionValid = questionLength >= 5;
    const answerValid = answerLength >= 3;

    const errors: { question?: string; answer?: string } = {};
    if (!questionValid && questionLength > 0) {
      errors.question = `Pytanie musi mieć co najmniej 5 znaków (obecnie: ${questionLength})`;
    }
    if (!answerValid && answerLength > 0) {
      errors.answer = `Odpowiedź musi mieć co najmniej 3 znaki (obecnie: ${answerLength})`;
    }

    return {
      isValid: questionValid && answerValid,
      questionLength,
      answerLength,
      errors,
    };
  }, [editState.question, editState.answer]);

  useEffect(() => {
    setValidationErrors(validation.errors);
  }, [validation.errors]);

  const hasChanges = useMemo(() => {
    return editState.question !== suggestion.suggestedQuestion || editState.answer !== suggestion.suggestedAnswer;
  }, [editState.question, editState.answer, suggestion]);

  useEffect(() => {
    setEditState((prev) => ({ ...prev, hasChanges }));
  }, [hasChanges]);

  const handleQuestionChange = useCallback((value: string) => {
    setEditState((prev) => ({ ...prev, question: value }));
    setError(null);
  }, []);

  const handleAnswerChange = useCallback((value: string) => {
    setEditState((prev) => ({ ...prev, answer: value }));
    setError(null);
  }, []);

  const handleStartEditing = useCallback(() => {
    setEditState((prev) => ({ ...prev, isEditing: true }));
    setError(null);
  }, []);

  const handleCancelEditing = useCallback(() => {
    setEditState((prev) => ({
      ...prev,
      question: suggestion.suggestedQuestion,
      answer: suggestion.suggestedAnswer,
      isEditing: false,
      hasChanges: false,
    }));
    setValidationErrors({});
    setError(null);
  }, [suggestion]);

  const handleSaveChanges = useCallback(() => {
    if (validation.isValid) {
      setEditState((prev) => ({ ...prev, isEditing: false }));
      suggestion.suggestedQuestion = editState.question;
      suggestion.suggestedAnswer = editState.answer;
      setError(null);
    }
  }, [validation.isValid, editState.question, editState.answer, suggestion]);

  const handleAccept = useCallback(async () => {
    if (!validation.isValid) {
      setError("Popraw błędy walidacji przed zapisaniem");
      return;
    }

    setIsAccepting(true);
    setError(null);

    try {
      const finalSuggestion: AiFlashcardSuggestionItem = {
        ...suggestion,
        suggestedQuestion: editState.question.trim(),
        suggestedAnswer: editState.answer.trim(),
      };

      await onAccept(finalSuggestion);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd";
      setError(errorMessage);
    } finally {
      setIsAccepting(false);
    }
  }, [validation.isValid, suggestion, editState.question, editState.answer, onAccept]);

  const handleReject = useCallback(() => {
    onReject(suggestion);
  }, [onReject, suggestion]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (editState.isEditing) {
          handleSaveChanges();
        } else {
          handleAccept();
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        if (editState.isEditing) {
          handleCancelEditing();
        }
      }
    },
    [editState.isEditing, handleSaveChanges, handleAccept, handleCancelEditing]
  );

  const getStatusBadge = () => {
    if (isAccepting)
      return (
        <Badge variant="outline" className="text-blue-600">
          🔄 Zapisywanie...
        </Badge>
      );
    if (editState.isEditing)
      return (
        <Badge variant="outline" className="text-amber-600">
          ✏️ Edycja
        </Badge>
      );
    if (editState.hasChanges)
      return (
        <Badge variant="outline" className="text-blue-600">
          📝 Zmodyfikowano
        </Badge>
      );
    return null;
  };

  const getPreviewText = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <Card
      className={`border-l-4 transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50 ${
        editState.isEditing
          ? "border-l-amber-500 bg-amber-50/30"
          : editState.hasChanges
            ? "border-l-blue-500 bg-blue-50/30"
            : "border-l-green-500"
      }`}
      role="article"
      aria-labelledby={`flashcard-${index}-title`}
      aria-describedby={`flashcard-${index}-description`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span id={`flashcard-${index}-title`} className="text-sm font-medium text-gray-500">
                🤖 Fiszka #{index}
              </span>
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {suggestion.aiModelUsed}
              </Badge>
              {!editState.isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartEditing}
                  className="text-xs h-6 px-2"
                  disabled={isAccepting}
                >
                  ✏️ Edytuj
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor={`question-${index}`} className="text-sm font-medium text-gray-700 mb-2 block">
                ❓ Pytanie
              </label>
              {editState.isEditing ? (
                <div className="space-y-2">
                  <Input
                    id={`question-${index}`}
                    value={editState.question}
                    onChange={(e) => handleQuestionChange(e.target.value)}
                    placeholder="Wprowadź pytanie..."
                    className={validationErrors.question ? "border-red-500" : ""}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{validation.questionLength} znaków</span>
                    {validationErrors.question && <span className="text-red-500">{validationErrors.question}</span>}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-sm" id={`flashcard-${index}-description`}>
                    {editState.hasChanges
                      ? editState.question
                      : editState.question.length > 100
                        ? getPreviewText(editState.question)
                        : editState.question}
                  </p>
                  {editState.question.length > 100 && !editState.hasChanges && (
                    <button onClick={handleStartEditing} className="text-xs text-blue-600 hover:text-blue-800 mt-1">
                      Zobacz pełne pytanie...
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor={`answer-${index}`} className="text-sm font-medium text-gray-700 mb-2 block">
                ✅ Odpowiedź
              </label>
              {editState.isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    id={`answer-${index}`}
                    value={editState.answer}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Wprowadź odpowiedź..."
                    className={`min-h-[80px] ${validationErrors.answer ? "border-red-500" : ""}`}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{validation.answerLength} znaków</span>
                    {validationErrors.answer && <span className="text-red-500">{validationErrors.answer}</span>}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-sm whitespace-pre-wrap">
                    {editState.hasChanges
                      ? editState.answer
                      : editState.answer.length > 100
                        ? getPreviewText(editState.answer)
                        : editState.answer}
                  </p>
                  {editState.answer.length > 100 && !editState.hasChanges && (
                    <button onClick={handleStartEditing} className="text-xs text-blue-600 hover:text-blue-800 mt-1">
                      Zobacz pełną odpowiedź...
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {editState.isEditing ? (
              <>
                <Button
                  onClick={handleSaveChanges}
                  disabled={!validation.isValid}
                  className="flex-1 sm:flex-none"
                  size="sm"
                >
                  💾 Zapisz zmiany
                </Button>
                <Button variant="outline" onClick={handleCancelEditing} className="flex-1 sm:flex-none" size="sm">
                  ❌ Anuluj
                </Button>
                <div className="text-xs text-gray-500 self-center mt-1 sm:mt-0">
                  💡 <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Enter</kbd> zapisuje,{" "}
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Escape</kbd> anuluje
                </div>
              </>
            ) : (
              <>
                <Button
                  onClick={handleAccept}
                  disabled={isAccepting || !validation.isValid}
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  {isAccepting ? (
                    <span className="flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      Zapisuję...
                    </span>
                  ) : (
                    "✅ Zapisz fiszkę"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={isAccepting}
                  className="flex-1 sm:flex-none text-red-700 hover:text-red-800 border-red-200 hover:border-red-300"
                  size="sm"
                >
                  🗑️ Odrzuć
                </Button>
                <div className="text-xs text-gray-500 self-center mt-1 sm:mt-0">
                  💡 <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Enter</kbd> zapisuje fiszkę
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
