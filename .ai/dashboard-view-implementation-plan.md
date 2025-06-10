# Plan implementacji widoku Panel Główny Aplikacji (Dashboard)

## 1. Przegląd

Widok Panelu Głównego Aplikacji (`/app`) jest centralnym interfejsem dla zalogowanych użytkowników w aplikacji "10xdevs-fishes-cards". Jego głównym celem jest zapewnienie dostępu do dwóch kluczowych funkcjonalności: generowania fiszek przy użyciu AI oraz zarządzania własnymi fiszkami. Widok wykorzystuje system zakładek (tabs) do przełączania między tymi funkcjami bez pełnego przeładowania strony, zapewniając płynne i wydajne doświadczenie użytkownika.

## 2. Routing widoku

- **Ścieżka:** `/app`
- **Ochrona:** Dostępna tylko dla zalogowanych użytkowników
- **Logika przekierowania:** Niezalogowani użytkownicy są automatycznie przekierowywani do `/login`
- **Implementacja:** Strona Astro (`src/pages/app.astro`) ładująca główny komponent React z dyrektywą `client:load`

## 3. Struktura komponentów

```text
/app (src/pages/app.astro)
└── DashboardLayout (src/layouts/DashboardLayout.astro)
    └── AuthenticatedHeader (src/components/navigation/AuthenticatedHeader.tsx)
    └── DashboardTabs (src/components/dashboard/DashboardTabs.tsx)
        ├── AiGeneratorTab (src/components/dashboard/AiGeneratorTab.tsx)
        │   ├── AiGeneratorForm (src/components/ai/AiGeneratorForm.tsx)
        │   └── AiSuggestionsList (src/components/ai/AiSuggestionsList.tsx)
        │       └── AiSuggestionItem (src/components/ai/AiSuggestionItem.tsx)
        └── MyFlashcardsTab (src/components/dashboard/MyFlashcardsTab.tsx)
            ├── FlashcardsControls (src/components/flashcards/FlashcardsControls.tsx)
            ├── FlashcardsList (src/components/flashcards/FlashcardsList.tsx)
            │   └── FlashcardItem (src/components/flashcards/FlashcardItem.tsx)
            ├── FlashcardCreateModal (src/components/flashcards/FlashcardCreateModal.tsx)
            └── FlashcardEditModal (src/components/flashcards/FlashcardEditModal.tsx)
```

## 4. Szczegóły komponentów

### `src/pages/app.astro`

- **Opis komponentu:** Główna strona dashboard. Odpowiada za sprawdzenie autoryzacji użytkownika i renderowanie layoutu z komponentem React.
- **Główne elementy:** Layout `DashboardLayout`, główny komponent React `DashboardTabs` z dyrektywą `client:load`.
- **Obsługiwane interakcje:** Automatyczne przekierowanie niezalogowanych użytkowników.
- **Obsługiwana walidacja:** Sprawdzenie sesji Supabase po stronie serwera.
- **Typy:** Typy sesji Supabase.
- **Propsy:** Standardowe propsy strony Astro.

### `DashboardLayout` (`src/layouts/DashboardLayout.astro`)

- **Opis komponentu:** Layout specjalnie dla stron aplikacji (dla zalogowanych użytkowników). Zawiera nagłówek dla zalogowanych użytkowników i miejsce na główną zawartość.
- **Główne elementy:** `AuthenticatedHeader`, `<slot />` dla zawartości strony.
- **Obsługiwane interakcje:** Brak bezpośrednich.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Standardowe propsy layoutu Astro.
- **Propsy:** `title` (string, opcjonalny).

### `AuthenticatedHeader` (`src/components/navigation/AuthenticatedHeader.tsx`)

- **Opis komponentu:** Nagłówek dla zalogowanych użytkowników zawierający logo aplikacji, dane użytkownika i przyciski nawigacyjne (w tym wylogowanie).
- **Główne elementy:** Logo aplikacji, informacje o użytkowniku (email), przycisk wylogowania, opcjonalne menu nawigacyjne.
- **Obsługiwane interakcje:** `onClick` na przycisk wylogowania, obsługa wylogowania przez Supabase Auth.
- **Obsługiwana walidacja:** Sprawdzenie danych użytkownika z sesji.
- **Typy:** `User` z Supabase Auth.
- **Propsy:** `user` (User, opcjonalny), `onLogout` (funkcja).

### `DashboardTabs` (`src/components/dashboard/DashboardTabs.tsx`)

- **Opis komponentu:** Główny kontener zarządzający systemem zakładek w dashboard. Wykorzystuje komponenty `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` z Shadcn/ui.
- **Główne elementy:** Shadcn/ui Tabs z dwoma zakładkami: "Generator AI" i "Moje Fiszki".
- **Obsługiwane interakcje:** Przełączanie między zakładkami, zarządzanie stanem aktywnej zakładki.
- **Obsługiwana walidacja:** Brak walidacji na poziomie tabs.
- **Typy:** `DashboardTabType` (enum z wartościami 'ai-generator' | 'my-flashcards').
- **Propsy:** Brak zewnętrznych propsów.

### `AiGeneratorTab` (`src/components/dashboard/AiGeneratorTab.tsx`)

- **Opis komponentu:** Zawartość zakładki "Generator AI", zarządzająca procesem generowania fiszek przez AI.
- **Główne elementy:** `AiGeneratorForm`, `AiSuggestionsList`, instrukcje użycia.
- **Obsługiwane interakcje:** Koordynacja między formularzem a listą sugestii.
- **Obsługiwana walidacja:** Brak walidacji na poziomie kontenera.
- **Typy:** `AiGenerationState`.
- **Propsy:** Brak zewnętrznych propsów.

### `AiGeneratorForm` (`src/components/ai/AiGeneratorForm.tsx`)

- **Opis komponentu:** Formularz do wprowadzania tekstu źródłowego i generowania fiszek przez AI.
- **Główne elementy:** `Textarea` na tekst źródłowy, licznik znaków, przycisk "Generuj fiszki", wskaźnik ładowania.
- **Obsługiwane interakcje:** `onSubmit` formularza, walidacja tekstu w czasie rzeczywistym, wywołanie API generowania AI.
- **Obsługiwana walidacja:** Długość tekstu (1000-10000 znaków), wymagane pole.
- **Typy:** `GenerateAiFlashcardsCommand`, stan ładowania.
- **Propsy:** `onGenerate` (funkcja), `isGenerating` (boolean), `error` (string optional).

### `AiSuggestionsList` (`src/components/ai/AiSuggestionsList.tsx`)

- **Opis komponentu:** Lista sugestii fiszek wygenerowanych przez AI z możliwością ich akceptowania lub odrzucania.
- **Główne elementy:** Lista komponentów `AiSuggestionItem`, informacje o liczbie sugestii.
- **Obsługiwane interakcje:** Przekazywanie akcji akceptacji/odrzucenia do elementów potomnych.
- **Obsługiwana walidacja:** Brak walidacji na poziomie listy.
- **Typy:** `AiFlashcardSuggestionItem[]`.
- **Propsy:** `suggestions` (AiFlashcardSuggestionItem[]), `onAccept` (funkcja), `onReject` (funkcja).

### `AiSuggestionItem` (`src/components/ai/AiSuggestionItem.tsx`)

- **Opis komponentu:** Pojedynczy element sugestii AI z pytaniem, odpowiedzią i przyciskami akcji.
- **Główne elementy:** Wyświetlanie pytania i odpowiedzi, przycisk "Zapisz fiszkę", przycisk "Odrzuć", wskaźnik stanu ładowania.
- **Obsługiwane interakcje:** `onClick` na przycisk zapisz (wywołanie POST /api/flashcards), `onClick` na przycisk odrzuć.
- **Obsługiwana walidacja:** Sprawdzenie czy pytanie i odpowiedź nie są puste.
- **Typy:** `AiFlashcardSuggestionItem`, stan zapisywania.
- **Propsy:** `suggestion` (AiFlashcardSuggestionItem), `onAccept` (funkcja), `onReject` (funkcja), `isAccepting` (boolean).

### `MyFlashcardsTab` (`src/components/dashboard/MyFlashcardsTab.tsx`)

- **Opis komponentu:** Zawartość zakładki "Moje Fiszki", zarządzająca listą fiszek użytkownika oraz operacjami CRUD.
- **Główne elementy:** `FlashcardsControls`, `FlashcardsList`, modalne okna edycji i tworzenia.
- **Obsługiwane interakcje:** Koordynacja między kontrolkami a listą, zarządzanie modalami.
- **Obsługiwana walidacja:** Brak walidacji na poziomie kontenera.
- **Typy:** `FlashcardsState`, stany modali.
- **Propsy:** Brak zewnętrznych propsów.

### `FlashcardsControls` (`src/components/flashcards/FlashcardsControls.tsx`)

- **Opis komponentu:** Panel kontrolny z wyszukiwaniem, filtrowaniem, sortowaniem i przyciskiem dodawania nowej fiszki.
- **Główne elementy:** `Input` wyszukiwania, `Select` sortowania, `Select` filtrowania, przycisk "Dodaj fiszkę".
- **Obsługiwane interakcje:** `onChange` na kontrolkach, debounce dla wyszukiwania, `onClick` na przycisk dodawania.
- **Obsługiwana walidacja:** Brak wymaganej walidacji.
- **Typy:** `GetFlashcardsQuery`, funkcje callback.
- **Propsy:** `filters` (GetFlashcardsQuery), `onFiltersChange` (funkcja), `onCreateNew` (funkcja).

### `FlashcardsList` (`src/components/flashcards/FlashcardsList.tsx`)

- **Opis komponentu:** Lista fiszek użytkownika z paginacją i stanami ładowania.
- **Główne elementy:** Lista komponentów `FlashcardItem`, `Pagination` z Shadcn/ui, stany pustej listy i ładowania.
- **Obsługiwane interakcje:** Przekazywanie akcji edycji/usuwania do elementów potomnych, obsługa paginacji.
- **Obsługiwana walidacja:** Brak walidacji na poziomie listy.
- **Typy:** `FlashcardsListDto`, funkcje callback.
- **Propsy:** `flashcards` (FlashcardListItemDto[]), `pagination` (PaginationDetails), `isLoading` (boolean), `onEdit` (funkcja), `onDelete` (funkcja), `onPageChange` (funkcja).

### `FlashcardItem` (`src/components/flashcards/FlashcardItem.tsx`)

- **Opis komponentu:** Pojedynczy element fiszki z pytaniem, odpowiedzią i przyciskami akcji.
- **Główne elementy:** Wyświetlanie pytania i odpowiedzi, znacznik AI-generated, przyciski edycji i usuwania, metadata (data utworzenia).
- **Obsługiwane interakcje:** `onClick` na przycisk edycji, `onClick` na przycisk usuwania (z potwierdzeniem), możliwość rozwijania/zwijania długich tekstów.
- **Obsługiwana walidacja:** Brak walidacji na poziomie wyświetlania.
- **Typy:** `FlashcardListItemDto`, stany ładowania akcji.
- **Propsy:** `flashcard` (FlashcardListItemDto), `onEdit` (funkcja), `onDelete` (funkcja), `isDeleting` (boolean).

### `FlashcardCreateModal` (`src/components/flashcards/FlashcardCreateModal.tsx`)

- **Opis komponentu:** Modal do tworzenia nowej fiszki ręcznie.
- **Główne elementy:** `Dialog` z Shadcn/ui, formularz z polami pytanie i odpowiedź, przyciski akcji.
- **Obsługiwane interakcje:** `onSubmit` formularza (wywołanie POST /api/flashcards), zamykanie modala, walidacja formularza.
- **Obsługiwana walidacja:** Pytanie min 5 znaków, odpowiedź min 3 znaki, wymagane pola.
- **Typy:** `CreateFlashcardCommand`, stan formularza, stan ładowania.
- **Propsy:** `isOpen` (boolean), `onClose` (funkcja), `onSubmit` (funkcja), `isSubmitting` (boolean).

### `FlashcardEditModal` (`src/components/flashcards/FlashcardEditModal.tsx`)

- **Opis komponentu:** Modal do edycji istniejącej fiszki.
- **Główne elementy:** `Dialog` z Shadcn/ui, formularz z przedwypełnionymi polami, przyciski akcji.
- **Obsługiwane interakcje:** `onSubmit` formularza (wywołanie PATCH /api/flashcards/{id}), zamykanie modala, walidacja formularza.
- **Obsługiwana walidacja:** Pytanie min 5 znaków, odpowiedź min 3 znaki, wymagane pola.
- **Typy:** `UpdateFlashcardCommand`, `FlashcardDto`, stan formularza, stan ładowania.
- **Propsy:** `flashcard` (FlashcardDto optional), `isOpen` (boolean), `onClose` (funkcja), `onSubmit` (funkcja), `isSubmitting` (boolean).

## 5. Typy

Oprócz typów już zdefiniowanych w `src/types.ts`, potrzebne będą następujące dodatkowe typy:

```typescript
// Dodatkowe typy dla Dashboard
export type DashboardTabType = "ai-generator" | "my-flashcards";

export interface DashboardTab {
  id: DashboardTabType;
  label: string;
  count?: number;
}

export interface AiGenerationState {
  isGenerating: boolean;
  suggestions: AiFlashcardSuggestionItem[];
  sourceText: string;
  error?: string;
  lastGeneratedAt?: Date;
}

export interface FlashcardsState {
  flashcards: FlashcardListItemDto[];
  isLoading: boolean;
  pagination: PaginationDetails;
  filters: GetFlashcardsQuery;
  error?: string;
  lastFetchedAt?: Date;
}

export interface DashboardState {
  activeTab: DashboardTabType;
  aiGeneration: AiGenerationState;
  flashcards: FlashcardsState;
}

// Propsy komponentów
export interface AiGeneratorFormProps {
  onGenerate: (command: GenerateAiFlashcardsCommand) => Promise<void>;
  isGenerating: boolean;
  error?: string;
}

export interface AiSuggestionsListProps {
  suggestions: AiFlashcardSuggestionItem[];
  onAccept: (suggestion: AiFlashcardSuggestionItem) => Promise<void>;
  onReject: (suggestion: AiFlashcardSuggestionItem) => void;
}

export interface FlashcardsControlsProps {
  filters: GetFlashcardsQuery;
  onFiltersChange: (filters: Partial<GetFlashcardsQuery>) => void;
  onCreateNew: () => void;
  totalCount?: number;
}

export interface FlashcardsListProps {
  flashcards: FlashcardListItemDto[];
  pagination: PaginationDetails;
  isLoading: boolean;
  onEdit: (flashcard: FlashcardListItemDto) => void;
  onDelete: (flashcardId: string) => Promise<void>;
  onPageChange: (page: number) => void;
}

export interface FlashcardItemProps {
  flashcard: FlashcardListItemDto;
  onEdit: (flashcard: FlashcardListItemDto) => void;
  onDelete: (flashcardId: string) => Promise<void>;
  isDeleting?: boolean;
}

export interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFlashcardCommand | UpdateFlashcardCommand) => Promise<void>;
  isSubmitting: boolean;
  flashcard?: FlashcardDto; // dla edycji
}
```

## 6. Zarządzanie stanem

Widok dashboard wymaga zarządzania złożonym stanem obejmującym generowanie AI, listę fiszek, filtry i stany modali. Zalecana implementacja:

### Custom Hooks

```typescript
// src/hooks/useDashboard.ts
export const useDashboard = () => {
  const [activeTab, setActiveTab] = useState<DashboardTabType>("ai-generator");
  // Zarządzanie głównym stanem dashboard
};

// src/hooks/useAiGeneration.ts
export const useAiGeneration = () => {
  const [state, setState] = useState<AiGenerationState>({
    isGenerating: false,
    suggestions: [],
    sourceText: "",
  });

  const generateSuggestions = async (command: GenerateAiFlashcardsCommand) => {
    // Wywołanie API POST /api/flashcards/generate-ai
  };

  const acceptSuggestion = async (suggestion: AiFlashcardSuggestionItem) => {
    // Wywołanie API POST /api/flashcards
  };

  return { state, generateSuggestions, acceptSuggestion };
};

// src/hooks/useFlashcards.ts
export const useFlashcards = () => {
  const [state, setState] = useState<FlashcardsState>({
    flashcards: [],
    isLoading: false,
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0, limit: 10 },
    filters: {},
  });

  const fetchFlashcards = async (query?: GetFlashcardsQuery) => {
    // Wywołanie API GET /api/flashcards
  };

  const createFlashcard = async (command: CreateFlashcardCommand) => {
    // Wywołanie API POST /api/flashcards
  };

  const updateFlashcard = async (id: string, command: UpdateFlashcardCommand) => {
    // Wywołanie API PATCH /api/flashcards/{id}
  };

  const deleteFlashcard = async (id: string) => {
    // Wywołanie API DELETE /api/flashcards/{id}
  };

  return { state, fetchFlashcards, createFlashcard, updateFlashcard, deleteFlashcard };
};
```

### Zarządzanie stanem modali

Stany modali będą zarządzane lokalnie w komponencie `MyFlashcardsTab` za pomocą `useState`:

```typescript
const [createModalOpen, setCreateModalOpen] = useState(false);
const [editModalOpen, setEditModalOpen] = useState(false);
const [editingFlashcard, setEditingFlashcard] = useState<FlashcardDto | null>(null);
```

## 7. Integracja API

Widok dashboard integruje się z następującymi endpointami API:

### POST /api/flashcards/generate-ai

- **Żądanie:** `GenerateAiFlashcardsCommand`
- **Odpowiedź:** `AiFlashcardSuggestionsDto`
- **Użycie:** W `useAiGeneration` hook, wywoływane przez `AiGeneratorForm`

### GET /api/flashcards

- **Żądanie:** Query parameters zgodne z `GetFlashcardsQuery`
- **Odpowiedź:** `FlashcardsListDto`
- **Użycie:** W `useFlashcards` hook, wywoływane przy ładowaniu, zmianie filtrów, paginacji

### POST /api/flashcards

- **Żądanie:** `CreateFlashcardCommand`
- **Odpowiedź:** `FlashcardDto`
- **Użycie:** W `useFlashcards` i `useAiGeneration` hooks, wywoływane przez modals i akceptację sugestii AI

### PATCH /api/flashcards/{flashcardId}

- **Żądanie:** `UpdateFlashcardCommand`
- **Odpowiedź:** `FlashcardDto`
- **Użycie:** W `useFlashcards` hook, wywoływane przez `FlashcardEditModal`

### DELETE /api/flashcards/{flashcardId}

- **Żądanie:** Brak body
- **Odpowiedź:** 204 No Content
- **Użycie:** W `useFlashcards` hook, wywoływane przez `FlashcardItem`

Wszystkie wywołania API muszą zawierać nagłówek autoryzacji z JWT tokenem z Supabase Auth.

## 8. Interakcje użytkownika

### Przełączanie zakładek

- **Akcja:** Kliknięcie na zakładkę "Generator AI" lub "Moje Fiszki"
- **Obsługa:** Stan `activeTab` w `useDashboard`, komponenty `TabsTrigger` z Shadcn/ui
- **Rezultat:** Zmiana widocznej zawartości bez przeładowania strony

### Generowanie fiszek AI

- **Akcja:** Wprowadzenie tekstu (1000-10000 znaków) i kliknięcie "Generuj fiszki"
- **Walidacja:** Sprawdzenie długości tekstu, wyświetlenie błędu walidacji
- **Obsługa:** `useAiGeneration` hook, wywołanie API, stan ładowania
- **Rezultat:** Lista sugestii fiszek lub komunikat błędu

### Akceptacja sugestii AI

- **Akcja:** Kliknięcie "Zapisz fiszkę" przy sugestii
- **Obsługa:** Wywołanie API tworzenia fiszki, aktualizacja listy fiszek
- **Rezultat:** Fiszka zapisana, usunięcie z listy sugestii, odświeżenie listy "Moje Fiszki"

### Wyszukiwanie fiszek

- **Akcja:** Wprowadzenie tekstu w polu wyszukiwania
- **Obsługa:** Debounce (300ms), aktualizacja filtrów, wywołanie API
- **Rezultat:** Odfiltrowana lista fiszek

### Sortowanie i filtrowanie

- **Akcja:** Wybór opcji w kontrolkach sortowania/filtrowania
- **Obsługa:** Aktualizacja filtrów w `useFlashcards`, wywołanie API
- **Rezultat:** Posortowana/odfiltrowana lista fiszek

### Edycja fiszki

- **Akcja:** Kliknięcie przycisku edycji przy fiszce
- **Obsługa:** Otwarcie modala z przedwypełnionymi danymi
- **Rezultat:** Modal edycji z możliwością zapisania zmian

### Usuwanie fiszki

- **Akcja:** Kliknięcie przycisku usuwania z potwierdzeniem
- **Obsługa:** Dialog potwierdzenia, wywołanie API DELETE, aktualizacja listy
- **Rezultat:** Fiszka usunięta z listy

### Tworzenie nowej fiszki

- **Akcja:** Kliknięcie "Dodaj fiszkę"
- **Obsługa:** Otwarcie modala tworzenia
- **Rezultat:** Modal z pustym formularzem

## 9. Warunki i walidacja

### Walidacja tekstu dla AI Generator

- **Komponenty:** `AiGeneratorForm`
- **Warunki:** Tekst musi mieć 1000-10000 znaków
- **Wpływ na UI:** Wyłączenie przycisku generowania, wyświetlenie komunikatu błędu, licznik znaków z kolorowym wskazaniem

### Walidacja formularzy fiszek

- **Komponenty:** `FlashcardCreateModal`, `FlashcardEditModal`
- **Warunki:** Pytanie min 5 znaków, odpowiedź min 3 znaki
- **Wpływ na UI:** Wyłączenie przycisków zapisu, wyświetlenie błędów pod polami

### Autoryzacja

- **Komponenty:** Wszystkie komponenty
- **Warunki:** Użytkownik musi być zalogowany
- **Wpływ na UI:** Przekierowanie do `/login` jeśli brak sesji

### Limity API

- **Komponenty:** `AiGeneratorForm`, formularze CRUD
- **Warunki:** Rate limiting, limity długości, dostępność usługi AI
- **Wpływ na UI:** Wyłączenie przycisków, komunikaty błędów, stany ładowania

## 10. Obsługa błędów

### Błędy API

- **Scenariusze:** Network timeout, 500 Internal Server Error, 503 Service Unavailable
- **Obsługa:** Try-catch w hooks, wyświetlenie toast notifications, stan error w komponencie
- **UI:** Komunikaty błędów, możliwość ponowienia akcji

### Błędy walidacji

- **Scenariusze:** 400 Bad Request z szczegółami walidacji
- **Obsługa:** Parsowanie błędów API, mapowanie na pola formularza
- **UI:** Czerwone obramowanie pól, komunikaty błędów pod polami

### Błędy autoryzacji

- **Scenariusze:** 401 Unauthorized, wygaśnięty token
- **Obsługa:** Automatyczne wylogowanie, przekierowanie do logowania
- **UI:** Toast notification o konieczności ponownego logowania

### Błędy AI Service

- **Scenariusze:** Niedostępność usługi OpenAI, limit zapytań
- **Obsługa:** Graceful degradation, sugestie alternatywnych rozwiązań
- **UI:** Komunikat o tymczasowej niedostępności, zachęta do ręcznego tworzenia

### Błędy ładowania danych

- **Scenariusze:** Pusta lista fiszek, błąd ładowania
- **Obsługa:** Rozróżnienie między brakiem danych a błędem
- **UI:** Stany puste vs stany błędów, różne komunikaty i akcje

## 11. Kroki implementacji

1. **Przygotowanie środowiska i zależności**

   - Upewnij się, że Shadcn/ui jest skonfigurowane z komponentami: `Tabs`, `Button`, `Input`, `Textarea`, `Dialog`, `Select`
   - Dodaj komponenty UI: `npx shadcn-ui@latest add tabs dialog input textarea select button`
   - Skonfiguruj klienta Supabase dla autoryzacji

2. **Implementacja layoutu i routing**

   - Stwórz `src/layouts/DashboardLayout.astro` z podstawową strukturą
   - Stwórz `src/pages/app.astro` z logiką autoryzacji i przekierowania
   - Zaimplementuj middleware sprawdzające autoryzację (opcjonalnie)

3. **Implementacja nagłówka dla zalogowanych użytkowników**

   - Stwórz `src/components/navigation/AuthenticatedHeader.tsx`
   - Dodaj logo, informacje o użytkowniku, przycisk wylogowania
   - Zintegruj z Supabase Auth dla wylogowania

4. **Implementacja systemu zakładek**

   - Stwórz `src/components/dashboard/DashboardTabs.tsx` z komponentami Shadcn/ui
   - Zaimplementuj przełączanie między zakładkami
   - Stwórz szkielety `AiGeneratorTab` i `MyFlashcardsTab`

5. **Implementacja custom hooks**

   - Stwórz `src/hooks/useDashboard.ts` dla zarządzania stanem głównym
   - Stwórz `src/hooks/useAiGeneration.ts` z integracją API
   - Stwórz `src/hooks/useFlashcards.ts` z pełnym CRUD
   - Dodaj obsługę błędów i stanów ładowania

6. **Implementacja zakładki Generator AI**

   - Stwórz `src/components/ai/AiGeneratorForm.tsx` z walidacją
   - Stwórz `src/components/ai/AiSuggestionsList.tsx` i `AiSuggestionItem.tsx`
   - Zintegruj z `useAiGeneration` hook
   - Dodaj stany ładowania i obsługę błędów

7. **Implementacja zakładki Moje Fiszki**

   - Stwórz `src/components/flashcards/FlashcardsControls.tsx` z wyszukiwaniem i filtrami
   - Stwórz `src/components/flashcards/FlashcardsList.tsx` z paginacją
   - Stwórz `src/components/flashcards/FlashcardItem.tsx` z akcjami CRUD
   - Zintegruj z `useFlashcards` hook

8. **Implementacja modali CRUD**

   - Stwórz `src/components/flashcards/FlashcardCreateModal.tsx`
   - Stwórz `src/components/flashcards/FlashcardEditModal.tsx`
   - Dodaj walidację formularzy zgodną z API
   - Zintegruj z hook'ami i aktualizacją stanu

9. **Stylizacja i responsywność**

   - Zastosuj Tailwind CSS dla pełnej responsywności
   - Zoptymalizuj dla urządzeń mobilnych (zakładki, tabele, modále)
   - Dodaj animacje i transition dla lepszego UX

10. **Dostępność i A11y**

    - Upewnij się, że zakładki są dostępne z klawiatury
    - Dodaj proper focus management w modalach
    - Sprawdź współdziałanie z czytnikami ekranu
    - Dodaj odpowiednie aria-labels i role

11. **Obsługa błędów i edge cases**

    - Zaimplementuj toast notifications dla operacji
    - Dodaj confirmation dialogs dla destructive actions
    - Obsłuż stany pustej listy i błędów ładowania
    - Przetestuj z różnymi stanami sieciowymi

12. **Optymalizacja wydajności**

    - Dodaj debounce dla wyszukiwania (300ms)
    - Zoptymalizuj re-renderowanie list z React.memo
    - Rozważ lazy loading dla dużych list fiszek
    - Dodaj proper loading states i skeleton UI

13. **Testowanie**
    - Przetestuj wszystkie flow użytkownika (AI generation, CRUD operations)
    - Sprawdź responsywność na różnych urządzeniach
    - Przetestuj dostępność z klawiaturą i czytnikami ekranu
    - Przetestuj scenariusze błędów i edge cases
