import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { UpdateFlashcardCommand, FlashcardListItemDto } from "@/types";

interface FlashcardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateFlashcardCommand) => Promise<void>;
  isSubmitting: boolean;
  flashcard: FlashcardListItemDto;
}

export default function FlashcardEditModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  flashcard,
}: FlashcardEditModalProps) {
  const [formData, setFormData] = useState<UpdateFlashcardCommand>({
    question: flashcard.question,
    answer: flashcard.answer,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Zaktualizuj dane formularza gdy zmieni się fiszka
  useEffect(() => {
    setFormData({
      question: flashcard.question,
      answer: flashcard.answer,
    });
    setHasChanges(false);
    setValidationErrors({});
    setSubmitError(null);
  }, [flashcard]);

  // Sprawdź czy są zmiany
  useEffect(() => {
    const questionChanged = formData.question?.trim() !== flashcard.question;
    const answerChanged = formData.answer?.trim() !== flashcard.answer;
    setHasChanges(questionChanged || answerChanged);
  }, [formData, flashcard]);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.question?.trim()) {
      errors.question = "Pytanie jest wymagane";
    } else if (formData.question.trim().length < 3) {
      errors.question = "Pytanie musi mieć co najmniej 3 znaki";
    } else if (formData.question.trim().length > 1000) {
      errors.question = "Pytanie nie może przekraczać 1000 znaków";
    }

    if (!formData.answer?.trim()) {
      errors.answer = "Odpowiedź jest wymagana";
    } else if (formData.answer.trim().length < 3) {
      errors.answer = "Odpowiedź musi mieć co najmniej 3 znaki";
    } else if (formData.answer.trim().length > 2000) {
      errors.answer = "Odpowiedź nie może przekraczać 2000 znaków";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm() || !hasChanges) {
        return;
      }

      setSubmitError(null);

      try {
        const updateData: UpdateFlashcardCommand = {};

        if (formData.question?.trim() !== flashcard.question) {
          updateData.question = formData.question?.trim();
        }

        if (formData.answer?.trim() !== flashcard.answer) {
          updateData.answer = formData.answer?.trim();
        }

        await onSubmit(flashcard.id, updateData);
        onClose();
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd");
      }
    },
    [formData, flashcard, validateForm, hasChanges, onSubmit, onClose]
  );

  const handleInputChange = useCallback(
    (field: keyof UpdateFlashcardCommand, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Wyczyść błąd walidacji dla tego pola
      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [field]: _, ...rest } = prev;
          return rest;
        });
      }
    },
    [validationErrors]
  );

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      // Reset do oryginalnych wartości
      setFormData({
        question: flashcard.question,
        answer: flashcard.answer,
      });
      setValidationErrors({});
      setSubmitError(null);
      setHasChanges(false);
      onClose();
    }
  }, [isSubmitting, flashcard, onClose]);

  const handleReset = useCallback(() => {
    setFormData({
      question: flashcard.question,
      answer: flashcard.answer,
    });
    setValidationErrors({});
    setSubmitError(null);
  }, [flashcard]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
          <DialogDescription>Zmień pytanie lub odpowiedź w fiszce.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Pytanie */}
          <div className="space-y-2">
            <label htmlFor="edit-question" className="text-sm font-medium text-gray-700">
              Pytanie <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="edit-question"
              placeholder="Wprowadź pytanie dla fiszki..."
              value={formData.question || ""}
              onChange={(e) => handleInputChange("question", e.target.value)}
              className={`min-h-[100px] ${validationErrors.question ? "border-red-500" : ""}`}
              disabled={isSubmitting}
            />
            <div className="flex justify-between text-xs">
              <span className={validationErrors.question ? "text-red-500" : "text-gray-500"}>
                {validationErrors.question || `${(formData.question || "").length}/1000 znaków`}
              </span>
            </div>
          </div>

          {/* Odpowiedź */}
          <div className="space-y-2">
            <label htmlFor="edit-answer" className="text-sm font-medium text-gray-700">
              Odpowiedź <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="edit-answer"
              placeholder="Wprowadź odpowiedź na pytanie..."
              value={formData.answer || ""}
              onChange={(e) => handleInputChange("answer", e.target.value)}
              className={`min-h-[120px] ${validationErrors.answer ? "border-red-500" : ""}`}
              disabled={isSubmitting}
            />
            <div className="flex justify-between text-xs">
              <span className={validationErrors.answer ? "text-red-500" : "text-gray-500"}>
                {validationErrors.answer || `${(formData.answer || "").length}/2000 znaków`}
              </span>
            </div>
          </div>

          {/* Informacja o typie fiszki */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="font-medium">Typ fiszki:</span>
              <span className={flashcard.isAiGenerated ? "text-purple-600" : "text-blue-600"}>
                {flashcard.isAiGenerated ? "🤖 Wygenerowana przez AI" : "✏️ Utworzona ręcznie"}
              </span>
            </div>
          </div>

          {/* Błąd wysyłania */}
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Przyciski */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting || !hasChanges}
              className="text-gray-600"
            >
              Resetuj zmiany
            </Button>

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Anuluj
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !hasChanges || Object.keys(validationErrors).length > 0}
                className="min-w-[120px]"
              >
                {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
