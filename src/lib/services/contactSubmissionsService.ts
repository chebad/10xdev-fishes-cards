import type { SupabaseClient } from "../../db/supabase.client";
import type { TablesInsert } from "../../db/database.types";
import type { CreateContactSubmissionCommand, ContactSubmissionDto } from "../../types";

/**
 * Handles business logic related to contact form submissions.
 */
export class ContactSubmissionsService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Creates a new contact form submission in the database.
   *
   * @param command - The command object containing submission data.
   * @param userId - The ID of the authenticated user (null for anonymous submissions).
   * @returns A promise that resolves to the created submission data.
   * @throws Error if the database operation fails.
   */
  async createSubmission(
    command: CreateContactSubmissionCommand,
    userId: string | null
  ): Promise<ContactSubmissionDto> {
    // Validate input parameters
    if (!command.emailAddress || !command.messageBody) {
      throw new Error("Missing required fields: emailAddress and messageBody are required");
    }

    // Prepare data for database insertion
    const submissionInsertData: TablesInsert<"contact_form_submissions"> = {
      user_id: userId,
      email_address: command.emailAddress,
      subject: command.subject ?? null,
      message_body: command.messageBody,
      submitted_at: new Date().toISOString(),
    };

    // Insert submission into database
    const { data, error } = await this.supabase
      .from("contact_form_submissions")
      .insert(submissionInsertData)
      .select()
      .single();

    if (error) {
      // Log the error for server-side diagnostics
      console.error("Error creating contact submission in Supabase:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      // Handle specific database errors
      if (error.code === "23505") {
        throw new Error("Duplicate submission detected");
      }
      if (error.code === "23514") {
        throw new Error("Submission data violates database constraints");
      }
      if (error.code === "42501") {
        throw new Error("Access denied - insufficient permissions");
      }
      if (error.message?.includes("new row violates row-level security policy")) {
        throw new Error("Access denied - RLS policy violation");
      }

      // Rethrow a more generic error
      throw new Error(`Failed to create contact submission: ${error.message}`);
    }

    if (!data) {
      // This case should ideally not happen if insert was successful and error is null,
      // but it's a good practice to handle it.
      console.error("No data returned after contact submission insert, despite no error.");
      throw new Error("Failed to create contact submission: no data returned.");
    }

    console.log("Contact submission created successfully in database:", data.id);

    // Map database result to DTO
    const submissionDto: ContactSubmissionDto = {
      id: data.id,
      userId: data.user_id,
      emailAddress: data.email_address,
      subject: data.subject,
      messageBody: data.message_body,
      submittedAt: data.submitted_at,
    };

    return submissionDto;
  }
}

/**
 * Factory function to create a ContactSubmissionsService instance.
 *
 * @param supabase - The Supabase client instance.
 * @returns A new ContactSubmissionsService instance.
 */
export function getContactSubmissionsService(supabase: SupabaseClient): ContactSubmissionsService {
  return new ContactSubmissionsService(supabase);
}
