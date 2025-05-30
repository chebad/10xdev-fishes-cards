# Plan implementacji widoku Logowanie Użytkownika

## 1. Przegląd

Widok "Logowanie Użytkownika" umożliwia zarejestrowanym użytkownikom dostęp do ich kont w aplikacji 10xdevs-fishes-cards. Użytkownik podaje swój adres email i hasło, aby się zalogować. Widok obsługuje również wyświetlanie błędów logowania oraz link do strony rejestracji.

## 2. Routing widoku

Widok będzie dostępny pod następującą ścieżką:

- `/login`

## 3. Struktura komponentów

Struktura komponentów dla widoku logowania będzie następująca:

```text
/login (LoginPage.astro - Strona Astro)
└── MainLayout.astro (Layout główny)
    ├── HeaderUnauthenticated (Komponent Astro/React - Nagłówek dla niezalogowanych)
    │   └── Link do /register
    └── main (content)
        └── LoginForm.tsx (Komponent React Client-Side)
            ├── Shadcn/ui <Form> (zarządzanie formularzem z react-hook-form)
            │   ├── Shadcn/ui <FormField name="email">
            │   │   └── Shadcn/ui <Input type="email" placeholder="Email"/>
            │   ├── Shadcn/ui <FormField name="password">
            │   │   └── Shadcn/ui <Input type="password" placeholder="Hasło"/>
            │   └── Shadcn/ui <Button type="submit"> (Zaloguj)
            │       └── (wskaźnik ładowania wewnątrz przycisku)
            ├── Link "Nie masz konta? Zarejestruj się" (do /register)
            └── Shadcn/ui <Toast> (globalnie dostępny, do wyświetlania błędów)
```

## 4. Szczegóły komponentów

### `LoginPage.astro`

- **Opis komponentu:** Główny plik strony Astro dla ścieżki `/login`. Odpowiada za renderowanie layoutu i osadzenie komponentu `LoginForm`.
- **Główne elementy:** Wykorzystuje `MainLayout.astro` i renderuje `<LoginForm client:load />`.
- **Obsługiwane interakcje:** Nawigacja do strony.
- **Obsługiwana walidacja:** Brak na tym poziomie.
- **Typy:** Standardowe typy dla stron Astro.
- **Propsy:** Brak.

### `HeaderUnauthenticated` (Komponent Astro lub React)

- **Opis komponentu:** Wersja nagłówka strony wyświetlana dla niezalogowanych użytkowników. Powinna zawierać logo aplikacji oraz linki nawigacyjne, w tym do strony logowania i rejestracji.
- **Główne elementy:** Logo, link "Zaloguj się" (jeśli użytkownik nie jest na `/login`), link "Zarejestruj się".
- **Obsługiwane interakcje:** Kliknięcie na linki nawigacyjne.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Propsy definiujące elementy nawigacyjne.
- **Propsy:** `navItems: Array<{ href: string; label: string }>` (lub podobne).

### `LoginForm.tsx` (Komponent React)

- **Opis komponentu:** Interaktywny formularz logowania. Umożliwia użytkownikowi wprowadzenie adresu email i hasła, waliduje dane wejściowe po stronie klienta, obsługuje proces logowania za pomocą Supabase Auth i wyświetla komunikaty o błędach lub sukcesie.
- **Główne elementy HTML i komponenty dzieci:**
  - Zewnętrzny `div` jako kontener.
  - Komponent `Form` z Shadcn/ui, zintegrowany z `react-hook-form`.
  - Dwa komponenty `FormField` z Shadcn/ui dla pól email i hasła.
    - Każdy `FormField` zawiera `FormLabel`, `FormControl` z `Input` (Shadcn/ui) i `FormMessage` do wyświetlania błędów walidacji.
  - Komponent `Button` z Shadcn/ui do wysyłania formularza, z dynamicznym tekstem/wskaźnikiem ładowania.
  - Element `p` lub `Link` (Astro/React) zawierający link do strony rejestracji (`/register`).
- **Obsługiwane zdarzenia:**
  - `onSubmit` na formularzu: uruchamia logikę logowania.
  - `onChange` na polach `Input`: aktualizuje stan formularza (obsługiwane przez `react-hook-form`).
- **Warunki walidacji (zgodnie z Supabase i ogólnymi praktykami):**
  - **Email:**
    - Wymagane: Tak. Komunikat: "Adres email jest wymagany."
    - Format: Musi być poprawnym adresem email. Komunikat: "Nieprawidłowy format adresu email."
  - **Hasło:**
    - Wymagane: Tak. Komunikat: "Hasło jest wymagane."
    - Minimalna długość: (np. 6 znaków, zgodnie z domyślnymi Supabase, do weryfikacji). Komunikat: "Hasło musi mieć co najmniej X znaków."
- **Typy:**
  - `LoginFormData` (ViewModel): `{ email: string; password: string; }`
  - `LoginFormProps` (jeśli są jakieś zewnętrzne propsy, np. `supabaseClient: SupabaseClient`)
- **Propsy:**
  - `supabaseClient: SupabaseClient` (instancja klienta Supabase do interakcji z Auth).
  - `onLoginSuccess?: () => void` (opcjonalny callback po pomyślnym zalogowaniu, np. do przekierowania).

## 5. Typy

### `LoginFormData`

ViewModel reprezentujący dane z formularza logowania.

```typescript
export interface LoginFormData {
  email: string;
  password: string;
}
```

- `email: string`: Adres email podany przez użytkownika.
- `password: string`: Hasło podane przez użytkownika.

### `LoginFormProps`

Interfejs propsów dla komponentu `LoginForm`.

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';

export interface LoginFormProps {
  supabaseClient: SupabaseClient;
  onLoginSuccess?: () => void; // Np. do przekierowania przez Astro
}
```

- `supabaseClient: SupabaseClient`: Instancja klienta Supabase przekazana do komponentu w celu przeprowadzenia operacji autentykacji.
- `onLoginSuccess?: () => void`: Opcjonalna funkcja zwrotna wywoływana po pomyślnym zalogowaniu użytkownika. Może być użyta do zainicjowania przekierowania po stronie klienta w Astro.

## 6. Zarządzanie stanem

Zarządzanie stanem w komponencie `LoginForm.tsx` będzie realizowane przy użyciu:

1. **`react-hook-form`**: Do zarządzania stanem pól formularza, ich walidacją i procesem wysyłania.
2. **Lokalny stan React (`useState`)** lub **custom hook (`useLoginForm`)**:
    - `isLoading (boolean)`: Stan wskazujący, czy proces logowania jest w toku. Używany do wyświetlania wskaźnika ładowania na przycisku i ewentualnego blokowania ponownego wysłania formularza.
    - `apiError (string | null)`: Przechowuje komunikaty błędów zwrócone przez Supabase Auth lub inne błędy związane z procesem logowania. Wyświetlany użytkownikowi za pomocą komponentu Toast.

Sugerowane jest stworzenie custom hooka `useLoginForm`, który hermetyzuje logikę formularza, interakcję z Supabase, oraz zarządzanie stanami `isLoading` i `apiError`.

**Przykład struktury `useLoginForm`:**

```typescript
// hooks/useLoginForm.ts (propozycja)
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoginFormData } from '../types'; // Załóżmy, że LoginFormData jest zdefiniowane

const loginSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy format adresu email." }).min(1, { message: "Adres email jest wymagany." }),
  password: z.string().min(6, { message: "Hasło musi mieć co najmniej 6 znaków." }), // Długość do weryfikacji z Supabase
});

export function useLoginForm(supabaseClient: SupabaseClient, onLoginSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        // Mapowanie błędów Supabase na bardziej przyjazne komunikaty
        if (error.message === 'Invalid login credentials') {
          setApiError("Nieprawidłowy email lub hasło.");
        } else if (error.message.includes('Email not confirmed')) {
          setApiError("Proszę potwierdzić swój adres email przed zalogowaniem.");
        }
        else {
          setApiError("Wystąpił błąd podczas logowania. Spróbuj ponownie.");
        }
        console.error("Supabase login error:", error);
      } else {
        // Sukces
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          // Domyślne przekierowanie, jeśli nie ma onLoginSuccess
          window.location.href = '/dashboard'; // Przykładowa ścieżka
        }
      }
    } catch (e) {
      console.error("Login submission error:", e);
      setApiError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  return { form, onSubmit, isLoading, apiError, setApiError };
}
```

## 7. Integracja API

Logowanie jest obsługiwane przez **Supabase Auth SDK**, a nie przez dedykowany endpoint API backendu aplikacji.

- **Operacja:** Logowanie użytkownika.
- **Metoda SDK Supabase:** `supabaseClient.auth.signInWithPassword(credentials)`
- **Parametry `credentials` (obiekt):**
  - `email` (string): Adres email użytkownika.
  - `password` (string): Hasło użytkownika.
- **Odpowiedź SDK Supabase (obiekt `{ data, error }`):**
  - `data`: Obiekt zawierający `user` i `session` w przypadku sukcesu.
    - `data.user`: Informacje o zalogowanym użytkowniku.
    - `data.session`: Informacje o sesji, w tym JWT.
  - `error`: Obiekt błędu (`AuthError` z Supabase) w przypadku niepowodzenia. Zawiera `message` i inne szczegóły.

Komponent `LoginForm` (lub hook `useLoginForm`) wywoła tę metodę, przekazując dane z formularza.

## 8. Interakcje użytkownika

- **Wprowadzanie danych:** Użytkownik wpisuje email i hasło w odpowiednie pola formularza.
  - Reakcja: Dane są aktualizowane w stanie formularza (`react-hook-form`). Komunikaty walidacji mogą pojawiać się na bieżąco (on blur/on change).
- **Kliknięcie przycisku "Zaloguj":**
  - Reakcja:
        1. Uruchamiana jest walidacja po stronie klienta.
        2. Jeśli walidacja nie powiedzie się, wyświetlane są błędy przy odpowiednich polach, a wysyłanie jest blokowane.
        3. Jeśli walidacja powiedzie się:
            - Ustawiany jest stan `isLoading` na `true`.
            - Przycisk "Zaloguj" może wyświetlać wskaźnik ładowania i być zablokowany.
            - Wywoływana jest funkcja `supabaseClient.auth.signInWithPassword()`.
            - **W przypadku sukcesu:**
                - Stan `isLoading` ustawiany jest na `false`.
                - Użytkownik jest przekierowywany na stronę główną aplikacji (np. `/dashboard`) lub wywoływany jest callback `onLoginSuccess`.
                - Sesja użytkownika jest zarządzana przez Supabase SDK (JWT zapisywany w local storage/cookies).
            - **W przypadku błędu:**
                - Stan `isLoading` ustawiany jest na `false`.
                - Stan `apiError` jest aktualizowany odpowiednim komunikatem.
                - Komunikat błędu jest wyświetlany użytkownikowi (np. za pomocą komponentu Toast).
- **Kliknięcie linku "Nie masz konta? Zarejestruj się":**
  - Reakcja: Użytkownik jest przekierowywany na stronę rejestracji (`/register`).

## 9. Warunki i walidacja

Warunki walidacji są stosowane w komponencie `LoginForm.tsx` przy użyciu `react-hook-form` i `zod` (lub innej biblioteki do walidacji schematów).

- **Email:**
  - **Warunek:** Musi być podany.
  - **Walidacja:** `z.string().min(1, "Adres email jest wymagany.")`
  - **Warunek:** Musi być poprawnym formatem email.
  - **Walidacja:** `z.string().email("Nieprawidłowy format adresu email.")`
  - **Wpływ na UI:** Jeśli warunek niespełniony, pod polem email wyświetlany jest odpowiedni komunikat błędu. Przycisk "Zaloguj" może być zablokowany.
- **Hasło:**
  - **Warunek:** Musi być podane.
  - **Walidacja:** `z.string().min(1, "Hasło jest wymagane.")`
  - **Warunek:** Musi mieć minimalną długość (np. 6 znaków).
  - **Walidacja:** `z.string().min(6, "Hasło musi mieć co najmniej 6 znaków.")` (Długość do potwierdzenia z konfiguracją Supabase).
  - **Wpływ na UI:** Jeśli warunek niespełniony, pod polem hasła wyświetlany jest odpowiedni komunikat błędu. Przycisk "Zaloguj" może być zablokowany.

Wszystkie walidacje są sprawdzane przed próbą wysłania formularza do Supabase.

## 10. Obsługa błędów

- **Błędy walidacji po stronie klienta:**
  - Obsługa: Wyświetlane bezpośrednio pod odpowiednimi polami formularza przez `react-hook-form` i `Shadcn/ui FormMessage`.
  - Przykład: "Adres email jest wymagany.", "Nieprawidłowy format adresu email."
- **Błędy zwrócone przez Supabase Auth (po stronie serwera):**
  - `Invalid login credentials`:
    - Obsługa: Wyświetlić ogólny komunikat błędu w komponencie Toast.
    - Komunikat: "Nieprawidłowy email lub hasło."
  - `Email not confirmed` (jeśli włączona jest weryfikacja emaila):
    - Obsługa: Wyświetlić komunikat w komponencie Toast.
    - Komunikat: "Proszę potwierdzić swój adres email przed zalogowaniem."
  - Inne błędy Supabase (np. problemy sieciowe, błędy serwera Supabase):
    - Obsługa: Wyświetlić ogólny komunikat błędu w komponencie Toast.
    - Komunikat: "Wystąpił błąd podczas logowania. Spróbuj ponownie później."
    - Logować szczegółowy błąd do konsoli deweloperskiej dla celów diagnostycznych.
- **Błędy sieciowe / Nieoczekiwane błędy JavaScript:**
  - Obsługa: Użycie bloku `try...catch` wokół wywołania Supabase. Wyświetlić ogólny komunikat błędu w Toast.
  - Komunikat: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie."
  - Logować błąd do konsoli.

Komponent `Toast` z Shadcn/ui będzie używany do wyświetlania błędów serwera i ogólnych błędów aplikacji w sposób nieinwazyjny. Stan `apiError` w `LoginForm` (lub `useLoginForm`) będzie przechowywał te komunikaty.

## 11. Kroki implementacji

1. **Utworzenie struktury plików:**
    - Strona Astro: `src/pages/login.astro`
    - Komponent React formularza: `src/components/auth/LoginForm.tsx`
    - (Opcjonalnie) Custom hook: `src/hooks/useLoginForm.ts`
    - (Jeśli nie istnieje) Komponent `HeaderUnauthenticated`.
2. **Zainicjowanie `LoginPage.astro`:**
    - Dodać podstawowy layout (np. `MainLayout.astro`).
    - Osadzić komponent `<LoginForm client:load />`, przekazując instancję klienta Supabase (jeśli nie jest dostępny globalnie w komponencie React przez Context lub inaczej).
3. **Implementacja `LoginForm.tsx`:**
    - Zdefiniować schemat walidacji Zod dla `LoginFormData`.
    - Skonfigurować `react-hook-form` z `zodResolver` i domyślnymi wartościami.
    - Zbudować strukturę formularza używając komponentów Shadcn/ui: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `Input`, `FormMessage`, `Button`.
    - Dodać link do strony rejestracji (`/register`).
4. **Implementacja logiki logowania (w `LoginForm.tsx` lub `useLoginForm.ts`):**
    - Zaimplementować funkcję `onSubmit`.
    - W funkcji `onSubmit`:
        - Ustawić `isLoading` na `true` i wyczyścić poprzednie `apiError`.
        - Wywołać `supabaseClient.auth.signInWithPassword()` z danymi z formularza.
        - Obsłużyć odpowiedź:
            - W przypadku sukcesu: wywołać `onLoginSuccess` (np. `Astro.redirect('/dashboard')` lub `window.location.href = '/dashboard'`) lub przekierować.
            - W przypadku błędu: zmapować błąd Supabase na przyjazny komunikat i ustawić `apiError`.
        - W bloku `finally` ustawić `isLoading` na `false`.
5. **Wyświetlanie stanu ładowania i błędów:**
    - Powiązać stan `isLoading` z atrybutem `disabled` przycisku "Zaloguj" i wyświetlić w nim wskaźnik ładowania (np. spinner).
    - Wyświetlać `apiError` za pomocą komponentu `Toast` (np. poprzez wywołanie funkcji `toast()` z `sonner` lub `react-hot-toast` jeśli jest używane z Shadcn/ui, lub natywnego `Toast` z Shadcn). Upewnić się, że `Toaster` jest dodany do layoutu aplikacji.
6. **Styling:**
    - Dostosować wygląd formularza i strony za pomocą Tailwind CSS, zgodnie z ogólnym stylem aplikacji.
7. **Testowanie:**
    - Przetestować przypadki pomyślnego logowania.
    - Przetestować różne scenariusze błędów (nieprawidłowe dane, błędy serwera - jeśli możliwe do symulacji).
    - Sprawdzić walidację po stronie klienta.
    - Sprawdzić responsywność widoku.
    - Sprawdzić działanie linku do rejestracji.
8. **Dostępność (A11y):**
    - Upewnić się, że formularz jest dostępny (etykiety dla pól, nawigacja klawiaturą, odpowiednie atrybuty ARIA tam, gdzie to konieczne). Komponenty Shadcn/ui zazwyczaj dbają o podstawową dostępność.
9. **Integracja `HeaderUnauthenticated`:**
    - Upewnić się, że nagłówek dla niezalogowanych użytkowników jest poprawnie wyświetlany na stronie `/login` i zawiera link do `/register`.
10. **Obsługa przekierowania po zalogowaniu:**
    - Zdecydować o strategii przekierowania (np. na `/dashboard` lub ostatnio odwiedzoną stronę chronioną). `onLoginSuccess` może przyjmować URL jako parametr lub być skonfigurowane globalnie.
    - Jeśli użytkownik jest już zalogowany i trafi na `/login`, powinien zostać przekierowany do aplikacji (np. `/dashboard`). Można to obsłużyć w `load` funkcji strony Astro lub na początku renderowania komponentu React.
