import type { Tables, TablesInsert, TablesUpdate } from "./db/database.types";

// --- Flashcard Types ---

/**
 * Represents a flashcard data transfer object as returned by the API.
 * Maps to the 'flashcards' table in the database.
 */
export interface FlashcardDto {
  id: Tables<"flashcards">["id"];
  userId: Tables<"flashcards">["user_id"];
  question: Tables<"flashcards">["question"];
  answer: Tables<"flashcards">["answer"];
  sourceTextForAi: Tables<"flashcards">["source_text_for_ai"];
  isAiGenerated: Tables<"flashcards">["is_ai_generated"];
  aiAcceptedAt: Tables<"flashcards">["ai_accepted_at"];
  createdAt: Tables<"flashcards">["created_at"];
  updatedAt: Tables<"flashcards">["updated_at"];
  isDeleted: Tables<"flashcards">["is_deleted"];
}

/**
 * Command model for creating a new flashcard.
 * Used as the request body for POST /api/flashcards.
 */
export interface CreateFlashcardCommand {
  question: TablesInsert<"flashcards">["question"];
  answer: TablesInsert<"flashcards">["answer"];
  isAiGenerated?: TablesInsert<"flashcards">["is_ai_generated"];
  sourceTextForAi?: TablesInsert<"flashcards">["source_text_for_ai"];
}

/**
 * Represents a flashcard item in a list response.
 * A subset of FlashcardDto fields.
 */
export type FlashcardListItemDto = Pick<
  FlashcardDto,
  "id" | "userId" | "question" | "answer" | "isAiGenerated" | "aiAcceptedAt" | "createdAt" | "updatedAt"
>;

/**
 * Represents pagination details included in list responses.
 */
export interface PaginationDetails {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

/**
 * DTO for the response of GET /api/flashcards, containing a list of flashcards and pagination info.
 */
export interface FlashcardsListDto {
  data: FlashcardListItemDto[];
  pagination: PaginationDetails;
}

/**
 * Defines the possible sort fields for querying flashcards.
 */
export type GetFlashcardsSortBy = "createdAt" | "updatedAt" | "question";

/**
 * Model for query parameters when fetching a list of flashcards.
 * Used for GET /api/flashcards.
 */
export interface GetFlashcardsQuery {
  page?: number | null;
  limit?: number | null;
  sortBy?: GetFlashcardsSortBy | null; // Maps to DB columns: created_at, updated_at, question
  sortOrder?: "asc" | "desc" | null;
  search?: string | null;
  isAiGenerated?: boolean | null; // Maps to DB column: is_ai_generated
}

/**
 * Command model for updating an existing flashcard.
 * Used as the request body for PATCH /api/flashcards/{flashcardId}.
 * All fields are optional.
 */
export type UpdateFlashcardCommand = Partial<Pick<TablesUpdate<"flashcards">, "question" | "answer">>;

// --- AI Flashcard Generation Types ---

/**
 * Command model for generating flashcard suggestions using AI.
 * Used as the request body for POST /api/flashcards/generate-ai.
 */
export interface GenerateAiFlashcardsCommand {
  sourceText: string;
}

/**
 * Represents a single AI-generated flashcard suggestion.
 */
export interface AiFlashcardSuggestionItem {
  suggestedQuestion: string;
  suggestedAnswer: string;
  aiModelUsed: string;
}

/**
 * DTO for the response of POST /api/flashcards/generate-ai, containing AI-generated suggestions.
 */
export interface AiFlashcardSuggestionsDto {
  suggestions: AiFlashcardSuggestionItem[];
  sourceTextEcho: string; // Echoes back the original source text for reference.
}

// --- Contact Submission Types ---

/**
 * Command model for creating a new contact form submission.
 * Used as the request body for POST /api/contact-submissions.
 */
export interface CreateContactSubmissionCommand {
  emailAddress: TablesInsert<"contact_form_submissions">["email_address"];
  subject?: TablesInsert<"contact_form_submissions">["subject"];
  messageBody: TablesInsert<"contact_form_submissions">["message_body"];
}

/**
 * Represents a contact form submission data transfer object as returned by the API.
 * Maps to the 'contact_form_submissions' table in the database.
 */
export interface ContactSubmissionDto {
  id: Tables<"contact_form_submissions">["id"];
  userId: Tables<"contact_form_submissions">["user_id"];
  emailAddress: Tables<"contact_form_submissions">["email_address"];
  subject: Tables<"contact_form_submissions">["subject"];
  messageBody: Tables<"contact_form_submissions">["message_body"];
  submittedAt: Tables<"contact_form_submissions">["submitted_at"];
}

// --- Registration Types ---

/**
 * Command model for user registration form data.
 * Used with react-hook-form and Zod validation.
 */
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  privacyPolicyAccepted: boolean;
}

/**
 * Props interface for RegistrationForm component.
 */
export interface RegistrationFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isLoading: boolean;
  apiError: string | null;
}

/**
 * Props interface for PrivacyPolicyLink component.
 */
export interface PrivacyPolicyLinkProps {
  href: string;
  children?: React.ReactNode;
}

// --- Login Types ---

/**
 * Command model for user login form data.
 * Used with react-hook-form and Zod validation.
 */
export interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Props interface for LoginForm component.
 */
export interface LoginFormProps {
  onLoginSuccess?: () => void;
}

// --- Dashboard Types ---

/**
 * Type definition for dashboard tab types.
 */
export type DashboardTabType = "ai-generator" | "my-flashcards";

/**
 * State interface for AI generation functionality.
 */
export interface AiGenerationState {
  isGenerating: boolean;
  suggestions: AiFlashcardSuggestionItem[];
  sourceText: string;
  error?: string;
  lastGeneratedAt?: Date;
}

/**
 * State interface for flashcards management.
 */
export interface FlashcardsState {
  flashcards: FlashcardListItemDto[];
  isLoading: boolean;
  pagination: PaginationDetails;
  filters: GetFlashcardsQuery;
  error?: string;
  lastFetchedAt?: Date;
}

// --- Component Props Types ---

/**
 * Props for AI Generator Form component.
 */
export interface AiGeneratorFormProps {
  onGenerate: (command: GenerateAiFlashcardsCommand) => Promise<void>;
  isGenerating: boolean;
  error?: string;
}

/**
 * Props for AI Suggestions List component.
 */
export interface AiSuggestionsListProps {
  suggestions: AiFlashcardSuggestionItem[];
  onAccept: (suggestion: AiFlashcardSuggestionItem) => Promise<FlashcardDto | null>;
  onReject: (suggestion: AiFlashcardSuggestionItem) => void;
}

/**
 * Props for Flashcards Controls component.
 */
export interface FlashcardsControlsProps {
  filters: GetFlashcardsQuery;
  onFiltersChange: (filters: Partial<GetFlashcardsQuery>) => void;
  onCreateNew: () => void;
  totalCount?: number;
}

/**
 * Props for Flashcards List component.
 */
export interface FlashcardsListProps {
  flashcards: FlashcardListItemDto[];
  pagination: PaginationDetails;
  isLoading: boolean;
  onEdit: (flashcard: FlashcardListItemDto) => void;
  onDelete: (flashcardId: string) => Promise<void>;
  onPageChange: (page: number) => void;
}

/**
 * Props for individual Flashcard Item component.
 */
export interface FlashcardItemProps {
  flashcard: FlashcardListItemDto;
  onEdit: (flashcard: FlashcardListItemDto) => void;
  onDelete: (flashcardId: string) => Promise<void>;
  isDeleting?: boolean;
}

/**
 * Props for Flashcard Modal components (create/edit).
 */
export interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFlashcardCommand | UpdateFlashcardCommand) => Promise<void>;
  isSubmitting: boolean;
  flashcard?: FlashcardDto; // dla edycji
}

/**
 * Props for Flashcard Edit Modal component (specific interface).
 */
export interface FlashcardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateFlashcardCommand) => Promise<void>;
  isSubmitting: boolean;
  flashcard?: FlashcardDto | FlashcardListItemDto;
}

// --- Additional AI Generator Types ---

/**
 * Props for individual AI Suggestion Card component.
 */
export interface AiSuggestionCardProps {
  suggestion: AiFlashcardSuggestionItem;
  onAccept: (suggestion: AiFlashcardSuggestionItem) => Promise<FlashcardDto | null>;
  onReject: (suggestion: AiFlashcardSuggestionItem) => void;
  isProcessing?: boolean;
}

/**
 * State interface for editable suggestion functionality.
 */
export interface EditableSuggestionState {
  question: string;
  answer: string;
  isEditing: boolean;
  hasChanges: boolean;
  originalSuggestion: AiFlashcardSuggestionItem;
}

/**
 * Props for character counter component.
 */
export interface CharacterCounterProps {
  current: number;
  min: number;
  max: number;
  showProgress?: boolean;
}

/**
 * Interface for validation state.
 */
export interface ValidationState {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

// --- New ViewModel Types for My Flashcards View ---

/**
 * Stan głównego widoku My Flashcards
 */
export interface MyFlashcardsViewState {
  flashcards: FlashcardListItemDto[];
  pagination: PaginationDetails;
  filters: GetFlashcardsQuery;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt?: Date;
}

/**
 * Stan modali w widoku My Flashcards
 */
export interface ModalState {
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

/**
 * Błędy API
 */
export interface ApiError {
  message: string;
  details?: Record<string, string[]>;
  status?: number;
}

/**
 * Błędy walidacji formularza
 */
export interface ValidationErrors {
  question?: string;
  answer?: string;
}

/**
 * Propsy głównego komponentu My Flashcards View
 */
export interface MyFlashcardsViewProps {
  initialFilters?: Partial<GetFlashcardsQuery>;
}

/**
 * Props for Delete Confirm Modal component.
 */
export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  flashcard?: FlashcardListItemDto;
  isDeleting: boolean;
}

// --- FAQ Types ---

/**
 * Reprezentuje pojedyncze pytanie i odpowiedź w sekcji FAQ
 */
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

/**
 * Props dla komponentu FAQAccordion
 */
export interface FAQAccordionProps {
  items: FAQItem[];
  allowMultiple?: boolean;
  className?: string;
}

/**
 * Opcjonalny typ dla grupowania FAQ w kategorie
 */
export interface FAQCategory {
  id: string;
  title: string;
  items: FAQItem[];
}
