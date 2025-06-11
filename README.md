# 10xdevs-fishes-cards

## 1. Nazwa Projektu

10xdevs-fishes-cards

## 2. Opis Projektu

Ten projekt to aplikacja webowa o nazwie **10xdevs-fishes-cards**, zaprojektowana do szybkiego tworzenia wysokiej jakości fiszek edukacyjnych. Aplikacja pozwala użytkownikom generować fiszki za pomocą AI, a także ręcznie tworzyć, edytować, przeglądać i usuwać je. Zawiera prosty system zarządzania kontami użytkowników, powiadomienia użytkowników dla operacji, statyczną sekcję FAQ oraz formularz kontaktowy. Głównym celem jest pomoc użytkownikom w efektywnym tworzeniu fiszek, szczególnie z tekstów akademickich, w celu wsparcia nauki poprzez powtórki odstępowe.

To repozytorium zawiera podstawowy kod aplikacji `10xdevs-fishes-cards`.

## 3. Stack Technologiczny

- **Frontend:**
  - Astro 5
  - React 19 (dla interaktywnych komponentów)
  - TypeScript 5
  - Tailwind CSS 4
  - Shadcn/ui (dla komponentów UI)
- **Backend:**
  - Supabase (baza danych PostgreSQL, SDK, Autentykacja)
- **Integracja AI:**
  - OpenAI Platform (GPT-3.5-turbo, GPT-4)
- **CI/CD i Hosting:**
  - GitHub Actions
  - DigitalOcean (za pomocą obrazu Docker)

## 4. Rozpoczynanie Pracy Lokalnie

Aby uruchomić lokalną kopię, wykonaj następujące proste kroki.

### Wymagania Wstępne

- Node.js w wersji `22.14.0` (jak określono w `.nvmrc`). Zaleca się używanie menedżera wersji Node.js, takiego jak `nvm`.

  ```bash
  nvm use
  ```

- npm, yarn lub pnpm jako menedżer pakietów. Poniższe przykłady używają `npm`.

### Instalacja

1. **Zainstaluj pakiety NPM:**

   ```bash
   npm install
   ```

2. **Skonfiguruj zmienne środowiskowe:**
   Utwórz plik `.env` w głównym katalogu projektu. Ten plik będzie zawierał niezbędne klucze API i konfigurację dla usług takich jak Supabase i OpenAI. Możesz potrzebować odwołać się do pliku `.env.example`, jeśli jest dostępny, lub skonfigurować następujące (rzeczywiste nazwy zmiennych mogą się różnić):

   ```env
   # Przykładowe zmienne (zastąp rzeczywistymi potrzebnymi dla projektu)
   PUBLIC_SUPABASE_URL=twoj_supabase_url
   PUBLIC_SUPABASE_ANON_KEY=twoj_supabase_anon_key
   OPENAI_API_KEY=twoj_openai_api_key
   ```

3. **Uruchom serwer deweloperski:**

   ```bash
   npm run dev
   ```

   Otwórz [http://localhost:3000](http://localhost:3000) (lub port określony w konfiguracji Astro/wyjściu konsoli), aby wyświetlić aplikację w przeglądarce.

## 5. Dostępne Skrypty

W katalogu projektu możesz uruchomić następujące skrypty:

- `npm run dev`: Uruchamia aplikację w trybie deweloperskim.
- `npm run build`: Buduje aplikację dla produkcji.
- `npm run preview`: Uruchamia lokalny serwer do podglądu wersji produkcyjnej.
- `npm run astro`: Dostęp do poleceń CLI Astro.
- `npm run lint`: Sprawdza kod za pomocą ESLint.
- `npm run lint:fix`: Sprawdza kod i próbuje automatycznie naprawić problemy.
- `npm run format`: Formatuje kod za pomocą Prettier.

## 6. Zakres Projektu

### Kluczowe Funkcjonalności

- **Generowanie Fiszek za pomocą AI:** Użytkownicy mogą wprowadzić tekst (od 1000 do 10000 znaków), aby AI wygenerowało fiszki.
- **Ręczne Tworzenie Fiszek:** Użytkownicy mogą tworzyć fiszki poprzez ręczne wprowadzanie pytań i odpowiedzi.
- **Zarządzanie Fiszkami:** Edytowanie, usuwanie i przeglądanie zapisanych fiszek.
- **Konta Użytkowników:** Funkcjonalność rejestracji i logowania, w tym akceptacja polityki prywatności.
- **Powiadomienia Użytkowników:** Mechanizmy informacji zwrotnej (np. powiadomienia toast) dla pomyślnych operacji.

### Poza Zakresem (dla obecnej fazy)

- Implementacja zaawansowanego algorytmu powtórek odstępowych (jak SuperMemo lub Anki).
- Wsparcie dla importowania różnych formatów plików (PDF, DOCX, itp.).
- Udostępnianie zestawów fiszek między użytkownikami.
- Integracja z innymi platformami edukacyjnymi.
- Pełna integracja z algorytmem powtórek odstępowych (na tym etapie).
- Wersja aplikacji mobilnej.
- Zaawansowane opcje personalizacji UI (np. tryb ciemny, skróty klawiszowe).
- Fiszki z treścią multimedialną (początkowo tylko tekst).

## 7. Status Projektu

Projekt znajduje się obecnie we wczesnych etapach rozwoju (Wersja `0.0.1`). Kluczowe funkcjonalności są budowane, skupiając się na dostarczeniu Minimum Viable Product (MVP).

## 8. Licencja

Ten projekt jest objęty licencją MIT. Zobacz plik [LICENSE](LICENSE.md) po szczegóły.

## 9. Dodatkowe Informacje

### OpenAI API

#### Generowanie fiszek przez AI

Aplikacja używa OpenAI API do automatycznego generowania fiszek na podstawie tekstu źródłowego:

- **Endpoint:** `POST /api/flashcards/generate-ai`
- **Model:** GPT-3.5-turbo (ekonomiczny) lub GPT-4 (zaawansowany)
- **Wymagania:** Tekst źródłowy 1000-10000 znaków
- **Wynik:** 5-8 sugestii fiszek w języku polskim

#### Gdzie uzyskać klucze API:

1. **Klucz OpenAI API:**

   - Zarejestruj się na [OpenAI Platform](https://platform.openai.com/)
   - Przejdź do [API Keys](https://platform.openai.com/api-keys)
   - Utwórz nowy klucz API
   - Skopiuj klucz i dodaj do zmiennej `OPENAI_API_KEY`

2. **Supabase:**
   - Utwórz nowy projekt na [Supabase](https://supabase.com/)
   - W ustawieniach projektu znajdź URL i anon key
   - Dodaj je do odpowiednich zmiennych środowiskowych

### Dokumentacja API

Szczegółowa dokumentacja API dostępna w katalogu `.ai/`.

## 🔗 Endpointy API

Aplikacja posiada w pełni funkcjonalne endpointy API dla zarządzania fiszkami:

### API Fiszek

- **`POST /api/flashcards/generate-ai`** - Generowanie fiszek przez AI

  - Body: `{ sourceText: string }` (1000-10000 znaków)
  - Response: `{ suggestions: AiFlashcardSuggestionItem[], sourceTextEcho: string }`

- **`POST /api/flashcards`** - Tworzenie nowej fiszki

  - Body: `{ question: string, answer: string, isAiGenerated?: boolean, sourceTextForAi?: string }`
  - Response: `FlashcardDto`

- **`GET /api/flashcards`** - Pobieranie listy fiszek

  - Query: `page?, limit?, sortBy?, sortOrder?, search?, isAiGenerated?`
  - Response: `{ data: FlashcardListItemDto[], pagination: PaginationDetails }`

- **`PATCH /api/flashcards/[id]`** - Edycja fiszki

  - Body: `{ question?: string, answer?: string }`
  - Response: `FlashcardDto`

- **`DELETE /api/flashcards/[id]`** - Usuwanie fiszki (soft delete)
  - Response: `{ success: boolean }`

### Autoryzacja

Wszystkie endpointy wymagają autoryzacji przez sesję Supabase w cookies.

## ⚙️ Konfiguracja

### Zmienne środowiskowe

Utwórz plik `.env` w głównym katalogu projektu:

```env
# Konfiguracja Supabase
SUPABASE_URL=twoj_supabase_project_url
SUPABASE_ANON_KEY=twoj_supabase_anon_key

# Konfiguracja OpenAI API (opcjonalne - w trybie dev używa mock service)
OPENAI_API_KEY=twoj_openai_api_key
```

### Serwis AI

- **Z OPENAI_API_KEY**: Używa prawdziwego OpenAI API (GPT-3.5-turbo)
- **Bez OPENAI_API_KEY**: Automatycznie przełącza na Mock AI Service w trybie development

### Development vs Production

- **Development**: Mock AI service generuje przykładowe fiszki
- **Production**: Wymaga prawdziwego OPENAI_API_KEY
