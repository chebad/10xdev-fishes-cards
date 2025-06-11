# Plan implementacji widoku Formularz Kontaktowy

## 1. Przegląd

Widok Formularz Kontaktowy umożliwia użytkownikom (zalogowanym i niezalogowanym) wysłanie wiadomości do administratorów aplikacji. Widok zawiera prosty formularz z polami na adres email, opcjonalny temat i treść wiadomości. Implementacja zapewnia walidację po stronie klienta, informację zwrotną po wysłaniu oraz odpowiednią obsługę błędów.

## 2. Routing widoku

**Ścieżka:** `/contact`
**Plik:** `src/pages/contact.astro`

Widok będzie dostępny dla wszystkich użytkowników (zalogowanych i niezalogowanych) pod ścieżką `/contact`.

## 3. Struktura komponentów

```
ContactPage (Astro)
├── Header (dynamiczny - zalogowany/niezalogowany)
├── ContactFormContainer (React)
│   ├── ContactForm (React)
│   │   ├── FormField (email) - Shadcn/ui
│   │   ├── FormField (subject) - Shadcn/ui
│   │   ├── FormField (messageBody) - Shadcn/ui
│   │   ├── SubmitButton - Shadcn/ui
│   │   └── FormValidationMessages
│   └── SuccessMessage (warunkowo)
└── Toast Provider (Shadcn/ui)
```

## 4. Szczegóły komponentów

### ContactPage (Astro)

- **Opis:** Główny komponent strony kontaktowej, renderuje layout i osadza interaktywne komponenty React
- **Główne elementy:** Layout z Header i ContactFormContainer
- **Obsługiwane interakcje:** Brak (statyczny wrapper)
- **Obsługiwana walidacja:** Brak
- **Typy:** Brak specyficznych
- **Propsy:** Brak

### ContactFormContainer (React)

- **Opis:** Kontener React zarządzający stanem całego formularza i integracją z API
- **Główne elementy:** ContactForm, SuccessMessage, Toast management
- **Obsługiwane interakcje:** Submit formularza, reset po sukcesie
- **Obsługiwana walidacja:** Koordynacja walidacji formularza
- **Typy:** ContactFormState, ContactFormData
- **Propsy:** Brak (top-level container)

### ContactForm (React)

- **Opis:** Główny formularz kontaktowy z polami input i logiką walidacji
- **Główne elementy:** Form (Shadcn), FormField komponenty, SubmitButton
- **Obsługiwane interakcje:** onChange dla pól, onSubmit, walidacja w czasie rzeczywistym
- **Obsługiwana walidacja:**
  - Email: wymagane, poprawny format email
  - Subject: opcjonalne, max 200 znaków
  - MessageBody: wymagane, min 10 znaków, max 2000 znaków
- **Typy:** ContactFormData, ContactFormErrors, ContactFormState
- **Propsy:** onSubmit, isSubmitting, errors, onFieldChange

### FormField Components (email, subject, message)

- **Opis:** Wielokrotnego użytku komponenty pól formularza z etykietami i obsługą błędów
- **Główne elementy:** Label, Input/Textarea (Shadcn), FormMessage dla błędów
- **Obsługiwane interakcje:** onChange, onBlur dla walidacji
- **Obsługiwana walidacja:** Per-field validation zgodnie z regułami API
- **Typy:** ContactFormFieldProps, ValidationState
- **Propsy:** name, label, value, onChange, onBlur, error, required, type

### SubmitButton (React)

- **Opis:** Przycisk wysyłania formularza ze wskaźnikiem ładowania
- **Główne elementy:** Button (Shadcn) z Loader icon
- **Obsługiwane interakcje:** onClick (submit)
- **Obsługiwana walidacja:** Disabled gdy isSubmitting lub formularz niepoprawny
- **Typy:** ContactFormState
- **Propsy:** isSubmitting, isValid, onClick

## 5. Typy

### Nowe typy ViewModelu (do dodania w types.ts):

```typescript
/**
 * Stan formularza kontaktowego
 */
export interface ContactFormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  errors: ContactFormErrors | null;
  submitAttempted: boolean;
}

/**
 * Dane formularza kontaktowego dla komponentów React
 */
export interface ContactFormData {
  email: string;
  subject: string;
  messageBody: string;
}

/**
 * Błędy walidacji formularza kontaktowego
 */
export interface ContactFormErrors {
  email?: string;
  subject?: string;
  messageBody?: string;
  general?: string;
}

/**
 * Props dla komponentu ContactForm
 */
export interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  initialData?: Partial<ContactFormData>;
}

/**
 * Props dla pól formularza kontaktowego
 */
export interface ContactFormFieldProps {
  name: keyof ContactFormData;
  label: string;
  type: "email" | "text" | "textarea";
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}

/**
 * Konfiguracja walidacji pola
 */
export interface FieldValidationConfig {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => string | null;
}
```

### Istniejące typy (już zdefiniowane):

- `CreateContactSubmissionCommand` - do API request
- `ContactSubmissionDto` - odpowiedź z API

## 6. Zarządzanie stanem

### Custom Hook: useContactForm

Hook zarządzający całym stanem formularza kontaktowego:

```typescript
const useContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    email: "",
    subject: "",
    messageBody: "",
  });

  const [formState, setFormState] = useState<ContactFormState>({
    isSubmitting: false,
    isSuccess: false,
    errors: null,
    submitAttempted: false,
  });

  // Funkcje: handleFieldChange, validateField, submitForm, resetForm
  // Zwraca: formData, formState, handlers
};
```

### Zarządzanie stanem lokalnym:

- **formData** - aktualne wartości pól formularza
- **formState** - stan UI (submitting, success, errors)
- **Walidacja** - real-time validation podczas typing i onBlur

## 7. Integracja API

### Endpoint: POST /api/contact-submissions

**Request Type:** `CreateContactSubmissionCommand`

```typescript
{
  emailAddress: string;    // wymagane, format email
  subject?: string;        // opcjonalne, max 200 znaków
  messageBody: string;     // wymagane, min 10, max 2000 znaków
}
```

**Response Type:** `ContactSubmissionDto`

```typescript
{
  id: string;
  userId: string | null; // null dla niezalogowanych
  emailAddress: string;
  subject: string | null;
  messageBody: string;
  submittedAt: string;
}
```

**Error Handling:**

- 400 - błędy walidacji (zwracane jako ValidationErrors)
- 429 - rate limiting
- 500 - błędy serwera

## 8. Interakcje użytkownika

### Sekwencja interakcji:

1. **Ładowanie strony:**

   - Wyświetlenie pustego formularza
   - Focus na pierwszym polu (email)

2. **Wypełnianie formularza:**

   - Real-time walidacja podczas wpisywania
   - Walidacja onBlur dla każdego pola
   - Wyświetlanie błędów pod polami

3. **Próba wysłania:**

   - Walidacja całego formularza
   - Wyświetlenie wszystkich błędów jeśli istnieją
   - Disable przycisku podczas wysyłania

4. **Po wysłaniu (sukces):**

   - Wyświetlenie toast sukcesu
   - Reset formularza
   - Opcjonalne przekierowanie na stronę potwierdzenia

5. **Po wysłaniu (błąd):**
   - Wyświetlenie błędów w formularzu
   - Toast z komunikatem o błędzie
   - Przywrócenie stanu formularza

## 9. Warunki i walidacja

### Walidacja po stronie klienta:

**Email field:**

- Wymagane: tak
- Format: valid email regex
- Błąd: "Podaj poprawny adres email"

**Subject field:**

- Wymagane: nie
- Max długość: 200 znaków
- Błąd: "Temat może mieć maksymalnie 200 znaków"

**Message field:**

- Wymagane: tak
- Min długość: 10 znaków
- Max długość: 2000 znaków
- Błędy: "Wiadomość musi mieć co najmniej 10 znaków" / "Wiadomość może mieć maksymalnie 2000 znaków"

### Walidacja całego formularza:

- Przycisk submit disabled gdy: isSubmitting === true || hasErrors === true
- Wszystkie wymagane pola muszą być wypełnione
- Wszystkie pola muszą przejść walidację indywidualną

## 10. Obsługa błędów

### Typy błędów i ich obsługa:

1. **Błędy walidacji (400):**

   - Wyświetlenie pod odpowiednimi polami
   - Focus na pierwszym błędnym polu
   - Toast z ogólnym komunikatem

2. **Rate limiting (429):**

   - Toast: "Zbyt wiele prób. Spróbuj ponownie za chwilę"
   - Czasowe zablokowanie formularza

3. **Błędy serwera (500):**

   - Toast: "Wystąpił błąd serwera. Spróbuj ponownie później"
   - Możliwość ponownego wysłania

4. **Błędy sieci:**

   - Toast: "Brak połączenia. Sprawdź połączenie internetowe"
   - Retry mechanism

5. **Timeout:**
   - Toast: "Request timed out. Spróbuj ponownie"
   - Automatic retry po 3 sekundach

### Fallback behaviors:

- Graceful degradation przy brakach JavaScript
- Podstawowa walidacja HTML5 jako backup
- Clear error states przy ponownych próbach

## 11. Kroki implementacji

1. **Przygotowanie infrastruktury:**

   - Dodanie nowych typów do `src/types.ts`
   - Utworzenie `src/pages/contact.astro`

2. **Implementacja custom hook:**

   - Utworzenie `src/lib/hooks/useContactForm.ts`
   - Implementacja logiki walidacji i state management

3. **Utworzenie komponentów podstawowych:**

   - `src/components/ContactFormField.tsx` (reusable field component)
   - `src/components/ContactForm.tsx` (główny formularz)

4. **Implementacja logiki API:**

   - Funkcje do komunikacji z `/api/contact-submissions`
   - Error handling i response processing

5. **Integracja z Toast system:**

   - Setup Shadcn/ui Toast provider
   - Implementacja notification logic

6. **Utworzenie głównego kontenera:**

   - `src/components/ContactFormContainer.tsx`
   - Integracja wszystkich podkomponentów

7. **Implementacja strony Astro:**

   - Layout i styling
   - Osadzenie React container

8. **Testowanie i finalizacja:**

   - Walidacja wszystkich scenariuszy użytkownika
   - Testowanie dostępności
   - Performance optimization

9. **Dokumentacja:**
   - Aktualizacja dokumentacji komponentów
   - Przewodnik użytkownika dla formularza
