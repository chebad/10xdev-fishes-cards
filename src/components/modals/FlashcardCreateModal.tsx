import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CreateFlashcardCommand } from "@/types";

interface FlashcardCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFlashcardCommand) => Promise<void>;
  isSubmitting: boolean;
}

export default function FlashcardCreateModal({ isOpen, onClose, onSubmit, isSubmitting }: FlashcardCreateModalProps) {
  const [formData, setFormData] = useState<CreateFlashcardCommand>({
    question: "",
    answer: "",
    isAiGenerated: false,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.question.trim()) {
      errors.question = "Pytanie jest wymagane";
    } else if (formData.question.trim().length < 3) {
      errors.question = "Pytanie musi mieć co najmniej 3 znaki";
    } else if (formData.question.trim().length > 1000) {
      errors.question = "Pytanie nie może przekraczać 1000 znaków";
    }

    if (!formData.answer.trim()) {
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

      if (!validateForm()) {
        return;
      }

      setSubmitError(null);

      try {
        await onSubmit({
          ...formData,
          question: formData.question.trim(),
          answer: formData.answer.trim(),
        });

        // Reset formularza po udanym wysłaniu
        setFormData({
          question: "",
          answer: "",
          isAiGenerated: false,
        });
        onClose();
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd");
      }
    },
    [formData, validateForm, onSubmit, onClose]
  );

  const handleInputChange = useCallback(
    (field: keyof CreateFlashcardCommand, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Wyczyść błąd walidacji dla tego pola
      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [field]: _, ...newErrors } = prev;
          return newErrors;
        });
      }
    },
    [validationErrors]
  );

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setFormData({
        question: "",
        answer: "",
        isAiGenerated: false,
      });
      setValidationErrors({});
      setSubmitError(null);
      onClose();
    }
  }, [isSubmitting, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Dodaj nową fiszkę</DialogTitle>
          <DialogDescription>Utwórz nową fiszkę wprowadzając pytanie i odpowiedź.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Pytanie */}
          <div className="space-y-2">
            <label htmlFor="create-question" className="text-sm font-medium text-gray-700">
              Pytanie <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="create-question"
              placeholder="Wprowadź pytanie dla fiszki..."
              value={formData.question}
              onChange={(e) => handleInputChange("question", e.target.value)}
              className={`min-h-[100px] ${validationErrors.question ? "border-red-500" : ""}`}
              disabled={isSubmitting}
            />
            <div className="flex justify-between text-xs">
              <span className={validationErrors.question ? "text-red-500" : "text-gray-500"}>
                {validationErrors.question || `${formData.question.length}/1000 znaków`}
              </span>
            </div>
          </div>

          {/* Odpowiedź */}
          <div className="space-y-2">
            <label htmlFor="create-answer" className="text-sm font-medium text-gray-700">
              Odpowiedź <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="create-answer"
              placeholder="Wprowadź odpowiedź na pytanie..."
              value={formData.answer}
              onChange={(e) => handleInputChange("answer", e.target.value)}
              className={`min-h-[120px] ${validationErrors.answer ? "border-red-500" : ""}`}
              disabled={isSubmitting}
            />
            <div className="flex justify-between text-xs">
              <span className={validationErrors.answer ? "text-red-500" : "text-gray-500"}>
                {validationErrors.answer || `${formData.answer.length}/2000 znaków`}
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
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || Object.keys(validationErrors).length > 0}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Zapisywanie..." : "Zapisz fiszkę"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
