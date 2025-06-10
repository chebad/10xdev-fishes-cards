# Plan implementacji widoku Generator Fiszek AI

## 1. Przegląd

Widok Generator Fiszek AI (`/app` w zakładce "Generator AI") umożliwia użytkownikom wprowadzenie tekstu źródłowego o długości 1000-10000 znaków i wygenerowanie na jego podstawie sugestii fiszek przy użyciu AI. System prezentuje wygenerowane sugestie jako edytowalne karty, które użytkownik może zaakceptować (zapisać jako fiszkę) lub odrzucić. Widok stanowi implementację User Story US-002 i zawiera interaktywny formularz z walidacją, mechanizm ładowania oraz intuicyjny interfejs zarządzania sugestiami.

## 2. Routing widoku

- **Ścieżka:** `/app` (jako zakładka "Generator AI" w komponencie `DashboardTabs`)
- **Ochrona:** Dostępna tylko dla zalogowanych użytkowników
- **Implementacja:** Renderowana w ramach `TabsContent` z wartością `"ai-generator"`
- **Kontekst:** Część większego widoku dashboard z systemem zakładek

## 3. Struktura komponentów

```text
AiGeneratorTab (src/components/dashboard/AiGeneratorTab.tsx)
├── AiGeneratorForm (src/components/ai/AiGeneratorForm.tsx)
│   ├── Card (Shadcn/ui)
│   │   ├── CardHeader
│   │   └── CardContent
│   │       ├── Form
│   │       │   ├── Textarea (Shadcn/ui)
│   │       │   ├── CharacterCounter (custom)
│   │       │   └── Button "Generuj" (Shadcn/ui)
│   │       ├── Alert (Shadcn/ui) - błędy walidacji
│   │       └── Instructions (custom) - wskazówki
└── AiSuggestionsList (src/components/ai/AiSuggestionsList.tsx)
    ├── SuggestionsHeader (custom) - liczba sugestii
    └── AiSuggestionCard[] (src/components/ai/AiSuggestionItem.tsx)
        ├── Card (Shadcn/ui)
        ├── EditableContent (custom)
        │   ├── Input/Textarea (Shadcn/ui) - edycja pytania/odpowiedzi
        │   └── ValidationIndicator (custom)
        └── ActionButtons (custom)
            ├── Button "Zapisz" (Shadcn/ui)
            └── Button "Odrzuć" (Shadcn/ui)
```

## 4. Szczegóły komponentów

### AiGeneratorTab

- **Opis komponentu:** Główny kontener zarządzający całym przepływem generowania AI. Łączy formularz wprowadzania tekstu z listą wygenerowanych sugestii.
- **Główne elementy:** `AiGeneratorForm`, `AiSuggestionsList` oraz logika koordynacji między nimi.
- **Obsługiwane interakcje:** Przekazywanie funkcji callbacków między komponentami potomnymi, zarządzanie notyfikacjami toast.
- **Obsługiwana walidacja:** Brak walidacji na poziomie kontenera.
- **Typy:** `AiGenerationState` z hooka `useAiGeneration`.
- **Propsy:** Brak zewnętrznych propsów - komponent autonomiczny.

### AiGeneratorForm

- **Opis komponentu:** Formularz do wprowadzania tekstu źródłowego z zaawansowaną walidacją w czasie rzeczywistym. Zawiera textarea, licznik znaków i przycisk generowania.
- **Główne elementy:** `Card` z `Textarea`, dynamiczny licznik znaków z kolorową indykacją, `Button` ze stanem loading, `Alert` dla błędów.
- **Obsługiwane interakcje:** `onChange` textarea z debouncing, `onSubmit` formularza, blokowanie/odblokowywanie przycisku w zależności od walidacji.
- **Obsługiwana walidacja:**
  - Minimalna długość: 1000 znaków (błąd: "Tekst musi mieć co najmniej 1000 znaków")
  - Maksymalna długość: 10000 znaków (błąd: "Tekst nie może przekraczać 10000 znaków")
  - Walidacja w czasie rzeczywistym z kolorowym wskaźnikiem stanu
- **Typy:** `AiGeneratorFormProps`, `GenerateAiFlashcardsCommand`.
- **Propsy:** `onGenerate: (command: GenerateAiFlashcardsCommand) => Promise<void>`, `isGenerating: boolean`, `error?: string`.

### AiSuggestionsList

- **Opis komponentu:** Kontener wyświetlający listę wygenerowanych sugestii z nagłówkiem informującym o liczbie dostępnych elementów.
- **Główne elementy:** Nagłówek z liczbą sugestii, mapa komponentów `AiSuggestionItem`, stan pustej listy.
- **Obsługiwane interakcje:** Przekazywanie funkcji akceptacji/odrzucenia do komponentów potomnych.
- **Obsługiwana walidacja:** Sprawdzenie czy lista nie jest pusta.
- **Typy:** `AiSuggestionsListProps`, `AiFlashcardSuggestionItem[]`.
- **Propsy:** `suggestions: AiFlashcardSuggestionItem[]`, `onAccept: (suggestion) => Promise<FlashcardDto | null>`, `onReject: (suggestion) => void`.

### AiSuggestionItem (AiSuggestionCard)

- **Opis komponentu:** Pojedyncza karta sugestii z edytowalnymi polami pytania i odpowiedzi oraz przyciskami akcji. Zarządza własnym stanem edycji.
- **Główne elementy:** `Card` z polami pytania/odpowiedzi, przyciskami "Zapisz"/"Odrzuć", wskaźnikami ładowania i stanu edycji.
- **Obsługiwane interakcje:**
  - Edycja treści pytania/odpowiedzi w miejscu
  - `onClick` "Zapisz" z wywołaniem API
  - `onClick` "Odrzuć" z lokalnym usunięciem
  - Przywracanie oryginalnych wartości przy anulowaniu
- **Obsługiwana walidacja:**
  - Pytanie: minimum 5 znaków
  - Odpowiedź: minimum 3 znaki
  - Sprawdzenie czy wprowadzono zmiany przed zapisem
- **Typy:** `AiSuggestionCardProps`, `AiFlashcardSuggestionItem`, wewnętrzny stan edycji.
- **Propsy:** `suggestion: AiFlashcardSuggestionItem`, `onAccept: (suggestion: AiFlashcardSuggestionItem) => Promise<FlashcardDto | null>`, `onReject: (suggestion: AiFlashcardSuggestionItem) => void`.

## 5. Typy

Widok wykorzystuje istniejące typy z `src/types.ts` oraz wymaga następujących dodatkowych typów:

```typescript
// Już dostępne w types.ts
export interface GenerateAiFlashcardsCommand {
  sourceText: string;
}

export interface AiFlashcardSuggestionItem {
  suggestedQuestion: string;
  suggestedAnswer: string;
  aiModelUsed: string;
}

export interface AiFlashcardSuggestionsDto {
  suggestions: AiFlashcardSuggestionItem[];
  sourceTextEcho: string;
}

export interface AiGenerationState {
  isGenerating: boolean;
  suggestions: AiFlashcardSuggestionItem[];
  sourceText: string;
  error?: string;
  lastGeneratedAt?: Date;
}

export interface AiGeneratorFormProps {
  onGenerate: (command: GenerateAiFlashcardsCommand) => Promise<void>;
  isGenerating: boolean;
  error?: string;
}

export interface AiSuggestionsListProps {
  suggestions: AiFlashcardSuggestionItem[];
  onAccept: (suggestion: AiFlashcardSuggestionItem) => Promise<FlashcardDto | null>;
  onReject: (suggestion: AiFlashcardSuggestionItem) => void;
}

// Nowe typy potrzebne dla implementacji
export interface AiSuggestionCardProps {
  suggestion: AiFlashcardSuggestionItem;
  onAccept: (suggestion: AiFlashcardSuggestionItem) => Promise<FlashcardDto | null>;
  onReject: (suggestion: AiFlashcardSuggestionItem) => void;
  isProcessing?: boolean;
}

export interface EditableSuggestionState {
  question: string;
  answer: string;
  isEditing: boolean;
  hasChanges: boolean;
  originalSuggestion: AiFlashcardSuggestionItem;
}

export interface CharacterCounterProps {
  current: number;
  min: number;
  max: number;
  showProgress?: boolean;
}

export interface ValidationState {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}
```

## 6. Zarządzanie stanem

Widok wykorzystuje niestandardowy hook `useAiGeneration` do zarządzania stanem. Hook jest już zaimplementowany i zawiera:

```typescript
// src/hooks/useAiGeneration.ts
const useAiGeneration = () => {
  // Stan główny
  const [state, setState] = useState<AiGenerationState>(initialState);

  // Funkcje API
  const generateSuggestions = async (command: GenerateAiFlashcardsCommand) => {...};
  const acceptSuggestion = async (suggestion: AiFlashcardSuggestionItem) => {...};
  const rejectSuggestion = (suggestion: AiFlashcardSuggestionItem) => {...};

  // Funkcje pomocnicze
  const clearSuggestions = () => {...};
  const resetState = () => {...};

  return { state, generateSuggestions, acceptSuggestion, rejectSuggestion, clearSuggestions, resetState };
};
```

Komponenty potomne zarządzają własnym lokalnym stanem dla:

- Edycji treści sugestii (`useState` w `AiSuggestionItem`)
- Walidacji formularza (`useState` w `AiGeneratorForm`)
- Stanów ładowania dla poszczególnych akcji

## 7. Integracja API

Widok integruje się z następującymi endpointami:

### POST /api/flashcards/generate-ai

- **Żądanie:** `GenerateAiFlashcardsCommand`
  ```typescript
  {
    sourceText: string; // 1000-10000 znaków
  }
  ```
- **Odpowiedź:** `AiFlashcardSuggestionsDto`
  ```typescript
  {
    suggestions: AiFlashcardSuggestionItem[];
    sourceTextEcho: string;
  }
  ```
- **Błędy:** 400 (walidacja), 401 (autoryzacja), 429 (rate limit), 500 (AI service)

### POST /api/flashcards

- **Żądanie:** `CreateFlashcardCommand`
  ```typescript
  {
    question: string;
    answer: string;
    isAiGenerated: true;
    sourceTextForAi: string;
  }
  ```
- **Odpowiedź:** `FlashcardDto`
- **Błędy:** 400 (walidacja), 401 (autoryzacja), 500 (database)

## 8. Interakcje użytkownika

### Wprowadzanie tekstu źródłowego

- **Akcja:** Użytkownik wpisuje tekst w textarea
- **Reakcja:** Licznik znaków aktualizuje się w czasie rzeczywistym z kolorową indykacją
- **Walidacja:** Komunikaty błędów pojawiają się pod textarea
- **Stan przycisku:** "Generuj" aktywuje się tylko przy ważnym tekście

### Generowanie sugestii

- **Akcja:** Kliknięcie przycisku "Generuj fiszki"
- **Reakcja:** Przycisk pokazuje stan ładowania, formularz zostaje zablokowany
- **Sukces:** Lista sugestii pojawia się pod formularzem
- **Błąd:** Alert z komunikatem błędu pod formularzem

### Edycja sugestii

- **Akcja:** Kliknięcie w pole pytania/odpowiedzi
- **Reakcja:** Pole staje się edytowalne, pojawiają się przyciski "Zapisz"/"Anuluj"
- **Walidacja:** Sprawdzanie minimum znaków w czasie rzeczywistym
- **Zapis:** Zaktualizowana treść zostaje przesłana do API

### Akceptacja sugestii

- **Akcja:** Kliknięcie przycisku "Zapisz fiszkę"
- **Reakcja:** Przycisk pokazuje loading, po sukcesie karta znika z listy
- **Notyfikacja:** Toast z potwierdzeniem zapisania
- **Błąd:** Toast z komunikatem błędu, karta pozostaje

### Odrzucenie sugestii

- **Akcja:** Kliknięcie przycisku "Odrzuć"
- **Reakcja:** Karta natychmiast znika z listy
- **Efekt:** Brak wywołania API, tylko lokalne usunięcie

## 9. Warunki i walidacja

### Walidacja tekstu źródłowego (AiGeneratorForm)

- **Minimum 1000 znaków:** Sprawdzane w `onChange` textarea
  - Komunikat: "Tekst musi mieć co najmniej 1000 znaków. Obecnie: {count}"
  - Kolor licznika: czerwony
  - Stan przycisku: zablokowany
- **Maximum 10000 znaków:** Sprawdzane w `onChange` textarea
  - Komunikat: "Tekst nie może przekraczać 10000 znaków. Obecnie: {count}"
  - Kolor licznika: czerwony
  - Stan przycisku: zablokowany
- **Zakres prawidłowy:** 1000-10000 znaków
  - Kolor licznika: zielony
  - Stan przycisku: aktywny

### Walidacja edycji sugestii (AiSuggestionItem)

- **Pytanie minimum 5 znaków:** Sprawdzane przed zapisem
- **Odpowiedź minimum 3 znaki:** Sprawdzane przed zapisem
- **Wykrywanie zmian:** Porównanie z oryginalną treścią
- **Komunikaty:** Tooltips lub podpowiedzi przy polach edycji

### Walidacja autoryzacji

- **Token JWT:** Automatycznie dołączany do requestów
- **Sesja Supabase:** Sprawdzana na poziomie strony `/app`
- **Błędy 401:** Automatyczne przekierowanie do `/login`

## 10. Obsługa błędów

### Błędy walidacji tekstu

- **Scenariusze:** Za krótki/długi tekst, puste pole
- **Obsługa:** Komunikaty w czasie rzeczywistym pod textarea
- **UI:** Alert component z czerwoną kolorystyką, ikona błędu

### Błędy API generowania

- **Scenariusze:** Błąd AI service, rate limiting, problem sieci
- **Obsługa:** Wyświetlenie błędu w `error` state z hooka
- **UI:** Alert pod formularzem z opcją ponowienia próby

### Błędy zapisywania fiszek

- **Scenariusze:** Błąd bazy danych, walidacja po stronie serwera
- **Obsługa:** Try-catch w `acceptSuggestion`, toast notification
- **UI:** Toast z czerwonym tłem, karta pozostaje na liście

### Błędy sieciowe

- **Scenariusze:** Brak połączenia, timeout
- **Obsługa:** Automatyczne retry dla GET, manual retry dla POST
- **UI:** Loading state z możliwością anulowania

### Błędy autoryzacji

- **Scenariusze:** Wygaśnięty token, błąd sesji
- **Obsługa:** Automatyczne wylogowanie i przekierowanie
- **UI:** Toast o konieczności ponownego logowania

## 11. Kroki implementacji

1. **Weryfikacja istniejącej implementacji**

   - Sprawdzenie czy komponenty `AiGeneratorTab`, `AiGeneratorForm`, `AiSuggestionsList`, `AiSuggestionItem` są już zaimplementowane
   - Analiza hooka `useAiGeneration` pod kątem kompletności
   - Weryfikacja integracji z `DashboardTabs`

2. **Implementacja/aktualizacja AiGeneratorForm**

   - Dodanie zaawansowanej walidacji z kolorowym licznikiem znaków
   - Implementacja debouncing dla walidacji w czasie rzeczywistym
   - Optymalizacja UX z lepszymi komunikatami błędów
   - Dodanie sekcji instrukcji użycia

3. **Implementacja/aktualizacja AiSuggestionsList**

   - Dodanie nagłówka z liczbą sugestii
   - Implementacja stanu pustej listy z odpowiednimi komunikatami
   - Optymalizacja renderowania listy dla lepszej wydajności

4. **Implementacja/aktualizacja AiSuggestionItem**

   - Dodanie edycji in-place dla pytań i odpowiedzi
   - Implementacja walidacji edytowanych treści
   - Dodanie stanów ładowania dla poszczególnych kart
   - Implementacja wykrywania zmian i przywracania oryginalnych wartości

5. **Optymalizacja hooka useAiGeneration**

   - Dodanie error recovery mechanisms
   - Implementacja debouncing dla API calls
   - Dodanie cache'owania sugestii
   - Optymalizacja zarządzania stanem

6. **Implementacja obsługi błędów**

   - Dodanie Toast notifications dla sukcesów/błędów
   - Implementacja retry mechanisms
   - Dodanie graceful degradation dla błędów AI
   - Testowanie różnych scenariuszy błędów

7. **Implementacja dostępności**

   - Dodanie odpowiednich aria-labels i roles
   - Implementacja nawigacji klawiaturowej
   - Testowanie z czytnikami ekranu
   - Optymalizacja focus management

8. **Stylizacja i responsywność**

   - Implementacja responsywnego layoutu
   - Dodanie animacji przejść między stanami
   - Optymalizacja dla urządzeń mobilnych
   - Testowanie na różnych rozdzielczościach

9. **Testowanie i debugging**

   - Testowanie wszystkich user flows
   - Weryfikacja integracji API
   - Testowanie edge cases i scenariuszy błędów
   - Optymalizacja wydajności

10. **Dokumentacja i finalizacja**
    - Aktualizacja dokumentacji komponentów
    - Dodanie examples użycia
    - Code review i refactoring
    - Przygotowanie do wdrożenia
