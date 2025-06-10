# REST API Plan

## 1. Resources

- **Flashcards**
  - Database Table: `flashcards`
  - Description: Represents educational flashcards created by users, either manually or AI-generated.
- **AI Flashcard Generation**
  - Database Table: (Indirectly related to `flashcards`, uses `source_text_for_ai` column)
  - Description: A process endpoint to generate flashcard suggestions using AI.
- **Contact Submissions**
  - Database Table: `contact_form_submissions`
  - Description: Represents submissions from the contact form.

_Note: User management (registration, login) is handled by Supabase Auth and its SDKs, thus not detailed as custom API endpoints here._

## 2. Endpoints

### 2.1. Flashcards Resource (`/api/flashcards`)

#### 2.1.1. Create Flashcard

- **Method:** `POST`
- **URL:** `/api/flashcards`
- **Description:** Creates a new flashcard. This can be a manually created flashcard or an AI-generated flashcard that the user has reviewed and decided to save.
- **Request Body (JSON):**

  ```json
  {
    "question": "string (min 5 chars)",
    "answer": "string (min 3 chars)",
    "isAiGenerated": "boolean (optional, default: false)",
    "sourceTextForAi": "string (optional, required if isAiGenerated is true)",
    "aiModelUsed": "string (optional, e.g., 'GPT-4', if isAiGenerated is true)"
  }
  ```

- **Response Body (JSON) - Success (201 Created):**

  ```json
  {
    "id": "uuid",
    "userId": "uuid",
    "question": "string",
    "answer": "string",
    "sourceTextForAi": "string | null",
    "isAiGenerated": "boolean",
    "aiAcceptedAt": "timestamp | null", // Set by server if isAiGenerated is true
    "createdAt": "timestamp",
    "updatedAt": "timestamp",
    "isDeleted": "boolean"
  }
  ```

- **Success Codes:**
  - `201 Created`: Flashcard created successfully.
- **Error Codes:**

  - `400 Bad Request`: Invalid input (e.g., missing fields, validation errors like question/answer length).

    ```json
    { "error": "Validation failed", "details": { "question": "Question must be at least 5 characters long." } }
    ```

  - `401 Unauthorized`: User not authenticated.
  - `500 Internal Server Error`: Unexpected server error.

#### 2.1.2. Get List of User's Flashcards

- **Method:** `GET`
- **URL:** `/api/flashcards`
- **Description:** Retrieves a list of flashcards belonging to the authenticated user. Only non-deleted flashcards are returned.
- **Query Parameters:**
  - `page` (optional, integer, default: 1): For pagination.
  - `limit` (optional, integer, default: 10): Number of items per page.
  - `sortBy` (optional, string, default: `createdAt`): Field to sort by (e.g., `createdAt`, `updatedAt`, `question`).
  - `sortOrder` (optional, string, default: `desc`): Sort order (`asc` or `desc`).
  - `search` (optional, string): Search term to filter flashcards by question (case-insensitive partial match).
  - `isAiGenerated` (optional, boolean): Filter by AI-generated status.
- **Response Body (JSON) - Success (200 OK):**

  ```json
  {
    "data": [
      {
        "id": "uuid",
        "userId": "uuid",
        "question": "string",
        "answer": "string",
        "isAiGenerated": "boolean",
        "aiAcceptedAt": "timestamp | null",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
      // ... more flashcards
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "limit": 10
    }
  }
  ```

- **Success Codes:**
  - `200 OK`: Flashcards retrieved successfully.
- **Error Codes:**
  - `401 Unauthorized`: User not authenticated.
  - `500 Internal Server Error`: Unexpected server error.

#### 2.1.3. Get Single Flashcard

- **Method:** `GET`
- **URL:** `/api/flashcards/{flashcardId}`
- **Description:** Retrieves a specific flashcard by its ID. User must own the flashcard and it must not be deleted.
- **Path Parameters:**
  - `flashcardId` (uuid, required): The ID of the flashcard.
- **Response Body (JSON) - Success (200 OK):**

  ```json
  {
    "id": "uuid",
    "userId": "uuid",
    "question": "string",
    "answer": "string",
    "sourceTextForAi": "string | null",
    "isAiGenerated": "boolean",
    "aiAcceptedAt": "timestamp | null",
    "createdAt": "timestamp",
    "updatedAt": "timestamp",
    "isDeleted": "boolean" // will be false
  }
  ```

- **Success Codes:**
  - `200 OK`: Flashcard retrieved successfully.
- **Error Codes:**
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: User does not have permission to access this flashcard.
  - `404 Not Found`: Flashcard not found or already (soft) deleted.
  - `500 Internal Server Error`: Unexpected server error.

#### 2.1.4. Update Flashcard

- **Method:** `PATCH`
- **URL:** `/api/flashcards/{flashcardId}`
- **Description:** Updates an existing flashcard. User must own the flashcard.
- **Path Parameters:**
  - `flashcardId` (uuid, required): The ID of the flashcard to update.
- **Request Body (JSON):** (Fields are optional; only provided fields will be updated)

  ```json
  {
    "question": "string (min 5 chars, optional)",
    "answer": "string (min 3 chars, optional)"
  }
  ```

- **Response Body (JSON) - Success (200 OK):**

  ```json
  {
    "id": "uuid",
    "userId": "uuid",
    "question": "string",
    "answer": "string",
    "sourceTextForAi": "string | null",
    "isAiGenerated": "boolean",
    "aiAcceptedAt": "timestamp | null",
    "createdAt": "timestamp",
    "updatedAt": "timestamp", // Should be updated
    "isDeleted": "boolean"
  }
  ```

- **Success Codes:**
  - `200 OK`: Flashcard updated successfully.
- **Error Codes:**
  - `400 Bad Request`: Invalid input (e.g., validation errors).
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: User does not have permission to update this flashcard.
  - `404 Not Found`: Flashcard not found.
  - `500 Internal Server Error`: Unexpected server error.

#### 2.1.5. Delete Flashcard (Soft Delete)

- **Method:** `DELETE`
- **URL:** `/api/flashcards/{flashcardId}`
- **Description:** Soft deletes a flashcard by its ID. User must own the flashcard. The flashcard is marked as deleted (`is_deleted = true`, `deleted_at = NOW()`) but not physically removed from the database.
- **Path Parameters:**
  - `flashcardId` (uuid, required): The ID of the flashcard to delete.
- **Response Body (JSON) - Success (204 No Content):**
  - Empty response.
- **Success Codes:**
  - `204 No Content`: Flashcard soft deleted successfully.
- **Error Codes:**
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: User does not have permission to delete this flashcard.
  - `404 Not Found`: Flashcard not found.
  - `500 Internal Server Error`: Unexpected server error.

### 2.2. AI Flashcard Generation (`/api/flashcards/generate-ai`)

#### 2.2.1. Generate Flashcards using AI

- **Method:** `POST`
- **URL:** `/api/flashcards/generate-ai`
- **Description:** Takes a source text and uses an AI model (e.g., via OpenRouter) to generate a list of potential flashcard questions and answers. These are suggestions and are not saved to the database until the user explicitly creates them (e.g., using `POST /api/flashcards`).
- **Request Body (JSON):**

  ```json
  {
    "sourceText": "string (min 1000 chars, max 10000 chars)"
  }
  ```

- **Response Body (JSON) - Success (200 OK):**

  ```json
  {
    "suggestions": [
      {
        "suggestedQuestion": "string",
        "suggestedAnswer": "string",
        "aiModelUsed": "string (e.g., 'GPT-4')"
      }
    ],
    "sourceTextEcho": "string" // The original source text, for reference
  }
  ```

- **Success Codes:**
  - `200 OK`: Flashcard suggestions generated successfully.
- **Error Codes:**

  - `400 Bad Request`: Invalid input (e.g., `sourceText` length validation).

    ```json
    {
      "error": "Validation failed",
      "details": { "sourceText": "Source text must be between 1000 and 10000 characters." }
    }
    ```

  - `401 Unauthorized`: User not authenticated.
  - `500 Internal Server Error`: Unexpected server error (e.g., AI service failure).
  - `503 Service Unavailable`: AI service is temporarily unavailable.

### 2.3. Contact Submissions Resource (`/api/contact-submissions`)

#### 2.3.1. Create Contact Submission

- **Method:** `POST`
- **URL:** `/api/contact-submissions`
- **Description:** Allows any user (authenticated or anonymous) to submit a message via the contact form. If the user is authenticated, their `user_id` is associated with the submission.
- **Request Body (JSON):**

  ```json
  {
    "emailAddress": "string (valid email, required)",
    "subject": "string (optional)",
    "messageBody": "string (required)"
  }
  ```

- **Response Body (JSON) - Success (201 Created):**

  ```json
  {
    "id": "uuid",
    "userId": "uuid | null", // Populated if user is authenticated
    "emailAddress": "string",
    "subject": "string | null",
    "messageBody": "string",
    "submittedAt": "timestamp"
  }
  ```

- **Success Codes:**
  - `201 Created`: Submission created successfully.
- **Error Codes:**

  - `400 Bad Request`: Invalid input (e.g., missing fields, invalid email format).

    ```json
    { "error": "Validation failed", "details": { "emailAddress": "Invalid email format." } }
    ```

  - `500 Internal Server Error`: Unexpected server error.

## 3. Authentication and Authorization

- **Authentication:**

  - Handled by Supabase Auth. Clients will obtain a JWT upon successful login/signup.
  - This JWT must be included in the `Authorization` header for all protected API requests: `Authorization: Bearer <YOUR_SUPABASE_JWT>`.
  - Endpoints like `POST /api/contact-submissions` can be accessed anonymously, but if a valid JWT is provided, the `user_id` will be associated. The `POST /api/flashcards/generate-ai` and all `/api/flashcards` (except potentially GET for public flashcards in the future, which is not in scope now) require authentication.

- **Authorization:**
  - Primarily enforced by PostgreSQL Row Level Security (RLS) policies configured in Supabase, as detailed in the `db-plan.md`.
  - **Flashcards:**
    - Users can only `SELECT`, `UPDATE`, `DELETE` (soft delete) their own flashcards.
    - Users can only `INSERT` flashcards with their own `user_id`.
    - RLS ensures `is_deleted = FALSE` for most read operations.
  - **Contact Submissions:**
    - Anyone can `INSERT`.
    - `SELECT`, `UPDATE`, `DELETE` operations are restricted to admin roles (e.g., `service_role`), not exposed via these user-facing API endpoints.

## 4. Validation and Business Logic

### 4.1. Input Validation

- **Flashcards (`POST /api/flashcards`, `PATCH /api/flashcards/{id}`):**
  - `question`: Required (for POST), string, min 5 characters.
  - `answer`: Required (for POST), string, min 3 characters.
  - `isAiGenerated`: Boolean.
  - `sourceTextForAi`: String, required if `isAiGenerated` is true.
  - Database-level `CHECK` constraints for `question` and `answer` length will also apply.
- **AI Flashcard Generation (`POST /api/flashcards/generate-ai`):**
  - `sourceText`: Required, string, min 1000 characters, max 10000 characters (as per PRD US-002).
- **Contact Submissions (`POST /api/contact-submissions`):**
  - `emailAddress`: Required, string, must be a valid email format.
  - `messageBody`: Required, string.
  - `subject`: Optional, string.

API endpoints will perform these validations before processing the request or interacting with the database. Clear `400 Bad Request` responses will be provided for validation failures.

### 4.2. Business Logic Implementation

- **US-001: Registration and Login:** Handled by Supabase Auth SDK on the client-side and Supabase backend.
- **US-002: AI Flashcard Generation:**
  - The `POST /api/flashcards/generate-ai` endpoint implements the core logic. It receives `sourceText`, validates its length, then calls the configured AI service (e.g., OpenRouter) to get suggestions.
  - The generated suggestions are returned to the client.
  - Saving/accepting an AI-generated flashcard is done by the client calling `POST /api/flashcards` with `isAiGenerated: true`, the `question` and `answer` from the suggestion, and `sourceTextForAi`. The server will set `ai_accepted_at = NOW()` upon creation.
- **US-003: Manual Flashcard Creation:** Implemented by `POST /api/flashcards` with `isAiGenerated: false` (or omitted).
- **US-004: Flashcard Editing:** Implemented by `PATCH /api/flashcards/{flashcardId}`. RLS ensures users can only edit their own flashcards. The `updated_at` field is automatically managed by the database trigger (`trigger_set_timestamp`).
- **US-005: Flashcard Deletion:** Implemented by `DELETE /api/flashcards/{flashcardId}`. This performs a soft delete (sets `is_deleted = true` and `deleted_at = NOW()`). RLS ensures users can only delete their own flashcards.
- **US-006: Flashcard Browsing:** Implemented by `GET /api/flashcards`. RLS ensures users only see their own non-deleted flashcards. Query parameters support pagination, sorting, and searching.
- **Contact Form:** Implemented by `POST /api/contact-submissions`. If the user is authenticated, `user_id` is automatically linked.

### 4.3. General Considerations

- **Error Handling:** Consistent error response format: `{ "error": "Error message", "details": { ... } }`.
- **Date/Time:** All timestamps are in ISO 8601 format (UTC).
- **Idempotency:** `DELETE` is idempotent. `PATCH` and `POST` are not typically idempotent, but care should be taken in retry logic if applicable.
- **Rate Limiting:** (Future consideration) Implement rate limiting on sensitive or expensive endpoints like AI generation to prevent abuse. This might be handled at a gateway level or via Astro middleware.
- **Soft Deletes:** Flashcards are soft-deleted as per the database schema. API responses for lists and single retrievals will typically filter out soft-deleted items unless explicitly requested by an admin-level interface (not in current scope).
