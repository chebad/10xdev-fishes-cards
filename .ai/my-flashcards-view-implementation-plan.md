# Plan implementacji widoku "Lista Moich Fiszek"

## 1. Przegląd

Widok "Lista Moich Fiszek" jest jednym z głównych komponentów aplikacji 10xdevs-fishes-cards, umożliwiającym użytkownikom przeglądanie, wyszukiwanie, tworzenie, edytowanie i usuwanie swoich fiszek edukacyjnych. Widok implementuje funkcjonalności z historyjek użytkownika US-003 (ręczne tworzenie fiszek), US-004 (edycja fiszek), US-005 (usuwanie fiszek) oraz US-006 (przeglądanie fiszek). System zapewnia intuicyjny interfejs z paginacją, filtrami, wyszukiwaniem oraz mechanizmami powiadomień o powodzeniu operacji.

## 2. Routing widoku

Widok jest dostępny na ścieżce `/app` w ramach zakładki "Moje Fiszki" aplikacji dashboard. Wykorzystuje istniejący system routingu Astro z React dla komponentów interaktywnych.

## 3. Struktura komponentów

```
MyFlashcardsView (główny kontener widoku)
├── FlashcardsControls (kontrolki wyszukiwania i filtrowania)
│   ├── Button (Dodaj fiszkę)
│   ├── Input (pole wyszukiwania)
│   ├── Select (sortowanie, filtrowanie AI)
│   └── Button (Wyczyść filtry)
├── FlashcardsList (lista fiszek z paginacją)
│   ├── FlashcardItem[] (komponenty pojedynczych fiszek)
│   │   ├── Card (kontener fiszki)
│   │   ├── Badge (oznaczenie AI/ręczne)
│   │   ├── Button (Edytuj)
│   │   └── Button (Usuń)
│   └── Pagination (kontrolki stronnicowania)
├── FlashcardCreateModal (modal tworzenia nowej fiszki)
│   ├── Dialog (kontener modalu)
│   ├── Form (formularz)
│   ├── Input (pole pytania)
│   ├── Textarea (pole odpowiedzi)
│   └── Button[] (Zapisz, Anuluj)
├── FlashcardEditModal (modal edycji fiszki)
│   ├── Dialog (kontener modalu)
│   ├── Form (formularz wypełniony danymi)
│   ├── Input (pole pytania)
│   ├── Textarea (pole odpowiedzi)
│   └── Button[] (Zapisz, Anuluj)
├── DeleteConfirmModal (modal potwierdzenia usunięcia)
│   ├── Dialog (kontener modalu)
│   ├── Alert (ostrzeżenie)
│   └── Button[] (Usuń, Anuluj)
└── ToastNotifications (system powiadomień)
```

## 4. Szczegóły komponentów

### MyFlashcardsView
- **Opis komponentu:** Główny kontener widoku zarządzający stanem aplikacji, orchestrujący komunikację między komponentami potomnymi oraz wywołania API.
- **Główne elementy:** Div z układem CSS Grid/Flexbox zawierający wszystkie komponenty potomne, system zarządzania stanem React (useState, useEffect), obsługę błędów i loadingu.
- **Obsługiwane interakcje:** 
  - Inicjalizacja widoku (pobieranie listy fiszek)
  - Obsługa zmiany filtrów/sortowania
  - Obsługa zmiany strony paginacji
  - Otwieranie/zamykanie modali
  - Komunikacja z API endpointami
- **Obsługiwana walidacja:** Walidacja stanu sesji użytkownika, sprawdzenie uprawnień dostępu do widoku
- **Typy:** `FlashcardsState`, `MyFlashcardsViewProps`, `ApiError`
- **Propsy:** Nie przyjmuje propsów - jest komponentem głównym

### FlashcardsControls
- **Opis komponentu:** Panel kontrolny z przyciskiem dodawania, polem wyszukiwania oraz filtrami sortowania i typu fiszki.
- **Główne elementy:** Card container z Button (Dodaj fiszkę), Input (wyszukiwanie), Select komponenty (sortowanie, kierunek, typ AI), Button (Wyczyść filtry), licznik fiszek
- **Obsługiwane interakcje:**
  - Klik "Dodaj fiszkę" → otwiera CreateModal
  - Wpisywanie w pole wyszukiwania → debounced search (300ms)
  - Zmiana filtrów sortowania → natychmiastowa aktualizacja
  - Klik "Wyczyść filtry" → reset do domyślnych wartości
- **Obsługiwana walidacja:** Debouncing wyszukiwania, walidacja wartości select
- **Typy:** `FlashcardsControlsProps`, `GetFlashcardsQuery`
- **Propsy:** 
  ```typescript
  interface FlashcardsControlsProps {
    filters: GetFlashcardsQuery;
    onFiltersChange: (filters: Partial<GetFlashcardsQuery>) => void;
    onCreateNew: () => void;
    totalCount?: number;
  }
  ```

### FlashcardsList
- **Opis komponentu:** Lista fiszek z paginacją, obsługujący stany ładowania i brak wyników.
- **Główne elementy:** Div container z FlashcardItem components, Pagination component, loading spinner, empty state message
- **Obsługiwane interakcje:**
  - Renderowanie listy fiszek
  - Obsługa kliknięć w paginację
  - Przekazywanie zdarzeń edycji/usuwania do rodzica
- **Obsługiwana walidacja:** Sprawdzenie czy dane są załadowane, walidacja struktury pagination
- **Typy:** `FlashcardsListProps`, `FlashcardListItemDto[]`, `PaginationDetails`
- **Propsy:**
  ```typescript
  interface FlashcardsListProps {
    flashcards: FlashcardListItemDto[];
    pagination: PaginationDetails;
    isLoading: boolean;
    onEdit: (flashcard: FlashcardListItemDto) => void;
    onDelete: (flashcardId: string) => Promise<void>;
    onPageChange: (page: number) => void;
  }
  ```

### FlashcardItem
- **Opis komponentu:** Pojedyncza karta fiszki z pytaniem, odpowiedzią, metadanymi i przyciskami akcji.
- **Główne elementy:** Card z pytaniem (Input-styled), odpowiedzią (Textarea-styled), Badge (AI/ręczne), Button (Edytuj), Button (Usuń), metadata (daty)
- **Obsługiwane interakcje:**
  - Rozwijanie/zwijanie długich tekstów
  - Klik "Edytuj" → wywołuje onEdit callback
  - Klik "Usuń" → wywołuje onDelete callback
  - Potwierdzenie usunięcia (window.confirm)
- **Obsługiwana walidacja:** Sprawdzenie stanu ładowania usuwania, walidacja długości tekstu dla truncation
- **Typy:** `FlashcardItemProps`, `FlashcardListItemDto`
- **Propsy:**
  ```typescript
  interface FlashcardItemProps {
    flashcard: FlashcardListItemDto;
    onEdit: (flashcard: FlashcardListItemDto) => void;
    onDelete: (flashcardId: string) => Promise<void>;
    isDeleting?: boolean;
  }
  ```

### FlashcardCreateModal
- **Opis komponentu:** Modal do tworzenia nowej fiszki z formularzem pytania i odpowiedzi.
- **Główne elementy:** Dialog container, Form z Input (pytanie), Textarea (odpowiedź), licznik znaków, Button (Zapisz), Button (Anuluj), Alert (błędy)
- **Obsługiwane interakcje:**
  - Wpisywanie w pola formularza
  - Walidacja w czasie rzeczywistym
  - Submit formularza
  - Zamykanie modalu (ESC, klik tła, Anuluj)
- **Obsługiwana walidacja:**
  - Pytanie: wymagane, min 3 znaki, max 1000 znaków
  - Odpowiedź: wymagane, min 3 znaki, max 2000 znaków
  - Trimowanie białych znaków
- **Typy:** `FlashcardCreateModalProps`, `CreateFlashcardCommand`, `ValidationErrors`
- **Propsy:**
  ```typescript
  interface FlashcardCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateFlashcardCommand) => Promise<void>;
    isSubmitting: boolean;
  }
  ```

### FlashcardEditModal
- **Opis komponentu:** Modal do edycji istniejącej fiszki z przedwypełnionym formularzem.
- **Główne elementy:** Dialog container, Form z wypełnionymi danymi, Input (pytanie), Textarea (odpowiedź), licznik znaków, Button (Zapisz), Button (Anuluj), Alert (błędy)
- **Obsługiwane interakcje:**
  - Inicjalizacja formularza z danymi fiszki
  - Edycja pól formularza
  - Walidacja zmian
  - Submit aktualizacji
  - Zamykanie modalu
- **Obsługiwana walidacja:**
  - Pytanie: wymagane, min 3 znaki, max 1000 znaków
  - Odpowiedź: wymagane, min 3 znaki, max 2000 znaków
  - Sprawdzenie czy wprowadzono zmiany
- **Typy:** `FlashcardEditModalProps`, `UpdateFlashcardCommand`, `FlashcardDto`
- **Propsy:**
  ```typescript
  interface FlashcardEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UpdateFlashcardCommand) => Promise<void>;
    isSubmitting: boolean;
    flashcard?: FlashcardDto;
  }
  ```

### DeleteConfirmModal
- **Opis komponentu:** Modal potwierdzenia usunięcia fiszki z ostrzeżeniem.
- **Główne elementy:** Dialog container, Alert z ostrzeżeniem, informacje o fiszce (pytanie), Button (Usuń), Button (Anuluj)
- **Obsługiwane interakcje:**
  - Wyświetlenie szczegółów usuwanej fiszki
  - Potwierdzenie usunięcia
  - Anulowanie operacji
- **Obsługiwana walidacja:** Sprawdzenie czy fiszka została przekazana, walidacja stanu ładowania
- **Typy:** `DeleteConfirmModalProps`, `FlashcardListItemDto`
- **Propsy:**
  ```typescript
  interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    flashcard?: FlashcardListItemDto;
    isDeleting: boolean;
  }
  ```

## 5. Typy

### Główne typy interfejsu (wykorzystywane z types.ts):
- `FlashcardListItemDto` - typ dla pojedynczej fiszki na liście
- `FlashcardsListDto` - typ odpowiedzi API z listą i paginacją
- `PaginationDetails` - informacje o paginacji
- `GetFlashcardsQuery` - parametry zapytania (filtry, sortowanie, paginacja)
- `CreateFlashcardCommand` - dane do tworzenia fiszki
- `UpdateFlashcardCommand` - dane do aktualizacji fiszki
- `FlashcardDto` - pełne dane fiszki

### Nowe typy ViewModel dla widoku:

```typescript
// Stan głównego widoku
interface MyFlashcardsViewState {
  flashcards: FlashcardListItemDto[];
  pagination: PaginationDetails;
  filters: GetFlashcardsQuery;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt?: Date;
}

// Stan modali
interface ModalState {
  createModal: {
    isOpen: boolean;
    isSubmitting: boolean;
  };
  editModal: {
    isOpen: boolean;
    isSubmitting: boolean;
    flashcard?: FlashcardDto;
  };
  deleteModal: {
    isOpen: boolean;
    isDeleting: boolean;
    flashcard?: FlashcardListItemDto;
  };
}

// Błędy API
interface ApiError {
  message: string;
  details?: Record<string, string[]>;
  status?: number;
}

// Błędy walidacji formularza
interface ValidationErrors {
  question?: string;
  answer?: string;
}

// Propsy głównego komponentu
interface MyFlashcardsViewProps {
  initialFilters?: Partial<GetFlashcardsQuery>;
}
```

## 6. Zarządzanie stanem

Widok wykorzystuje stan lokalny React z hooks useState i useEffect. Główny stan zarządzany przez komponent MyFlashcardsView:

### Hook useFlashcards (custom hook):
```typescript
const useFlashcards = (initialFilters?: Partial<GetFlashcardsQuery>) => {
  const [state, setState] = useState<MyFlashcardsViewState>({
    flashcards: [],
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0, limit: 12 },
    filters: { page: 1, limit: 12, sortBy: "createdAt", sortOrder: "desc", ...initialFilters },
    isLoading: true,
    error: null,
  });

  const [modalState, setModalState] = useState<ModalState>({
    createModal: { isOpen: false, isSubmitting: false },
    editModal: { isOpen: false, isSubmitting: false },
    deleteModal: { isOpen: false, isDeleting: false },
  });

  // Funkcje zarządzania stanem
  const fetchFlashcards = async (newFilters?: Partial<GetFlashcardsQuery>) => { /* implementacja */ };
  const handleFiltersChange = (newFilters: Partial<GetFlashcardsQuery>) => { /* implementacja */ };
  const handlePageChange = (page: number) => { /* implementacja */ };
  
  return { state, modalState, actions: { fetchFlashcards, handleFiltersChange, handlePageChange } };
};
```

### Zarządzanie stanem modali:
- Każdy modal ma własny stan (isOpen, isSubmitting/isDeleting)
- Stan modalu edit przechowuje aktualnie edytowaną fiszkę
- Stan modalu delete przechowuje fiszkę do usunięcia

### Synchronizacja stanu:
- Po każdej operacji CRUD odświeżana jest lista fiszek
- Toast notifications informują o powodzeniu/błędzie operacji
- Optymistyczne aktualizacje dla lepszego UX

## 7. Integracja API

### Wykorzystywane endpointy:

**GET /api/flashcards**
- **Typ żądania:** `GetFlashcardsQuery`
- **Typ odpowiedzi:** `FlashcardsListDto`
- **Zastosowanie:** Pobieranie listy fiszek z filtrami i paginacją

**POST /api/flashcards**
- **Typ żądania:** `CreateFlashcardCommand`
- **Typ odpowiedzi:** `FlashcardDto`
- **Zastosowanie:** Tworzenie nowej fiszki ręcznie

**PATCH /api/flashcards/{flashcardId}**
- **Typ żądania:** `UpdateFlashcardCommand`
- **Typ odpowiedzi:** `FlashcardDto`
- **Zastosowanie:** Aktualizacja istniejącej fiszki

**DELETE /api/flashcards/{flashcardId}**
- **Typ żądania:** Brak body
- **Typ odpowiedzi:** 204 No Content
- **Zastosowanie:** Miękkie usunięcie fiszki

### Funkcje API service:
```typescript
const flashcardsApiService = {
  async fetchFlashcards(filters: GetFlashcardsQuery): Promise<FlashcardsListDto> {
    const queryParams = new URLSearchParams();
    // Dodawanie parametrów zapytania
    const response = await fetch(`/api/flashcards?${queryParams}`);
    return response.json();
  },

  async createFlashcard(data: CreateFlashcardCommand): Promise<FlashcardDto> {
    const response = await fetch('/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateFlashcard(id: string, data: UpdateFlashcardCommand): Promise<FlashcardDto> {
    const response = await fetch(`/api/flashcards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteFlashcard(id: string): Promise<void> {
    await fetch(`/api/flashcards/${id}`, {
      method: 'DELETE',
    });
  },
};
```

## 8. Interakcje użytkownika

### Scenariusze interakcji:

1. **Przeglądanie fiszek:**
   - Użytkownik wchodzi na widok → automatyczne pobieranie listy fiszek
   - Wyświetlenie listy z paginacją (12 fiszek na stronę)
   - Możliwość przejścia między stronami

2. **Wyszukiwanie:**
   - Użytkownik wpisuje w pole wyszukiwania → debounced request (300ms)
   - Wyniki filtrowane po pytaniach i odpowiedziach
   - Resetowanie paginacji do strony 1

3. **Filtrowanie i sortowanie:**
   - Zmiana sortowania → natychmiastowe ponowne zapytanie
   - Filtrowanie po typie (AI/ręczne) → aktualizacja listy
   - Wyczyść filtry → powrót do domyślnych ustawień

4. **Tworzenie fiszki:**
   - Klik "Dodaj fiszkę" → otwiera modal
   - Wypełnienie formularza → walidacja w czasie rzeczywistym
   - Submit → utworzenie fiszki + toast + odświeżenie listy + zamknięcie modalu

5. **Edycja fiszki:**
   - Klik "Edytuj" na fiszce → otwiera modal z danymi
   - Modyfikacja pól → walidacja
   - Submit → aktualizacja + toast + odświeżenie listy + zamknięcie modalu

6. **Usuwanie fiszki:**
   - Klik "Usuń" → wyświetlenie potwierdzenia
   - Potwierdzenie → usunięcie + toast + odświeżenie listy

## 9. Warunki i walidacja

### Walidacja po stronie klienta:

**FlashcardCreateModal i FlashcardEditModal:**
- Pytanie: 
  - Wymagane (nie może być puste po trim)
  - Minimum 3 znaki po trim
  - Maximum 1000 znaków
- Odpowiedź:
  - Wymagane (nie może być puste po trim)
  - Minimum 3 znaki po trim
  - Maximum 2000 znaków

**FlashcardsControls:**
- Debouncing wyszukiwania (300ms)
- Walidacja wartości select (sortBy, sortOrder, isAiGenerated)
- Sprawdzenie formatu page i limit dla paginacji

**FlashcardsList:**
- Walidacja numerów stron (nie może być < 1 lub > totalPages)
- Sprawdzenie czy pagination.currentPage jest w dozwolonym zakresie

### Warunki biznesowe:
- Użytkownik może edytować/usuwać tylko własne fiszki (weryfikowane przez API)
- Lista domyślnie sortowana po dacie utworzenia (malejąco)
- Paginacja z limitem 12 fiszek na stronę
- Automatyczne odświeżanie po operacjach CRUD

### Walidacja uprawnień:
- Sprawdzenie sesji użytkownika przed dostępem do widoku
- Weryfikacja tokenu JWT przy każdym zapytaniu API
- Obsługa błędów 401/403 z przekierowaniem do logowania

## 10. Obsługa błędów

### Scenariusze błędów i ich obsługa:

1. **Błędy sieciowe:**
   - Brak połączenia → toast z informacją "Sprawdź połączenie internetowe"
   - Timeout → toast "Żądanie przekroczyło limit czasu"
   - Błąd serwera (5xx) → toast "Wystąpił błąd serwera. Spróbuj ponownie"

2. **Błędy autoryzacji:**
   - 401 Unauthorized → przekierowanie do strony logowania
   - 403 Forbidden → toast "Brak uprawnień do wykonania tej operacji"

3. **Błędy walidacji:**
   - 400 Bad Request → wyświetlenie błędów pod polami formularza
   - Błędy klienckie → podświetlenie nieprawidłowych pól

4. **Błędy biznesowe:**
   - 404 Not Found → toast "Fiszka nie została znaleziona"
   - Próba edycji nieistniejącej fiszki → odświeżenie listy

5. **Błędy stanu:**
   - Pusta lista → wyświetlenie komunikatu "Brak fiszek"
   - Brak wyników wyszukiwania → "Nie znaleziono fiszek spełniających kryteria"

### Mechanizmy odporności:
- Retry dla zapytań GET (max 3 próby)
- Graceful degradation (wyświetlanie partial data)
- Fallback UI dla błędów krytycznych
- Logging błędów do konsoli (tryb development)

### Komponenty błędów:
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

const FlashcardsErrorBoundary: React.FC = ({ children }) => {
  // Implementacja Error Boundary dla całego widoku
};

const ErrorToast = (message: string, type: 'error' | 'warning' | 'success') => {
  // Wyświetlanie toast notifications
};
```

## 11. Kroki implementacji

### Krok 1: Przygotowanie struktury
1. Utworzenie pliku głównego komponentu `src/components/flashcards/MyFlashcardsView.tsx`
2. Sprawdzenie i aktualizacja istniejących komponentów (FlashcardsControls, FlashcardsList, FlashcardItem)
3. Sprawdzenie modali (FlashcardCreateModal, FlashcardEditModal)
4. Utworzenie DeleteConfirmModal jeśli nie istnieje

### Krok 2: Implementacja custom hook
1. Utworzenie `src/hooks/useFlashcards.ts`
2. Implementacja zarządzania stanem fiszek
3. Implementacja funkcji API calls
4. Dodanie obsługi błędów i loading states

### Krok 3: Implementacja głównego komponentu
1. Utworzenie MyFlashcardsView z podstawową strukturą
2. Integracja z useFlashcards hook
3. Implementacja renderowania komponentów potomnych
4. Dodanie obsługi modali

### Krok 4: Implementacja obsługi zdarzeń
1. Implementacja handleCreateFlashcard
2. Implementacja handleEditFlashcard  
3. Implementacja handleDeleteFlashcard
4. Implementacja handleFiltersChange i handlePageChange

### Krok 5: Implementacja API service
1. Utworzenie `src/lib/services/flashcardsApiService.ts`
2. Implementacja wszystkich metod API
3. Dodanie obsługi błędów i typów response
4. Integracja z hook useFlashcards

### Krok 6: Aktualizacja/utworzenie modali
1. Sprawdzenie i aktualizacja FlashcardCreateModal
2. Sprawdzenie i aktualizacja FlashcardEditModal
3. Utworzenie DeleteConfirmModal
4. Implementacja obsługi zamykania modali

### Krok 7: Implementacja systemu powiadomień
1. Integracja z Sonner (toast library)
2. Dodanie powiadomień sukcesu dla operacji CRUD
3. Dodanie powiadomień błędów
4. Konfiguracja stylu i pozycji toastów

### Krok 8: Stylowanie i responsywność
1. Implementacja układu responsywnego (mobile-first)
2. Dodanie animacji i transycji
3. Testowanie na różnych rozdzielczościach
4. Optymalizacja dla dostępności (a11y)

### Krok 9: Integracja z aplikacją
1. Dodanie widoku do routing systemu
2. Integracja z layout aplikacji
3. Dodanie zabezpieczeń (sprawdzenie sesji)
4. Konfiguracja domyślnych filtrów

### Krok 10: Testowanie i optymalizacja
1. Testowanie wszystkich scenariuszy użycia
2. Testowanie obsługi błędów
3. Optymalizacja wydajności (debouncing, memo)
4. Walidacja zgodności z wymaganiami PRD

### Krok 11: Dokumentacja i finalizacja
1. Dodanie komentarzy JSDoc do komponentów
2. Aktualizacja typów w types.ts jeśli potrzebne
3. Sprawdzenie linting i TypeScript errors
4. Przygotowanie do merge/deploy 