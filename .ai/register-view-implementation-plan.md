# Plan implementacji widoku Rejestracja Użytkownika

## 1. Przegląd

Widok Rejestracji Użytkownika ma na celu umożliwienie nowym użytkownikom założenia konta w systemie. Strona będzie zawierać formularz do wprowadzenia adresu email, hasła, potwierdzenia hasła oraz checkbox do akceptacji polityki prywatności. Interfejs użytkownika będzie wykorzystywał komponenty Shadcn/ui, zapewniał walidację po stronie klienta i serwera oraz informował o wynikach operacji za pomocą powiadomień toast.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką: `/register`

## 3. Struktura komponentów

```text
    src/pages/register.astro
    └── RegisterPageLayout.astro (lub istniejący BaseLayout.astro)
        ├── HeaderUnauthenticated (React Component - src/components/layout/HeaderUnauthenticated.tsx)
        └── RegisterPageViewComponent (React Component, client:load - src/components/auth/RegisterPageView.tsx)
            └── RegistrationForm (React Component - src/components/auth/RegistrationForm.tsx)
                ├── Shadcn/ui Card (opcjonalnie, do grupowania)
                │   ├── CardHeader, CardTitle, CardDescription
                │   └── CardContent
                │       └── Shadcn/ui Form (zintegrowany z react-hook-form i Zod)
                │           ├── Email Field (FormField, FormItem, FormLabel, FormControl<Input>, FormMessage)
                │           ├── Password Field (FormField, FormItem, FormLabel, FormControl<Input type="password">, FormMessage)
                │           ├── Confirm Password Field (FormField, FormItem, FormLabel, FormControl<Input type="password">, FormMessage)
                │           └── Privacy Policy Field
                │               ├── Shadcn/ui Checkbox (wewnątrz FormField, FormItem)
                │               └── PrivacyPolicyLink (React Component - src/components/common/PrivacyPolicyLink.tsx)
                └── Shadcn/ui Button (Submit, wewnątrz Form lub CardFooter)
```

Globalnie, w głównym layoucie aplikacji, powinien znajdować się `Toaster` z Shadcn/ui.

## 4. Szczegóły komponentów

### `RegisterPageLayout.astro` (lub `BaseLayout.astro`)

- **Opis komponentu:** Główny layout strony Astro, który będzie zawierał podstawową strukturę HTML (`<head>`, `<body>`), nagłówek dla niezalogowanego użytkownika oraz `slot` na właściwą treść strony rejestracji.
- **Główne elementy:** Standardowe tagi HTML, komponent `HeaderUnauthenticated`, `<slot />`.
- **Obsługiwane interakcje:** Nawigacja poprzez nagłówek.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Props dla metadanych (np. `title: string`).
- **Props:** `{ title: string }`.

### `src/pages/register.astro`

- **Opis komponentu:** Strona Astro definiująca ścieżkę `/register`. Renderuje `RegisterPageLayout` i osadza w nim interaktywny komponent React `RegisterPageViewComponent`.
- **Główne elementy:** Import `RegisterPageLayout`, import `RegisterPageViewComponent`.
- **Obsługiwane interakcje:** Brak bezpośrednich.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Props:** Brak.

### `HeaderUnauthenticated` (`src/components/layout/HeaderUnauthenticated.tsx`)

- **Opis komponentu:** Komponent React wyświetlający nagłówek dla niezalogowanych użytkowników. Może zawierać logo aplikacji i linki, np. do strony logowania.
- **Główne elementy:** Elementy `div`, `nav`, `a` (lub komponenty Link z Astro/React Router, jeśli dotyczy).
- **Obsługiwane interakcje:** Kliknięcie w linki nawigacyjne.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Props:** Brak (lub opcjonalne propsy konfiguracyjne).

### `RegisterPageViewComponent` (`src/components/auth/RegisterPageView.tsx`)

- **Opis komponentu:** Główny komponent React dla widoku rejestracji, renderowany z opcją `client:load`. Zarządza stanem procesu rejestracji (ładowanie, błędy API), obsługuje logikę wywołania Supabase Auth SDK i wyświetla `RegistrationForm`. Wykorzystuje `useToast` do powiadomień.
- **Główne elementy:** Komponent `RegistrationForm`.
- **Obsługiwane interakcje:** Inicjowanie procesu rejestracji po otrzymaniu danych z `RegistrationForm`.
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji pól (delegowana do `RegistrationForm`), ale obsługuje błędy API.
- **Typy:** `RegisterFormData` (dla danych z formularza).
- **Props:** Brak.

### `RegistrationForm` (`src/components/auth/RegistrationForm.tsx`)

- **Opis komponentu:** Komponent React zawierający właściwy formularz rejestracyjny. Używa `react-hook-form` do zarządzania stanem formularza, Zod do walidacji schematu danych, oraz komponentów Shadcn/ui (`Form`, `FormField`, `Input`, `Checkbox`, `Button`) do budowy interfejsu.
- **Główne elementy:**
  - `Form` (Shadcn/ui, opakowujący `react-hook-form`)
  - Pola `FormField` (Shadcn/ui) dla:
    - Email (`Input`)
    - Hasło (`Input type="password"`)
    - Potwierdzenie hasła (`Input type="password"`)
    - Zgoda na politykę prywatności (`Checkbox` + `PrivacyPolicyLink`)
  - `Button` (Shadcn/ui) typu "submit" z obsługą stanu ładowania.
  - `FormMessage` (Shadcn/ui) do wyświetlania błędów walidacji przy polach.
  - Opcjonalny `Alert` lub tekst do wyświetlania `apiError`.
- **Obsługiwane interakcje:** Wprowadzanie danych przez użytkownika, zaznaczanie checkboxa, kliknięcie przycisku "Zarejestruj".
- **Obsługiwana walidacja (przez Zod schema):**
  - `email`: wymagany, musi być poprawnym adresem email.
  - `password`: wymagany, minimum 8 znaków (lub zgodnie z ustaleniami).
  - `confirmPassword`: wymagany, musi być identyczny z polem `password`.
  - `privacyPolicyAccepted`: wymagany, checkbox musi być zaznaczony (`true`).
- **Typy:** `RegisterFormData`, `RegistrationFormProps`.
- **Props:**
  - `onSubmit: (data: RegisterFormData) => Promise<void>`: Funkcja wywoływana po pomyślnej walidacji i przesłaniu formularza.
  - `isLoading: boolean`: Informuje, czy trwa operacja rejestracji.
  - `apiError: string | null`: Komunikat błędu zwrócony z API (Supabase) lub inny błąd nie-walidacyjny.

### `PrivacyPolicyLink` (`src/components/common/PrivacyPolicyLink.tsx`)

- **Opis komponentu:** Mały, reużywalny komponent React renderujący link do strony polityki prywatności.
- **Główne elementy:** Element `a`.
- **Obsługiwane interakcje:** Kliknięcie w link.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `PrivacyPolicyLinkProps`.
- **Props:**
  - `href: string`: URL do strony polityki prywatności.
  - `children?: React.ReactNode`: Tekst linku (opcjonalnie, domyślnie np. "polityki prywatności").

## 5. Typy

### `RegisterFormData` (ViewModel)

```typescript
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  privacyPolicyAccepted: boolean;
}
```

- `email`: Adres email użytkownika.
- `password`: Wybrane przez użytkownika hasło.
- `confirmPassword`: Powtórzone hasło do weryfikacji.
- `privacyPolicyAccepted`: Status akceptacji polityki prywatności.

### `RegistrationFormProps` (Props dla `RegistrationForm`)

```typescript
export interface RegistrationFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isLoading: boolean;
  apiError: string | null;
}
```

### `PrivacyPolicyLinkProps` (Props dla `PrivacyPolicyLink`)

```typescript
export interface PrivacyPolicyLinkProps {
  href: string;
  children?: React.ReactNode;
}
```

## 6. Zarządzanie stanem

- **Stan lokalny komponentu `RegisterPageViewComponent.tsx`:**
  - `isLoading: boolean`: Przechowuje stan ładowania podczas komunikacji z Supabase. Inicjalizowany na `false`.
  - `apiError: string | null`: Przechowuje komunikat błędu z API Supabase, jeśli wystąpi. Inicjalizowany na `null`.
- **Zarządzanie stanem formularza:** Biblioteka `react-hook-form` będzie użyta w komponencie `RegistrationForm.tsx` do zarządzania wartościami pól, stanem walidacji (dla każdego pola indywidualnie) oraz stanem przesyłania formularza.
  - Schemat walidacji zostanie zdefiniowany przy użyciu biblioteki `Zod`.
- **Powiadomienia (Toasts):** Hook `useToast` z Shadcn/ui będzie używany w `RegisterPageViewComponent.tsx` do wyświetlania komunikatów o sukcesie lub błędzie operacji rejestracji.

## 7. Integracja API

Interakcja z backendem w celu rejestracji użytkownika będzie realizowana za pomocą Supabase Auth JavaScript SDK. Nie ma potrzeby tworzenia niestandardowego endpointu API dla samej rejestracji.

- **Miejsce wywołania:** `RegisterPageViewComponent.tsx`, wewnątrz funkcji obsługującej `onSubmit` z `RegistrationForm`.
- **Metoda Supabase SDK:** `supabase.auth.signUp(credentials)`
- **Parametry (Credentials):**

  ```typescript
  interface SignUpWithPasswordCredentials {
    email: string;
    password: string;
    options?: {
      emailRedirectTo?: string; // URL, na który użytkownik zostanie przekierowany po kliknięciu linku weryfikacyjnego w emailu
      data?: object; // Dodatkowe metadane użytkownika
    };
  }
  ```

  W naszym przypadku, `email` i `password` będą pochodzić z `RegisterFormData`.
  `emailRedirectTo` powinno być skonfigurowane na URL w aplikacji, np. `window.location.origin + '/auth/callback'` lub inna strona docelowa.

- **Odpowiedź Supabase SDK:**

  ```typescript
  interface AuthResponse {
    data: {
      user: User | null;
      session: Session | null;
    };
    error: AuthError | null;
  }
  ```

  - `data.user`: Obiekt użytkownika, jeśli tworzenie/logowanie się powiodło.
  - `data.session`: Obiekt sesji, jeśli tworzenie/logowanie się powiodło.
  - `error`: Obiekt `AuthError` w przypadku błędu. `error.message` będzie zawierał czytelny dla użytkownika komunikat.

- **Obsługa odpowiedzi:**
  - **Sukces (`error === null`):**
    - Wyświetlić toast o sukcesie (np. "Rejestracja pomyślna! Sprawdź email, aby potwierdzić konto.").
    - Opcjonalnie przekierować użytkownika (np. na stronę logowania lub stronę informującą o konieczności sprawdzenia emaila).
  - **Błąd (`error !== null`):**
    - Ustawić `apiError` na `error.message`.
    - Wyświetlić toast z błędem (`variant: "destructive"`).

## 8. Interakcje użytkownika

1. **Wprowadzanie danych:** Użytkownik wpisuje dane w pola formularza (email, hasło, potwierdzenie hasła).
   - Wynik: Dane są widoczne w polach. Walidacja `react-hook-form` może pokazywać błędy na bieżąco (on change/on blur).
2. **Zaznaczenie checkboxa "Akceptuję politykę prywatności":**
   - Wynik: Checkbox zmienia stan.
3. **Kliknięcie linku "polityki prywatności":**
   - Wynik: Użytkownik jest przekierowywany na stronę `/privacy-policy` (lub inny zdefiniowany URL).
4. **Kliknięcie przycisku "Zarejestruj":**
   - **Jeśli walidacja po stronie klienta (Zod) nie powiedzie się:**
     - Wynik: Komunikaty o błędach są wyświetlane pod odpowiednimi polami. Formularz nie jest wysyłany. Przycisk nie pokazuje stanu ładowania.
   - **Jeśli walidacja po stronie klienta powiedzie się:**
     - Wynik: `isLoading` ustawiane na `true`. Przycisk "Zarejestruj" pokazuje wskaźnik ładowania i jest zablokowany. Wywoływana jest funkcja `supabase.auth.signUp`.
     - **Po odpowiedzi z Supabase (sukces):**
       - `isLoading` ustawiane na `false`.
       - Toast o sukcesie rejestracji jest wyświetlany.
       - Użytkownik może zostać przekierowany.
     - **Po odpowiedzi z Supabase (błąd):**
       - `isLoading` ustawiane na `false`.
       - `apiError` jest ustawiany komunikatem błędu z Supabase.
       - Toast z błędem jest wyświetlany.
       - Komunikat `apiError` może być wyświetlony globalnie dla formularza.

## 9. Warunki i walidacja

Walidacja będzie odbywać się na dwóch poziomach: po stronie klienta (w przeglądarce) oraz po stronie serwera (przez Supabase).

- **Walidacja po stronie klienta (w `RegistrationForm.tsx` przy użyciu `Zod` i `react-hook-form`):**
  - **Email (`email`):**
    - Warunek: Wymagane. Musi być poprawnym formatem adresu email.
    - Wpływ na UI: Komunikat błędu (`FormMessage`) pod polem email, jeśli niepoprawne.
  - **Hasło (`password`):**
    - Warunek: Wymagane. Minimalna długość 8 znaków.
    - Wpływ na UI: Komunikat błędu pod polem hasła.
  - **Potwierdzenie hasła (`confirmPassword`):**
    - Warunek: Wymagane. Musi być identyczne z wartością pola `password`.
    - Wpływ na UI: Komunikat błędu pod polem potwierdzenia hasła.
  - **Polityka prywatności (`privacyPolicyAccepted`):**
    - Warunek: Wymagane. Checkbox musi być zaznaczony (wartość `true`).
    - Wpływ na UI: Komunikat błędu pod checkboxem (lub obok), jeśli nie zaznaczony.
- **Walidacja po stronie serwera (Supabase Auth):**
  - Unikalność adresu email.
  - Wymagania dotyczące siły hasła (jeśli skonfigurowane w Supabase).
  - Inne reguły bezpieczeństwa Supabase.
  - Wpływ na UI: Błędy zwrócone przez Supabase będą wyświetlane jako `apiError` i w toaście.

## 10. Obsługa błędów

- **Błędy walidacji pól formularza:** Obsługiwane przez `react-hook-form` i Zod. Komunikaty są wyświetlane bezpośrednio przy polach za pomocą komponentu `FormMessage` z Shadcn/ui.
- **Błędy API (z Supabase Auth):**
  - Przechwytywane w bloku `catch` po wywołaniu `supabase.auth.signUp`.
  - Wiadomość błędu (`error.message`) zostanie zapisana w stanie `apiError`.
  - Użytkownik zostanie poinformowany za pomocą komponentu `Toast` (Shadcn/ui) z `variant: "destructive"`.
  - Komunikat `apiError` może być również wyświetlony w widocznym miejscu formularza (np. nad przyciskiem "Zarejestruj").
- **Przykładowe błędy API i ich obsługa:**
  - `User already registered`: Komunikat "Użytkownik o tym adresie email już istnieje. Czy chcesz się zalogować?".
  - `Password should be stronger/longer`: Komunikat "Hasło jest zbyt słabe. Spróbuj dłuższego lub bardziej złożonego hasła."
  - Ogólne błędy sieci/serwera: Komunikat "Wystąpił nieoczekiwany błąd podczas rejestracji. Spróbuj ponownie później."
- **Stan ładowania:** Przycisk "Zarejestruj" będzie miał wskaźnik ładowania i będzie nieaktywny (`disabled`) podczas trwania operacji API, aby zapobiec wielokrotnemu przesyłaniu formularza.

## 11. Kroki implementacji

1. **Przygotowanie środowiska Supabase:**
   - Upewnić się, że projekt Supabase jest skonfigurowany.
   - Zanotować `SUPABASE_URL` i `SUPABASE_ANON_KEY`.
   - Skonfigurować opcje autentykacji w Supabase (np. włączyć/wyłączyć potwierdzenie email, ustawić `Email redirect URL` na odpowiednią wartość, np. `http://localhost:4321/auth/callback` dla dewelopmentu).
2. **Stworzenie typów:**
   - Zdefiniować interfejsy `RegisterFormData`, `RegistrationFormProps`, `PrivacyPolicyLinkProps` w `src/types.ts` lub dedykowanym pliku (np. `src/components/auth/types.ts`).
3. **Implementacja komponentu `PrivacyPolicyLink.tsx`:**
   - Stworzyć prosty komponent React wyświetlający link.
4. **Implementacja schematu walidacji Zod:**
   - Stworzyć schemat Zod dla `RegisterFormData` (np. w `src/components/auth/validation.ts` lub bezpośrednio w `RegistrationForm.tsx`).
5. **Implementacja komponentu `RegistrationForm.tsx`:**
   - Zainstalować `react-hook-form` i `zod`.
   - Użyć komponentów Shadcn/ui: `Form`, `Card` (opcjonalnie), `Input`, `Checkbox`, `Button`.
   - Zintegrować `react-hook-form` z Zod (`zodResolver`).
   - Stworzyć pola formularza dla email, hasła, potwierdzenia hasła, i checkboxa polityki prywatności z linkiem.
   - Implementować wyświetlanie błędów walidacji (`FormMessage`).
   - Przekazać `isLoading` i `apiError` jako propsy i odpowiednio nimi zarządzać (np. stan ładowania na przycisku, wyświetlanie `apiError`).
   - Wywołać `props.onSubmit` z danymi formularza.
6. **Implementacja komponentu `RegisterPageViewComponent.tsx`:**
   - Zarządzać stanami `isLoading` i `apiError`.
   - Stworzyć klienta Supabase (`createClient` z `@supabase/supabase-js`).
   - Zaimplementować funkcję `handleRegister` (lub `onSubmit` przekazywaną do `RegistrationForm`):
     - Ustawić `isLoading(true)`, `setApiError(null)`.
     - Wywołać `supabase.auth.signUp()` z danymi z formularza.
     - Obsłużyć odpowiedź (sukces/błąd) i zaktualizować stan (`isLoading`, `apiError`).
     - Użyć `useToast` do wyświetlania powiadomień.
     - Opcjonalnie, obsłużyć przekierowanie po sukcesie (`window.location.href = ...`).
   - Renderować `RegistrationForm`, przekazując odpowiednie propsy.
7. **Implementacja nagłówka `HeaderUnauthenticated.tsx`:**
   - Stworzyć komponent nagłówka z linkami, np. do strony logowania.
8. **Stworzenie layoutu `RegisterPageLayout.astro` (lub modyfikacja `BaseLayout.astro`):**
   - Dodać `HeaderUnauthenticated` i `<slot />`.
   - Upewnić się, że `Toaster` z Shadcn/ui jest skonfigurowany globalnie (prawdopodobnie w głównym layoucie aplikacji).
9. **Stworzenie strony `src/pages/register.astro`:**
   - Użyć `RegisterPageLayout`.
   - Osadzić `RegisterPageViewComponent` z atrybutem `client:load`.
10. **Konfiguracja routingu dla polityki prywatności:**
    - Upewnić się, że istnieje strona `/privacy-policy` (lub inna zdefiniowana) i link w `PrivacyPolicyLink` jest poprawny.
11. **Stylowanie:**
    - Dostosować style za pomocą Tailwind CSS, aby zapewnić spójny wygląd z resztą aplikacji. Komponenty Shadcn/ui są już częściowo ostylowane, ale mogą wymagać dostosowań.
12. **Testowanie:**
    - Przetestować wszystkie scenariusze:
      - Poprawna rejestracja.
      - Błędy walidacji pól.
      - Email już istnieje.
      - Niepoprawne hasło (np. zbyt krótkie, jeśli Supabase tego wymaga).
      - Niezaznaczony checkbox polityki prywatności.
      - Działanie linku do polityki prywatności.
      - Wygląd i responsywność na różnych urządzeniach.
      - Dostępność (nawigacja klawiaturą, czytniki ekranu).
13. **Obsługa przekierowania po weryfikacji email (jeśli dotyczy):**
    - Jeśli włączone jest potwierdzenie email, utworzyć stronę callback (np. `/auth/callback`), która obsłuży token weryfikacyjny od Supabase (Supabase SDK może to ułatwić).
