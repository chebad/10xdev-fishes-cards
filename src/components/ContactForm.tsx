import React from "react";
import { Button } from "@/components/ui/button";
import { ContactFormField } from "./ContactFormField";
import { useContactForm } from "../lib/hooks/useContactForm";
import type { ContactFormProps } from "../types";

/**
 * Główny formularz kontaktowy z pełną logiką walidacji i obsługą API
 */
export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit, initialData = {} }) => {
  const { formData, formState, isFormValid, hasErrors, handleFieldChange, handleFieldBlur, submitForm, resetForm } =
    useContactForm();

  // Ustaw dane początkowe jeśli zostały podane
  React.useEffect(() => {
    if (initialData.email || initialData.subject || initialData.messageBody) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (value) {
          handleFieldChange(key as keyof typeof formData, value);
        }
      });
    }
  }, [initialData, handleFieldChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await submitForm();
    if (success && onSubmit) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Komunikat błędu ogólnego */}
      {formState.errors?.general && (
        <div role="alert" aria-live="polite" className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="text-sm text-destructive font-medium">{formState.errors.general}</div>
        </div>
      )}

      {/* Pole Email */}
      <ContactFormField
        name="email"
        label="Adres email"
        type="email"
        value={formData.email}
        onChange={(value) => handleFieldChange("email", value)}
        onBlur={() => handleFieldBlur("email")}
        error={formState.errors?.email}
        required
        placeholder="twoj@email.com"
      />

      {/* Pole Subject */}
      <ContactFormField
        name="subject"
        label="Temat"
        type="text"
        value={formData.subject}
        onChange={(value) => handleFieldChange("subject", value)}
        onBlur={() => handleFieldBlur("subject")}
        error={formState.errors?.subject}
        required={false}
        placeholder="Krótko opisz temat swojej wiadomości"
        maxLength={200}
      />

      {/* Pole Message */}
      <ContactFormField
        name="messageBody"
        label="Wiadomość"
        type="textarea"
        value={formData.messageBody}
        onChange={(value) => handleFieldChange("messageBody", value)}
        onBlur={() => handleFieldBlur("messageBody")}
        error={formState.errors?.messageBody}
        required
        placeholder="Opisz szczegółowo swoje pytanie, problem lub sugestię..."
        maxLength={2000}
      />

      {/* Przyciski */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button type="submit" disabled={formState.isSubmitting || !isFormValid} className="flex-1 sm:flex-none">
          {formState.isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Wysyłanie...
            </>
          ) : (
            "Wyślij wiadomość"
          )}
        </Button>

        {/* Przycisk reset - tylko gdy formularz ma dane */}
        {(formData.email || formData.subject || formData.messageBody) && !formState.isSubmitting && (
          <Button type="button" variant="outline" onClick={resetForm} className="flex-1 sm:flex-none">
            Wyczyść formularz
          </Button>
        )}
      </div>

      {/* Dodatkowe informacje o wymaganych polach */}
      {formState.submitAttempted && hasErrors && (
        <div role="alert" aria-live="polite" className="text-sm text-muted-foreground text-center">
          Sprawdź poprawność wypełnienia wszystkich wymaganych pól oznaczonych gwiazdką (*).
        </div>
      )}
    </form>
  );
};
