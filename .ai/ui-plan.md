# Architektura UI dla 10xdevs-fishes-cards

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) dla aplikacji 10xdevs-fishes-cards została zaprojektowana w celu zapewnienia intuicyjnej i efektywnej obsługi głównych funkcjonalności produktu: generowania fiszek za pomocą AI, ręcznego tworzenia i zarządzania fiszkami oraz dostępu do informacji pomocniczych. Aplikacja wykorzystuje podejście hybrydowe z Astro do serwowania stron statycznych i ogólnego layoutu oraz React do dynamicznych "wysp komponentów" (np. zarządzanie fiszkami, generowanie AI). Nawigacja jest scentralizowana w dynamicznym headerze oraz systemie zakładek dla zalogowanych użytkowników. Kluczowe komponenty UI pochodzą z biblioteki Shadcn/ui, stylizowanej za pomocą Tailwind CSS. Zarządzanie stanem globalnym aplikacji (dane użytkownika, fiszki, sugestie AI) realizowane jest przez Zustand. Priorytetem jest wersja desktopowa, z zapewnieniem podstawowej responsywności (RWD) dla tabletów.

## 2. Lista widoków

Poniżej przedstawiono listę kluczowych widoków aplikacji:

---

### a. Strona Główna
- **Nazwa widoku:** Strona Główna
- **Ścieżka widoku:** `/` (może przekierowywać do `/login` lub `/register` dla niezalogowanych lub `/app` dla zalogowanych)
- **Główny cel:** Pierwszy punkt kontaktu z aplikacją. Informowanie o aplikacji i kierowanie do logowania/rejestracji lub bezpośrednio do aplikacji, jeśli użytkownik jest zalogowany.
- **Kluczowe informacje do wyświetlenia:**
    - Nazwa aplikacji i logo.
    - Krótki opis wartości aplikacji.
    - Przyciski/linki do logowania i rejestracji (jeśli użytkownik nie jest zalogowany).
- **Kluczowe komponenty widoku:**
    - `Header` (wersja dla niezalogowanego)
    - `Button` (Shadcn/ui)
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Jasne wezwania do działania (CTA). Minimalistyczny design skupiony na konwersji (rejestracja/logowanie).
    - **Dostępność:** Poprawna struktura nagłówków, kontrast, nawigacja klawiaturą do linków/przycisków.
    - **Bezpieczeństwo:** Strona głównie informacyjna; przekierowania zarządzane po stronie serwera lub klienta w Astro.

---

### b. Strona Rejestracji
- **Nazwa widoku:** Rejestracja Użytkownika
- **Ścieżka widoku:** `/register`
- **Główny cel:** Umożliwienie nowym użytkownikom założenia konta w systemie.
- **Kluczowe informacje do wyświetlenia:**
    - Formularz rejestracji (email, hasło, potwierdzenie hasła).
    - Checkbox akceptacji polityki prywatności.
    - Link do strony polityki prywatności.
    - Komunikaty o błędach walidacji.
- **Kluczowe komponenty widoku:**
    - `Header` (wersja dla niezalogowanego)
    - `Form`, `FormField`, `Input`, `Checkbox` (Shadcn/ui)
    - `Button` "Zarejestruj" (Shadcn/ui) ze wskaźnikiem ładowania.
    - `Toast` (Shadcn/ui) do powiadomień o sukcesie/błędzie.
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Czytelne etykiety, walidacja po stronie klienta (np. format email, minimalna długość hasła, zgodność haseł) i serwera. Jasne komunikaty błędów przy polach. Wskaźnik ładowania na przycisku podczas wysyłania.
    - **Dostępność:** Etykiety `aria-label` dla pól formularza, `aria-live` dla komunikatów błędów. Poprawna kolejność fokusu.
    - **Bezpieczeństwo:** HTTPS. Hasła przesyłane bezpiecznie i hashowane po stronie serwera (Supabase Auth). Ochrona przed CSRF (standard w Astro/frameworkach). Walidacja po stronie serwera (np. unikalność email).

---

### c. Strona Logowania
- **Nazwa widoku:** Logowanie Użytkownika
- **Ścieżka widoku:** `/login`
- **Główny cel:** Umożliwienie zarejestrowanym użytkownikom dostępu do ich kont.
- **Kluczowe informacje do wyświetlenia:**
    - Formularz logowania (email, hasło).
    - Link do strony rejestracji.
    - Komunikaty o błędach.
- **Kluczowe komponenty widoku:**
    - `Header` (wersja dla niezalogowanego)
    - `Form`, `FormField`, `Input` (Shadcn/ui)
    - `Button` "Zaloguj" (Shadcn/ui) ze wskaźnikiem ładowania.
    - `Toast` (Shadcn/ui) do powiadomień o błędach.
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Prosty i szybki proces logowania. Jasne komunikaty o błędach (np. "Nieprawidłowy email lub hasło"). Wskaźnik ładowania.
    - **Dostępność:** Jak w stronie rejestracji.
    - **Bezpieczeństwo:** HTTPS. Ochrona przed atakami brute-force (obsługiwane przez Supabase Auth).

---

### d. Główny Widok Aplikacji (Dashboard)
- **Nazwa widoku:** Panel Główny Aplikacji
- **Ścieżka widoku:** `/app` (strona Astro ładująca komponent React)
- **Główny cel:** Centralny interfejs dla zalogowanych użytkowników, umożliwiający dostęp do generowania fiszek AI i zarządzania własnymi fiszkami poprzez system zakładek.
- **Kluczowe informacje do wyświetlenia:**
    - Dynamiczny `Header` z danymi użytkownika i nawigacją.
    - `Tabs` (Shadcn/ui) do przełączania między "Generator AI" a "Moje Fiszki".
    - Zawartość aktywnej zakładki.
- **Kluczowe komponenty widoku:**
    - Dynamiczny `Header` (opisany w sekcji Nawigacja)
    - `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` (Shadcn/ui)
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Spójna i przewidywalna nawigacja. Szybkie przełączanie między głównymi funkcjami bez pełnego przeładowania strony.
    - **Dostępność:** Zakładki (`Tabs`) powinny być w pełni dostępne z klawiatury i czytników ekranu.
    - **Bezpieczeństwo:** Dostęp do `/app` chroniony (tylko dla zalogowanych użytkowników). Wszelkie operacje na danych użytkownika autoryzowane przez API (JWT, RLS w Supabase).

---

#### d.1. Pod-widok: Generator AI
- **Nazwa widoku:** Generator Fiszak AI
- **Ścieżka widoku:** `/app` (w ramach zakładki "Generator AI")
- **Główny cel:** Umożliwienie użytkownikowi wprowadzenia tekstu i wygenerowania na jego podstawie sugestii fiszek przy użyciu AI.
- **Kluczowe informacje do wyświetlenia:**
    - `Textarea` do wprowadzania tekstu źródłowego.
    - Licznik znaków (min. 1000, max. 10000).
    - Przycisk "Generuj" (aktywny/nieaktywny w zależności od długości tekstu).
    - Stan ładowania (np. `Skeleton` component).
    - Lista sugerowanych fiszek (każda jako edytowalna karta z pytaniem, odpowiedzią, przyciskami "Zapisz", "Odrzuć").
    - Komunikaty o błędach lub braku sugestii.
- **Kluczowe komponenty widoku:**
    - `Textarea` (Shadcn/ui)
    - `Button` "Generuj" (Shadcn/ui) ze wskaźnikiem ładowania i stanem `disabled`.
    - `Skeleton` (Shadcn/ui)
    - `Card` (Shadcn/ui) dla każdej sugestii, zawierająca `Input`/`Textarea` do edycji, `Button` "Zapisz", `Button` "Odrzuć".
    - `Toast` (Shadcn/ui) dla powiadomień.
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Interaktywny feedback (licznik znaków). Jasne wskazanie stanu ładowania. Łatwa edycja i zarządzanie sugestiami. Przycisk "Generuj" może być blokowany po udanej generacji dla danego tekstu, aby uniknąć przypadkowych powtórzeń, odblokowując się po zmianie tekstu.
    - **Dostępność:** `Textarea` i pola edycji sugestii odpowiednio oetykietowane. Zarządzanie fokusem przy pojawianiu się sugestii.
    - **Bezpieczeństwo:** Walidacja długości tekstu po stronie klienta i serwera (API `POST /api/flashcards/generate-ai`). Endpoint API chroniony.

---

#### d.2. Pod-widok: Moje Fiszki
- **Nazwa widoku:** Lista Moich Fiszek
- **Ścieżka widoku:** `/app` (w ramach zakładki "Moje Fiszki")
- **Główny cel:** Umożliwienie użytkownikowi przeglądania, wyszukiwania, ręcznego dodawania, edytowania i usuwania swoich fiszek.
- **Kluczowe informacje do wyświetlenia:**
    - Przycisk "Dodaj fiszkę" (manualnie).
    - Pole wyszukiwania (`Input`) i przycisk "Szukaj".
    - Lista fiszek użytkownika (każda jako `Card` z pytaniem, odpowiedzią, `Badge` "AI" jeśli dotyczy, przyciskami "Edytuj", "Usuń").
    - Paginacja, jeśli fiszek jest więcej niż 12.
    - Komunikat o braku fiszek lub braku wyników wyszukiwania.
- **Kluczowe komponenty widoku:**
    - `Button` "Dodaj fiszkę" (Shadcn/ui)
    - `Input` (Shadcn/ui) do wyszukiwania.
    - `Button` "Szukaj" (Shadcn/ui)
    - `Card` (Shadcn/ui) dla każdej fiszki.
    - `Badge` (Shadcn/ui) "AI".
    - `Button` "Edytuj", `Button` "Usuń" na każdej karcie.
    - `Pagination` (Shadcn/ui) z przyciskami "Poprzednia", "Następna".
    - `Dialog` (Shadcn/ui) do ręcznego tworzenia fiszki (z `Form`, `Input` na pytanie, `Textarea` na odpowiedź, `Button` "Zapisz").
    - `Dialog` (Shadcn/ui) do edycji fiszki (jak wyżej, wypełniony danymi).
    - `Dialog` (Shadcn/ui) do potwierdzenia usunięcia fiszki.
    - `Toast` (Shadcn/ui) dla powiadomień.
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Przejrzysta prezentacja fiszek. Limity znaków w formularzach tworzenia/edycji (pytanie: 255, odpowiedź: 1000) z walidacją. Intuicyjne działania CRUD. Automatyczne odświeżanie listy po operacjach. Sortowanie domyślne po dacie utworzenia (malejąco).
    - **Dostępność:** Karty, przyciski i elementy paginacji dostępne z klawiatury. Modale (`Dialog`) prawidłowo zarządzają fokusem.
    - **Bezpieczeństwo:** Operacje CRUD autoryzowane przez API (tylko na własnych fiszkach). Walidacja danych wejściowych formularzy po stronie klienta i serwera.

---

### e. Strona FAQ
- **Nazwa widoku:** Często Zadawane Pytania (FAQ)
- **Ścieżka widoku:** `/faq`
- **Główny cel:** Dostarczenie użytkownikom odpowiedzi na najczęściej pojawiające się pytania dotyczące aplikacji.
- **Kluczowe informacje do wyświetlenia:**
    - Lista pytań i odpowiedzi.
- **Kluczowe komponenty widoku:**
    - `Header` (dynamiczny, w zależności od stanu logowania)
    - (Opcjonalnie) `Accordion` (Shadcn/ui) dla sekcji Q&A.
    - Statyczna treść HTML.
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Łatwa do nawigacji i czytelna struktura.
    - **Dostępność:** Poprawna hierarchia nagłówków (H1, H2, itd.). Jeśli używany jest akordeon, musi być dostępny.
    - **Bezpieczeństwo:** Strona statyczna, brak specyficznych zagrożeń.

---

### f. Strona Kontaktu
- **Nazwa widoku:** Formularz Kontaktowy
- **Ścieżka widoku:** `/contact`
- **Główny cel:** Umożliwienie użytkownikom (zalogowanym i niezalogowanym) wysłania wiadomości do administratorów/obsługi aplikacji.
- **Kluczowe informacje do wyświetlenia:**
    - Formularz kontaktowy (adres email, temat (opcjonalnie), treść wiadomości).
    - Informacja o przetwarzaniu danych (jeśli dotyczy).
    - Komunikaty o sukcesie/błędzie wysłania.
- **Kluczowe komponenty widoku:**
    - `Header` (dynamiczny)
    - `Form`, `FormField`, `Input` (email, temat), `Textarea` (wiadomość) (Shadcn/ui)
    - `Button` "Wyślij" (Shadcn/ui) ze wskaźnikiem ładowania.
    - `Toast` (Shadcn/ui) do powiadomień.
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Prosty i jasny formularz. Walidacja po stronie klienta (np. format email, wymagana wiadomość). Informacja zwrotna po wysłaniu.
    - **Dostępność:** Poprawne etykiety dla pól formularza. Komunikaty błędów dostępne.
    - **Bezpieczeństwo:** Walidacja email po stronie serwera (API `POST /api/contact-submissions`). Potencjalna ochrona przed spamem (np. rate limiting na API lub captcha w przyszłości - poza MVP).

---

### g. Strona Polityki Prywatności
- **Nazwa widoku:** Polityka Prywatności
- **Ścieżka widoku:** `/privacy-policy`
- **Główny cel:** Przedstawienie użytkownikom zasad dotyczących gromadzenia, przetwarzania i ochrony danych osobowych.
- **Kluczowe informacje do wyświetlenia:**
    - Pełna treść polityki prywatności.
- **Kluczowe komponenty widoku:**
    - `Header` (dynamiczny)
    - Statyczna treść HTML.
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Czytelny i dobrze sformatowany tekst.
    - **Dostępność:** Poprawna struktura dokumentu, odpowiednie kontrasty.
    - **Bezpieczeństwo:** Strona statyczna.

## 3. Mapa podróży użytkownika

Opis kluczowych przepływów użytkownika przez aplikację:

1.  **Nowy użytkownik - Rejestracja i pierwsze użycie (Generowanie AI):**
    *   `/` -> `/register` (wypełnia formularz, akceptuje politykę, klika "Zarejestruj")
    *   Po poprawnej rejestracji automatycznie przekierowany na strone logowania `/login`
    *   Wpisuje login i haslo na stronie logowania `/login`
    *   Po poprawnym zalogowaniu przenoszony na `/app`
    *   W `/app` (zakładka "Generator AI"): wprowadza tekst (>1000 znaków), klika "Generuj".
    *   Widzi `Skeleton` / wskaźnik ładowania.
    *   Wyświetlają się sugerowane fiszki jako edytowalne karty.
    *   Edytuje i/lub klika "Zapisz" dla wybranych sugestii (toast potwierdza).
    *   Nawiguje do zakładki "Moje Fiszki".
    *   Widzi nowo zapisane fiszki na liście.

2.  **Istniejący użytkownik - Logowanie i ręczne tworzenie fiszki:**
    *   `/` -> `/login` (wypełnia formularz, klika "Zaloguj")
    *   Przekierowanie do `/app` (np. zakładka "Moje Fiszki")
    *   W `/app` (zakładka "Moje Fiszki"): klika "Dodaj fiszkę".
    *   Otwiera się `Dialog` z formularzem.
    *   Wypełnia pytanie i odpowiedź, klika "Zapisz" w dialogu.
    *   Dialog zamyka się, lista fiszek odświeża się, toast potwierdza.

3.  **Zarządzanie fiszkami (Edycja, Usuwanie, Przeglądanie, Wyszukiwanie):**
    *   Użytkownik w `/app` (zakładka "Moje Fiszki").
    *   **Przeglądanie:** Widzi listę fiszek, używa paginacji.
    *   **Wyszukiwanie:** Wpisuje termin w `Input`, klika "Szukaj", lista się filtruje.
    *   **Edycja:** Klika "Edytuj" na fiszce -> `Dialog` z formularzem -> modyfikuje -> "Zapisz" -> lista się odświeża, toast.
    *   **Usuwanie:** Klika "Usuń" na fiszce -> `Dialog` z potwierdzeniem -> "Usuń" -> lista się odświeża, toast.

4.  **Kontakt z obsługą:**
    *   Użytkownik (zalogowany lub nie) klika link "Kontakt" w `Header`.
    *   Przechodzi do `/contact`.
    *   Wypełnia formularz, klika "Wyślij".
    *   Widzi toast potwierdzający wysłanie.

## 4. Układ i struktura nawigacji

*   **Główny Layout (Astro):**
    *   Odpowiada za renderowanie `Header`, `Footer` oraz centralnej treści strony.
    *   Dla ścieżek chronionych (np. `/app`), Astro będzie sprawdzać stan autentykacji (np. z `authStore` Zustand lub middleware Astro) i ewentualnie przekierowywać do `/login`.

*   **Header (Komponent React/Astro):**
    *   **Niezalogowany użytkownik:**
        *   Logo (link do `/`)
        *   Linki: "FAQ" (`/faq`), "Kontakt" (`/contact`)
        *   Przyciski: "Zaloguj" (`/login`), "Zarejestruj" (`/register`)
    *   **Zalogowany użytkownik:**
        *   Logo (link do `/app`)
        *   Powitanie: "Cześć, [login użytkownika]!"
        *   Linki/Przyciski nawigacyjne do zakładek: "Generator AI", "Moje Fiszki" (kierują do `/app` i aktywują odpowiednią zakładkę w komponencie React)
        *   Linki: "FAQ" (`/faq`), "Kontakt" (`/contact`)
        *   Przycisk: "Wyloguj" (czyści stan w `authStore`, przekierowuje do `/login`)

*   **Nawigacja wewnątrz `/app` (Komponent React):**
    *   Komponent `Tabs` (Shadcn/ui) zawierający:
        *   Zakładkę "Generator AI" (wyświetla komponent Generatora AI)
        *   Zakładkę "Moje Fiszki" (wyświetla komponent Listy Fiszek)
    *   Routing pomiędzy zakładkami jest zarządzany po stronie klienta przez React, zmieniając wyświetlaną zawartość w ramach tej samej strony `/app` Astro.

*   **Footer (Komponent Astro/React):**
    *   Linki: "Polityka Prywatności" (`/privacy-policy`), Copyright.

## 5. Kluczowe komponenty (Shadcn/ui)

Poniżej lista kluczowych, reużywalnych komponentów z biblioteki Shadcn/ui, które będą fundamentem interfejsu:

*   **`Button`:** Standardowe przyciski do akcji (Zapisz, Usuń, Generuj, Zaloguj, itp.), warianty (primary, secondary, destructive), obsługa stanu ładowania/disabled.
*   **`Card`, `CardHeader`, `CardContent`, `CardFooter`:** Do wyświetlania pojedynczych fiszek, sugestii AI, oraz innych bloków treści.
*   **`Dialog`:** Modale do tworzenia/edycji fiszek, potwierdzania usunięcia, wyświetlania dodatkowych informacji bez opuszczania bieżącego widoku.
*   **`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`:** Struktura do budowy formularzy (rejestracja, logowanie, kontakt, tworzenie/edycja fiszek, generowanie AI). Zintegrowane z biblioteką do walidacji (np. `react-hook-form` z `zod`).
*   **`Input`:** Pola tekstowe dla email, hasła, pytań fiszek, wyszukiwania.
*   **`Textarea`:** Wieloliniowe pola tekstowe dla odpowiedzi fiszek, tekstu źródłowego AI, wiadomości kontaktowej.
*   **`Checkbox`:** Do akceptacji polityki prywatności.
*   **`Toast` (Toaster, useToast):** Dyskretne powiadomienia o sukcesie lub błędzie operacji.
*   **`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`:** Do nawigacji między głównymi sekcjami w widoku `/app` ("Generator AI", "Moje Fiszki").
*   **`Skeleton`:** Placeholder wyświetlany podczas ładowania danych (np. sugestii AI, listy fiszek).
*   **`Pagination`, `PaginationContent`, `PaginationItem`, `PaginationPrevious`, `PaginationNext`:** Do nawigacji po stronach listy fiszek.
*   **`Badge`:** Do oznaczania fiszek wygenerowanych przez AI ("AI").
*   **(Potencjalnie) `Select`:** Jeśli w przyszłości pojawi się potrzeba wyboru np. modelu AI lub kategorii fiszek (nie w MVP).
*   **(Potencjalnie) `Accordion`:** Dla sekcji FAQ.

Konsekwentne użycie tych komponentów zapewni spójny wygląd i działanie aplikacji, a także ułatwi rozwój i utrzymanie kodu. 