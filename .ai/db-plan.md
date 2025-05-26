# Schemat Bazy Danych PostgreSQL dla 10xdevs-fishes-cards

## 1. Lista tabel z ich kolumnami, typami danych i ograniczeniami

### a. Tabela `users` (obsługiwana przez Supabase `auth.users`)

Tabela `auth.users` jest dostarczana i zarządzana przez Supabase. Zawiera co najmniej następujące istotne kolumny:

- `id`: `UUID PRIMARY KEY` - Unikalny identyfikator użytkownika.
- `email`: `VARCHAR` - Adres email użytkownika.
- `encrypted_password`: `VARCHAR` - Zaszyfrowane hasło użytkownika.
- `created_at`: `TIMESTAMPTZ` - Data utworzenia konta.
- `updated_at`: `TIMESTAMPTZ` - Data ostatniej aktualizacji konta.

*Uwaga: Akceptacja polityki prywatności jest warunkiem koniecznym do rejestracji i nie jest przechowywana jako osobne pole w bazie danych na etapie MVP, gdyż sam fakt istnienia użytkownika w systemie oznacza jej akceptację.*

### b. Tabela `flashcards`

Przechowuje fiszki stworzone przez użytkowników, zarówno ręcznie, jak i wygenerowane przez AI.

| Nazwa Kolumny      | Typ Danych        | Ograniczenia                                                                  | Opis                                                                 |
|--------------------|-------------------|-------------------------------------------------------------------------------|----------------------------------------------------------------------|
| `id`               | `UUID`            | `PRIMARY KEY DEFAULT gen_random_uuid()`                                       | Unikalny identyfikator fiszki.                                       |
| `user_id`          | `UUID`            | `NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`                        | Identyfikator użytkownika, do którego należy fiszka.                   |
| `question`         | `VARCHAR(1000)`   | `NOT NULL CHECK (length(question) >= 5)`                                      | Treść pytania na fiszce.                                             |
| `answer`           | `TEXT`            | `NOT NULL CHECK (length(answer) >= 3)`                                        | Treść odpowiedzi na fiszce.                                          |
| `source_text_for_ai` | `TEXT`          | `NULL`                                                                        | Tekst źródłowy użyty przez AI do wygenerowania fiszki (jeśli dotyczy). |
| `is_ai_generated`  | `BOOLEAN`         | `NOT NULL DEFAULT FALSE`                                                      | Flaga wskazująca, czy fiszka została wygenerowana przez AI.            |
| `ai_accepted_at`   | `TIMESTAMPTZ`     | `NULL`                                                                        | Data i czas akceptacji fiszki wygenerowanej przez AI przez użytkownika. |
| `created_at`       | `TIMESTAMPTZ`     | `NOT NULL DEFAULT NOW()`                                                      | Data i czas utworzenia fiszki.                                       |
| `updated_at`       | `TIMESTAMPTZ`     | `NOT NULL DEFAULT NOW()`                                                      | Data i czas ostatniej modyfikacji fiszki.                            |
| `is_deleted`       | `BOOLEAN`         | `NOT NULL DEFAULT FALSE`                                                      | Flaga wskazująca, czy fiszka została miękko usunięta.                |
| `deleted_at`       | `TIMESTAMPTZ`     | `NULL`                                                                        | Data i czas miękkiego usunięcia fiszki.                              |

### c. Tabela `contact_form_submissions`

Przechowuje zgłoszenia wysłane poprzez formularz kontaktowy.

| Nazwa Kolumny   | Typ Danych    | Ograniczenia                                                | Opis                                                                   |
|-----------------|---------------|-------------------------------------------------------------|------------------------------------------------------------------------|
| `id`            | `UUID`        | `PRIMARY KEY DEFAULT gen_random_uuid()`                     | Unikalny identyfikator zgłoszenia.                                   |
| `user_id`       | `UUID`        | `NULL REFERENCES auth.users(id) ON DELETE SET NULL`         | Identyfikator zalogowanego użytkownika (jeśli dotyczy).                |
| `email_address` | `VARCHAR(255)`| `NOT NULL`                                                  | Adres email osoby wysyłającej zgłoszenie.                              |
| `subject`       | `VARCHAR(255)`| `NULL`                                                      | Temat zgłoszenia.                                                      |
| `message_body`  | `TEXT`        | `NOT NULL`                                                  | Treść wiadomości zgłoszenia.                                          |
| `submitted_at`  | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()`                                    | Data i czas wysłania zgłoszenia.                                       |

## 2. Relacje między tabelami

- **`auth.users` (1) - (0..*) `flashcards`**: Jeden użytkownik może mieć wiele fiszek. Każda fiszka musi należeć do jednego użytkownika. Usunięcie użytkownika kaskadowo usuwa jego fiszki (`ON DELETE CASCADE`).
- **`auth.users` (1) - (0..*) `contact_form_submissions`**: Jeden użytkownik może wysłać wiele zgłoszeń przez formularz kontaktowy. Zgłoszenie może być opcjonalnie powiązane z użytkownikiem. Jeśli użytkownik zostanie usunięty, jego `user_id` w powiązanych zgłoszeniach zostanie ustawione na `NULL` (`ON DELETE SET NULL`). Zgłoszenia mogą być również wysyłane przez użytkowników anonimowych (`user_id` jest `NULL`).

## 3. Indeksy

### a. Tabela `flashcards`

- `CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);`
  - Dla szybkiego wyszukiwania fiszek należących do konkretnego użytkownika.
- `CREATE INDEX idx_flashcards_user_id_is_deleted ON flashcards(user_id, is_deleted);`
  - Dla efektywnego filtrowania fiszek użytkownika, które nie są usunięte (kluczowy dla RLS).
- `CREATE INDEX idx_flashcards_created_at ON flashcards(created_at);`
  - Dla sortowania/filtrowania fiszek po dacie utworzenia.
- `CREATE INDEX idx_flashcards_is_ai_generated ON flashcards(is_ai_generated);`
  - Dla filtrowania fiszek na podstawie tego, czy były generowane przez AI.
- *Opcjonalnie, dla wyszukiwania tekstowego `ILIKE` w `question` (jeśli wydajność stanie się problemem):*
  - `CREATE INDEX idx_flashcards_question_trgm ON flashcards USING gin (question gin_trgm_ops);` (wymaga rozszerzenia `pg_trgm`)

### b. Tabela `contact_form_submissions`

- `CREATE INDEX idx_contact_form_submissions_user_id ON contact_form_submissions(user_id);`
  - Dla szybkiego wyszukiwania zgłoszeń od konkretnego użytkownika (jeśli dotyczy).
- `CREATE INDEX idx_contact_form_submissions_email_address ON contact_form_submissions(email_address);`
  - Dla wyszukiwania zgłoszeń po adresie email.
- `CREATE INDEX idx_contact_form_submissions_submitted_at ON contact_form_submissions(submitted_at);`
  - Dla sortowania/filtrowania zgłoszeń po dacie wysłania.

## 4. Zasady PostgreSQL (Row Level Security - RLS)

### a. Tabela `flashcards`

Należy włączyć RLS dla tabeli: `ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;`

- **Zasada `SELECT`**: Użytkownicy mogą odczytywać tylko własne, nieusunięte fiszki.

  ```sql
  CREATE POLICY "Allow users to read their own non-deleted flashcards"
  ON flashcards
  FOR SELECT
  USING (auth.uid() = user_id AND is_deleted = FALSE);
  ```

- **Zasada `INSERT`**: Użytkownicy mogą tworzyć fiszki tylko dla siebie. `user_id` jest automatycznie ustawiane na ID zalogowanego użytkownika, `is_deleted` domyślnie na `FALSE`.

  ```sql
  CREATE POLICY "Allow users to create flashcards for themselves"
  ON flashcards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_deleted = FALSE);
  ```

  *Uwaga: Zaleca się, aby `user_id` było ustawiane przez logikę aplikacji lub trigger, a nie bezpośrednio przez użytkownika, aby zapewnić, że `user_id` = `auth.uid()`.*

- **Zasada `UPDATE`**: Użytkownicy mogą modyfikować tylko własne, nieusunięte fiszki. Nie mogą zmieniać `user_id`. Miękkie usuwanie odbywa się przez dedykowaną zasadę `DELETE` lub procedurę.

  ```sql
  CREATE POLICY "Allow users to update their own non-deleted flashcards"
  ON flashcards
  FOR UPDATE
  USING (auth.uid() = user_id AND is_deleted = FALSE)
  WITH CHECK (auth.uid() = user_id AND is_deleted = FALSE); 
  -- Dodatkowe ograniczenie, aby nie można było zmienić user_id, można zrealizować triggerem.
  -- Miękkie usuwanie (zmiana is_deleted na TRUE) powinno być obsługiwane przez politykę DELETE.
  ```

- **Zasada `DELETE` (dla miękkiego usuwania)**: Użytkownicy mogą "miękko" usuwać tylko własne, nieusunięte fiszki. Operacja ta powinna być realizowana przez `UPDATE` ustawiający `is_deleted = TRUE` i `deleted_at = NOW()`. Standardowa operacja `DELETE` powinna być zablokowana lub ograniczona do administratorów.
  *Zamiast standardowej polityki `DELETE`, preferowane jest zaimplementowanie miękkiego usuwania poprzez `UPDATE` w ramach logiki aplikacji lub funkcji bazodanowej, która jest wywoływana przez użytkownika. Jeśli jednak używamy polityki `DELETE` do tego celu, musiałaby ona przekierowywać na `UPDATE` lub być zastąpiona przez funkcję.*
  
  Jako alternatywa, jeśli chcemy zablokować twarde usuwanie przez użytkowników:

  ```sql
  CREATE POLICY "Disallow direct DELETE for users"
  ON flashcards
  FOR DELETE
  USING (FALSE); -- Nikomu nie pozwala na DELETE (poza superuserem/bypassrls)
  ```

  *Miękkie usuwanie powinno być realizowane przez operację `UPDATE` na `is_deleted` i `deleted_at`, objętą odpowiednią polityką `UPDATE` lub dedykowaną funkcją.*
  *Dla uproszczenia, polityka `UPDATE` powyżej pozwala na modyfikację, ale nie na zmianę `is_deleted` na `TRUE` w celu usunięcia. Lepszym podejściem jest dedykowana funkcja `soft_delete_flashcard(flashcard_id UUID)`.*

  Polityka dla operacji "miękkiego usuwania" (jeśli zaimplementowana jako `UPDATE` przez użytkownika):

   ```sql
  CREATE POLICY "Allow users to soft-delete their own flashcards"
  ON flashcards
  FOR UPDATE -- Zakładając, że miękkie usuwanie to UPDATE is_deleted i deleted_at
  USING (auth.uid() = user_id AND is_deleted = FALSE)
  WITH CHECK (auth.uid() = user_id); -- Użytkownik może ustawić is_deleted = TRUE i deleted_at
  ```

  *Należy upewnić się, że ta polityka nie koliduje z ogólną polityką UPDATE i że użytkownik nie może zmienić `is_deleted` z `TRUE` na `FALSE`.*

### b. Tabela `contact_form_submissions`

Należy włączyć RLS dla tabeli: `ALTER TABLE contact_form_submissions ENABLE ROW LEVEL SECURITY;`

- **Zasada `INSERT`**: Każdy może wstawić zgłoszenie. Jeśli użytkownik jest zalogowany, `user_id` powinno być ustawione na `auth.uid()`.

  ```sql
  CREATE POLICY "Allow anyone to submit a contact form"
  ON contact_form_submissions
  FOR INSERT
  WITH CHECK (
    (auth.role() = 'anon' AND user_id IS NULL) OR
    (auth.role() = 'authenticated' AND user_id = auth.uid())
  );
  -- Ta polityka zakłada, że user_id jest poprawnie ustawiane (NULL dla anonimowych, auth.uid() dla zalogowanych)
  -- przez logikę aplikacji lub trigger.
  ```

  Prostsza wersja, jeśli ufamy frontendowi/backendowi w kwestii ustawiania `user_id`:

  ```sql
  CREATE POLICY "Allow public inserts to contact form"
  ON contact_form_submissions
  FOR INSERT
  WITH CHECK (true);
  ```

- **Zasady `SELECT`, `UPDATE`, `DELETE`**: Dostępne tylko dla ról administracyjnych (np. `service_role` lub dedykowanej roli `admin`).

  ```sql
  CREATE POLICY "Allow admin access to contact_form_submissions"
  ON contact_form_submissions
  FOR ALL -- Obejmuje SELECT, UPDATE, DELETE
  USING (auth.role() = 'service_role'); -- Lub inna rola admina
  -- Można rozbić na osobne polityki dla SELECT, UPDATE, DELETE jeśli potrzebna jest większa granulacja
  ```

## 5. Wszelkie dodatkowe uwagi lub wyjaśnienia dotyczące decyzji projektowych

### a. Funkcja i Trigger dla automatycznej aktualizacji `updated_at`

Dla tabeli `flashcards` (i potencjalnie innych tabel w przyszłości), warto stworzyć mechanizm automatycznej aktualizacji kolumny `updated_at` przy każdej zmianie wiersza.

- **Funkcja:**

  ```sql
  CREATE OR REPLACE FUNCTION trigger_set_timestamp()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```

- **Trigger dla tabeli `flashcards`:**

  ```sql
  CREATE TRIGGER set_flashcards_timestamp
  BEFORE UPDATE ON flashcards
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();
  ```

### b. Miękkie Usuwanie (`flashcards`)

Zaimplementowano poprzez dodanie kolumn `is_deleted BOOLEAN NOT NULL DEFAULT FALSE` oraz `deleted_at TIMESTAMPTZ NULL`. Zasady RLS oraz zapytania aplikacyjne muszą uwzględniać `is_deleted = FALSE` przy odczycie danych, które mają być widoczne dla użytkownika. Operacja usuwania z perspektywy użytkownika powinna być realizowana jako `UPDATE`, który ustawia `is_deleted = TRUE` i `deleted_at = NOW()`.

### c. Walidacja długości `question` i `answer` w `flashcards`

Ograniczenia `CHECK` zostały dodane bezpośrednio w definicji tabeli `flashcards` w celu zapewnienia integralności danych na poziomie bazy.

- `question`: `CHECK (length(question) >= 5)`
- `answer`: `CHECK (length(answer) >= 3)`

### d. Obsługa `user_id` w `flashcards` przy `INSERT`

Polityka RLS `INSERT` dla `flashcards` zawiera `WITH CHECK (auth.uid() = user_id)`. Aby to działało poprawnie, wartość `user_id` wstawianego wiersza musi być jawnie ustawiona na `auth.uid()` przez aplikację lub backend. Supabase często ułatwia to przez automatyczne wstrzykiwanie `user_id` lub przez ustawienie `DEFAULT auth.uid()` dla kolumny `user_id` (jeśli RLS na to pozwala i jest to pożądane). W tym schemacie `user_id` nie ma `DEFAULT`, więc aplikacja musi to obsłużyć.

### e. Obsługa `user_id` w `contact_form_submissions` przy `INSERT`

Podobnie, dla `contact_form_submissions`, aplikacja powinna zadbać o poprawne ustawienie `user_id` (na `auth.uid()` dla zalogowanych użytkowników lub `NULL` dla anonimowych) przed wykonaniem `INSERT`. Polityka RLS weryfikuje tę logikę.

### f. Wyszukiwanie tekstowe

Dla MVP, wyszukiwanie `ILIKE` w kolumnie `question` tabeli `flashcards` jest uznane za wystarczające. W przypadku problemów z wydajnością w przyszłości, można rozważyć użycie indeksów `GIN` z rozszerzeniem `pg_trgm` dla szybszego wyszukiwania pełnotekstowego.
