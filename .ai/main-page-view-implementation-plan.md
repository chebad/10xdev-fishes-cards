# Plan implementacji widoku Strona Główna

## 1. Przegląd

Widok Strony Głównej (`/`) jest pierwszym punktem kontaktu użytkownika z aplikacją "10xdevs-fishes-cards". Jego głównym celem jest krótkie przedstawienie wartości aplikacji oraz skierowanie użytkowników do odpowiednich sekcji: niezalogowani użytkownicy są kierowani do stron logowania (`/login`) lub rejestracji (`/register`), natomiast zalogowani użytkownicy są automatycznie przekierowywani do głównego interfejsu aplikacji (`/app`).

## 2. Routing widoku

- **Ścieżka:** `/`
- **Logika przekierowania:**
  - Jeśli użytkownik jest zalogowany, następuje przekierowanie do `/app`.
  - Jeśli użytkownik nie jest zalogowany, wyświetlana jest zawartość strony głównej.

## 3. Struktura komponentów

```text
  / (src/pages/index.astro)
  └── HomePageLayout (src/layouts/MarketingLayout.astro) # Założenie ogólnego layoutu dla stron marketingowych
      └── HeaderUnauthenticated (src/components/MarketingHeader.astro)
          └── AppLogo (src/components/AppLogo.astro)
          └── AppName (Tekst)
      └── MainPageContent (src/components/landing/MainPageContent.astro)
          └── HeroSection (Astro komponent)
              └── ValuePropositionText (Tekst)
              └── CtaButtons (Astro komponent)
                  ├── LoginButton (src/components/ui/Button.tsx)
                  └── RegisterButton (src/components/ui/Button.tsx)
```

*Logika sprawdzania statusu autentykacji i przekierowania będzie zaimplementowana w `src/pages/index.astro` (preferowana metoda serwerowa) lub w `src/middleware/index.ts`.*

## 4. Szczegóły komponentów

### `src/pages/index.astro`

- **Opis komponentu:** Główny plik strony dla ścieżki `/`. Odpowiada za sprawdzenie statusu autentykacji użytkownika i wykonanie odpowiedniego przekierowania lub renderowanie zawartości strony głównej.
- **Główne elementy:** Wykorzystuje `HomePageLayout`. Zawiera logikę serwerową (lub skrypt po stronie klienta z `is:inline` jako alternatywa) do obsługi autentykacji.
- **Obsługiwane interakcje:** Automatyczne przekierowanie dla zalogowanych użytkowników.
- **Obsługiwana walidacja:** Sprawdzenie statusu sesji użytkownika (np. poprzez Supabase).
- **Typy:** Potencjalnie typy związane z sesją użytkownika Supabase.
- **Propsy:** Standardowe propsy strony Astro.

### `HomePageLayout` (`src/layouts/MarketingLayout.astro`)

- **Opis komponentu:** Podstawowy layout dla stron marketingowych, w tym strony głównej. Zapewnia spójną strukturę, np. umieszczenie nagłówka.
- **Główne elementy:** `<slot />` do renderowania treści strony, komponent `HeaderUnauthenticated`.
- **Obsługiwane interakcje:** Brak bezpośrednich.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Standardowe propsy layoutu Astro.
- **Propsy:** `title` (string, opcjonalny).

### `HeaderUnauthenticated` (`src/components/MarketingHeader.astro`)

- **Opis komponentu:** Nagłówek wyświetlany niezalogowanym użytkownikom na stronach marketingowych. Zawiera logo i nazwę aplikacji.
- **Główne elementy:** Komponent `AppLogo`, element tekstowy na nazwę aplikacji.
- **Obsługiwane interakcje:** Brak (elementy nawigacyjne, jeśli będą, będą standardowymi linkami).
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych.
- **Propsy:** Brak.

### `AppLogo` (`src/components/AppLogo.astro`)

- **Opis komponentu:** Wyświetla logo aplikacji. Może to być obrazek SVG lub komponent `Image` z Astro.
- **Główne elementy:** `<img>` lub `<svg>` lub Astro `<Image>`.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:** `className` (string, opcjonalny) do stylizacji.

### `MainPageContent` (`src/components/landing/MainPageContent.astro`)

- **Opis komponentu:** Główna sekcja treści na stronie `/` dla niezalogowanych użytkowników. Prezentuje wartość aplikacji i przyciski akcji.
- **Główne elementy:** Sekcja "Hero" z tekstem marketingowym, przyciski "Logowanie" i "Rejestracja".
- **Obsługiwane interakcje:** Kliknięcie przycisków CTA.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:** Brak.

### `LoginButton` (instancja `src/components/ui/Button.tsx`)

- **Opis komponentu:** Przycisk kierujący do strony logowania. Wykorzystuje komponent `Button` z biblioteki Shadcn/ui.
- **Główne elementy:** Opakowuje komponent `Button` z Shadcn/ui.
- **Obsługiwane interakcje:** `onClick` (nawigacja do `/login`).
- **Obsługiwana walidacja:** Brak po stronie tego komponentu.
- **Typy:** Standardowe propsy komponentu `Button` z Shadcn/ui.
- **Propsy:** `variant`, `size`, `children` (tekst przycisku), `asChild` (jeśli używamy jako link).

### `RegisterButton` (instancja `src/components/ui/Button.tsx`)

- **Opis komponentu:** Przycisk kierujący do strony rejestracji. Wykorzystuje komponent `Button` z biblioteki Shadcn/ui.
- **Główne elementy:** Opakowuje komponent `Button` z Shadcn/ui.
- **Obsługiwane interakcje:** `onClick` (nawigacja do `/register`).
- **Obsługiwana walidacja:** Brak po stronie tego komponentu.
- **Typy:** Standardowe propsy komponentu `Button` z Shadcn/ui.
- **Propsy:** `variant`, `size`, `children` (tekst przycisku), `asChild` (jeśli używamy jako link).

## 5. Typy

Dla tego konkretnego widoku nie są wymagane żadne nowe, złożone typy DTO ani ViewModel poza tymi, które mogą być używane wewnętrznie przez Supabase do zarządzania sesją użytkownika.

- **`SupabaseSession` (koncepcyjny):** Obiekt reprezentujący sesję użytkownika z Supabase, używany do sprawdzenia, czy użytkownik jest zalogowany. Pola takie jak `user` mogą być istotne.

## 6. Zarządzanie stanem

Zarządzanie stanem dla tego widoku jest minimalne i dotyczy głównie statusu autentykacji użytkownika.

- **Status autentykacji:** Sprawdzany po stronie serwera w `src/pages/index.astro` (preferowane) przy użyciu danych sesji Supabase (np. z cookies) lub w Astro middleware.

  ```typescript
  // Przykład logiki w src/pages/index.astro
  // import { supabase } from '../db/supabase'; // lub klient serwerowy Supabase
  // const { data: { session } } = await supabase.auth.getSession(); // lub odpowiednik serwerowy
  // if (session) {
  //   return Astro.redirect('/app');
  // }
  ```

- Nie jest wymagany dedykowany customowy hook Reacta dla tego widoku, ponieważ logika głównie odbywa się po stronie Astro (serwer) lub przez proste skrypty klienckie do nawigacji.

## 7. Integracja API

Ten widok nie wykonuje bezpośrednich wywołań do API zdefiniowanych w `api-plan.md` (np. `/api/flashcards`).
Integracja dotyczy systemu autentykacji Supabase:

- **Sprawdzenie sesji:** Wykorzystanie SDK Supabase (serwerowego lub klienckiego) do pobrania aktualnej sesji użytkownika.
  - Na serwerze (w `src/pages/index.astro` lub middleware): Dostęp do sesji poprzez cookies lub serwerowy klient Supabase.
  - Jeśli konieczne na kliencie (mniej preferowane dla początkowego przekierowania):

      ```javascript
      // import { supabase } from '../db/supabase'; // klient kliencki
      // supabase.auth.getSession().then(({ data: { session } }) => {
      //   if (session) {
      //     window.location.href = '/app';
      //   }
      // });
      ```

- **Typy żądania/odpowiedzi:** Zależne od implementacji Supabase SDK (np. `AuthSession`).

## 8. Interakcje użytkownika

- **Wejście na stronę `/` (niezalogowany):**
  - Użytkownik widzi nazwę aplikacji, logo, krótki opis wartości oraz przyciski "Logowanie" i "Rejestracja".
- **Kliknięcie przycisku "Logowanie":**
  - Użytkownik jest przekierowywany na stronę `/login`.
- **Kliknięcie przycisku "Rejestracja":**
  - Użytkownik jest przekierowywany na stronę `/register`.
- **Wejście na stronę `/` (zalogowany):**
  - Użytkownik jest automatycznie przekierowywany na stronę `/app`. Może pojawić się krótki stan ładowania, jeśli sprawdzanie autentykacji jest asynchroniczne i wykonywane po stronie klienta (czego staramy się unikać na rzecz logiki serwerowej).

## 9. Warunki i walidacja

- **Główny warunek:** Status autentykacji użytkownika.
  - **Weryfikacja:** Po stronie serwera (w `src/pages/index.astro` lub middleware) poprzez sprawdzenie sesji Supabase.
  - **Wpływ na interfejs:**
    - Jeśli zalogowany: Przekierowanie do `/app`.
    - Jeśli niezalogowany: Wyświetlenie treści strony głównej z opcjami logowania/rejestracji.

## 10. Obsługa błędów

- **Błąd sprawdzania sesji Supabase (np. problem z siecią, niedostępność usługi Supabase):**
  - **Obsługa (serwer):** Jeśli sprawdzanie sesji na serwerze zawiedzie, system powinien domyślnie traktować użytkownika jako niezalogowanego i wyświetlić standardową stronę główną. Błąd powinien być logowany po stronie serwera.
  - **Obsługa (klient, jeśli używany):** Podobnie, traktuj użytkownika jako niezalogowanego. Zaloguj błąd w konsoli deweloperskiej.
- **Nieudane przekierowanie (bardzo mało prawdopodobne przy standardowych metodach):**
  - **Obsługa:** Użytkownik pozostałby na stronie `/`. Jeśli strona jest poprawnie zaimplementowana dla niezalogowanych użytkowników, nie powinno to stanowić krytycznego problemu.

## 11. Kroki implementacji

1. **Przygotowanie środowiska Astro:**
    - Upewnij się, że projekt Astro jest skonfigurowany z React (`@astrojs/react`) i Tailwind CSS.
    - Zainicjuj Shadcn/ui w projekcie, jeśli jeszcze nie zostało to zrobione (`npx shadcn-ui@latest init`).
    - Dodaj komponent `Button` z Shadcn/ui (`npx shadcn-ui@latest add button`).
    - Skonfiguruj integrację z Supabase (kliencką i serwerową, jeśli to możliwe, np. poprzez zmienne środowiskowe).

2. **Implementacja logiki autentykacji i przekierowania w `src/pages/index.astro`:**
    - Dodaj skrypt po stronie serwera (w sekcji frontmatter `---`) do sprawdzania sesji Supabase.
    - Użyj `Astro.redirect('/app')` jeśli użytkownik jest zalogowany.
    - Przykład:

        ```astro
        ---
        import MarketingLayout from '../layouts/MarketingLayout.astro';
        import MainPageContent from '../components/landing/MainPageContent.astro';
        // import { supabase } from '../db/supabase'; // Załóżmy, że masz klienta Supabase
                                                  // zdolnego do działania na serwerze
                                                  // lub odpowiednią konfigurację dla Astro

        // const session = await supabase.auth.getSession(); // Logika do pobrania sesji
        // if (session && session.data.session) {
        //   return Astro.redirect('/app');
        // }

        // Symulacja dla celów demonstracyjnych - zastąp rzeczywistą logiką Supabase
        const isAuthenticated = false; // Zastąp to rzeczywistym sprawdzeniem sesji
        if (isAuthenticated) {
          return Astro.redirect('/app');
        }
        ---
        <MarketingLayout title="Witaj w 10xdevs-fishes-cards!">
          <MainPageContent />
        </MarketingLayout>
        ```

    - *Alternatywa:* Rozważ użycie Astro Middleware (`src/middleware/index.ts`) dla czystszej obsługi przekierowań na podstawie autentykacji dla wielu stron.

3. **Stworzenie Layoutu (`src/layouts/MarketingLayout.astro`):**
    - Utwórz prosty layout zawierający `<slot />` oraz komponent `MarketingHeader.astro`.
    - Może zawierać podstawowe tagi `<html>`, `<head>` (z `title`), `<body>`.

4. **Stworzenie Nagłówka (`src/components/MarketingHeader.astro`):**
    - Dodaj komponent `AppLogo.astro` i tekst z nazwą aplikacji.
    - Stylizuj za pomocą Tailwind CSS.

5. **Stworzenie Komponentu Logo (`src/components/AppLogo.astro`):**
    - Implementuj wyświetlanie logo (np. jako SVG inline lub plik obrazu).

6. **Stworzenie Głównej Treści Strony (`src/components/landing/MainPageContent.astro`):**
    - Dodaj sekcję "Hero" z krótkim opisem wartości aplikacji.
    - Dodaj przyciski (jako komponenty Astro lub bezpośrednio komponenty React `Button` z `client:load`):
        - Przycisk "Logowanie" (`<a href="/login">...</a>` ostylowany jako przycisk Shadcn).
        - Przycisk "Rejestracja" (`<a href="/register">...</a>` ostylowany jako przycisk Shadcn).
    - Do stylizacji użyj Tailwind CSS. Można opakować przyciski Shadcn/ui w komponenty Astro lub użyć ich bezpośrednio jako komponenty React z odpowiednią dyrektywą `client:`.
    - Przykład użycia przycisku Shadcn/ui jako linku w Astro:

        ```astro
        ---
        import { Button } from '@/components/ui/button'; // Upewnij się, że ścieżka jest poprawna
        ---
        <a href="/login">
          <Button variant="outline">Logowanie</Button>
        </a>
        <a href="/register">
          <Button>Rejestracja</Button>
        </a>
        ```

7. **Styling:**
    - Dostosuj wygląd strony i komponentów za pomocą Tailwind CSS, aby był minimalistyczny i skupiony na konwersji.
    - Zapewnij odpowiedni kontrast i responsywność.

8. **Dostępność (A11y):**
    - Użyj semantycznych tagów HTML.
    - Zapewnij poprawną strukturę nagłówków (H1, H2 itd.).
    - Upewnij się, że wszystkie interaktywne elementy (linki, przyciski) są dostępne z klawiatury i mają wyraźne stany focus.
    - Sprawdź kontrast kolorów.

9. **Testowanie:**
    - Przetestuj przekierowanie dla zalogowanych użytkowników.
    - Przetestuj wyświetlanie strony dla niezalogowanych użytkowników.
    - Sprawdź działanie linków do logowania i rejestracji.
    - Przetestuj responsywność na różnych rozmiarach ekranu.
    - Przetestuj dostępność (np. nawigacja klawiaturą).
