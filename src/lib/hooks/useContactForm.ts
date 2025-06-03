import { useState, useCallback } from 'react';
import type { 
  ContactFormData, 
  ContactFormState, 
  ContactFormErrors,
  CreateContactSubmissionCommand,
  ContactSubmissionDto,
  FieldValidationConfig
} from '../../types';

/**
 * Custom hook do zarządzania formularzem kontaktowym
 * Obsługuje walidację, stan formularza i integrację z API
 */
export const useContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    email: '',
    subject: '',
    messageBody: ''
  });

  const [formState, setFormState] = useState<ContactFormState>({
    isSubmitting: false,
    isSuccess: false,
    errors: null,
    submitAttempted: false
  });

  // Konfiguracja walidacji dla każdego pola
  const validationConfig: Record<keyof ContactFormData, FieldValidationConfig> = {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    subject: {
      required: false,
      maxLength: 200
    },
    messageBody: {
      required: true,
      minLength: 10,
      maxLength: 2000
    }
  };

  /**
   * Waliduje pojedyncze pole formularza
   */
  const validateField = useCallback((name: keyof ContactFormData, value: string): string | null => {
    const config = validationConfig[name];
    
    // Sprawdź czy pole jest wymagane
    if (config.required && !value.trim()) {
      switch (name) {
        case 'email':
          return 'Podaj adres email';
        case 'messageBody':
          return 'Wiadomość jest wymagana';
        default:
          return 'To pole jest wymagane';
      }
    }

    // Sprawdź pattern (email)
    if (config.pattern && value && !config.pattern.test(value)) {
      if (name === 'email') {
        return 'Podaj poprawny adres email';
      }
    }

    // Sprawdź minimalną długość
    if (config.minLength && value.length < config.minLength) {
      return `Wiadomość musi mieć co najmniej ${config.minLength} znaków`;
    }

    // Sprawdź maksymalną długość
    if (config.maxLength && value.length > config.maxLength) {
      switch (name) {
        case 'subject':
          return 'Temat może mieć maksymalnie 200 znaków';
        case 'messageBody':
          return 'Wiadomość może mieć maksymalnie 2000 znaków';
        default:
          return `Pole może mieć maksymalnie ${config.maxLength} znaków`;
      }
    }

    // Walidacja custom
    if (config.customValidator) {
      return config.customValidator(value);
    }

    return null;
  }, []);

  /**
   * Waliduje cały formularz
   */
  const validateForm = useCallback((): ContactFormErrors | null => {
    const errors: ContactFormErrors = {};
    let hasErrors = false;

    // Waliduj każde pole
    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof ContactFormData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        errors[fieldName] = error;
        hasErrors = true;
      }
    });

    return hasErrors ? errors : null;
  }, [formData, validateField]);

  /**
   * Obsługuje zmianę wartości pola
   */
  const handleFieldChange = useCallback((name: keyof ContactFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Usuń błąd dla tego pola jeśli istnieje
    if (formState.errors?.[name]) {
      setFormState(prev => ({
        ...prev,
        errors: prev.errors ? {
          ...prev.errors,
          [name]: undefined
        } : null
      }));
    }
  }, [formState.errors]);

  /**
   * Obsługuje blur na polu (walidacja real-time)
   */
  const handleFieldBlur = useCallback((name: keyof ContactFormData) => {
    const error = validateField(name, formData[name]);
    
    if (error) {
      setFormState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [name]: error
        }
      }));
    }
  }, [formData, validateField]);

  /**
   * Wysyła formularz do API
   */
  const submitForm = useCallback(async (): Promise<boolean> => {
    setFormState(prev => ({
      ...prev,
      submitAttempted: true,
      isSubmitting: true,
      errors: null
    }));

    // Waliduj formularz
    const validationErrors = validateForm();
    if (validationErrors) {
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: validationErrors
      }));
      return false;
    }

    try {
      // Przygotuj dane do wysłania
      const submitData: CreateContactSubmissionCommand = {
        emailAddress: formData.email.trim(),
        subject: formData.subject.trim() || undefined,
        messageBody: formData.messageBody.trim()
      };

      // Wywołaj API
      const response = await fetch('/api/contact-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 400 && errorData.details) {
          // Błędy walidacji z serwera
          const serverErrors: ContactFormErrors = {};
          
          if (errorData.details.emailAddress) {
            serverErrors.email = errorData.details.emailAddress[0];
          }
          if (errorData.details.subject) {
            serverErrors.subject = errorData.details.subject[0];
          }
          if (errorData.details.messageBody) {
            serverErrors.messageBody = errorData.details.messageBody[0];
          }

          setFormState(prev => ({
            ...prev,
            isSubmitting: false,
            errors: serverErrors
          }));
          return false;
        }

        // Inne błędy
        const errorMessage = response.status === 429 
          ? 'Zbyt wiele prób. Spróbuj ponownie za chwilę'
          : response.status >= 500
          ? 'Wystąpił błąd serwera. Spróbuj ponownie później'
          : 'Wystąpił błąd podczas wysyłania wiadomości';

        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          errors: { general: errorMessage }
        }));
        return false;
      }

      // Sukces
      const result: ContactSubmissionDto = await response.json();
      
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        isSuccess: true,
        errors: null
      }));

      return true;

    } catch (error) {
      // Błędy sieci
      const errorMessage = error instanceof Error && error.name === 'AbortError'
        ? 'Request timed out. Spróbuj ponownie'
        : 'Brak połączenia. Sprawdź połączenie internetowe';

      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: { general: errorMessage }
      }));
      return false;
    }
  }, [formData, validateForm]);

  /**
   * Resetuje formularz do stanu początkowego
   */
  const resetForm = useCallback(() => {
    setFormData({
      email: '',
      subject: '',
      messageBody: ''
    });
    
    setFormState({
      isSubmitting: false,
      isSuccess: false,
      errors: null,
      submitAttempted: false
    });
  }, []);

  /**
   * Sprawdza czy formularz ma błędy
   */
  const hasErrors = formState.errors && Object.values(formState.errors).some(error => error);
  
  /**
   * Sprawdza czy formularz jest wypełniony poprawnie
   */
  const isFormValid = !hasErrors && formData.email.trim() && formData.messageBody.trim();

  return {
    // Stan
    formData,
    formState,
    isFormValid: Boolean(isFormValid),
    hasErrors: Boolean(hasErrors),
    
    // Handlery
    handleFieldChange,
    handleFieldBlur,
    submitForm,
    resetForm,
    validateField
  };
}; 