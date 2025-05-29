import type { APIRoute } from "astro";
import { CreateContactSubmissionSchema } from "../../lib/validation/contactSubmissionSchemas";
import { getContactSubmissionsService } from "../../lib/services/contactSubmissionsService";
import type { CreateContactSubmissionCommand, ContactSubmissionDto } from "../../types";

export const prerender = false;

/**
 * POST /api/contact-submissions
 *
 * Allows any user (authenticated or anonymous) to submit a message via the contact form.
 * If the user is authenticated, their user_id is associated with the submission.
 *
 * @param request - The HTTP request object containing submission data in body
 * @param locals - Astro locals containing session and supabase client
 *
 * Request Body:
 * - emailAddress: string (valid email, required) - Email address of the person submitting
 * - subject: string (optional) - Subject of the submission
 * - messageBody: string (required) - Content of the message
 *
 * @returns JSON response with created contact submission
 *
 * Response Codes:
 * - 201: Created - Submission created successfully
 * - 400: Bad Request - Invalid input (validation failed)
 * - 500: Internal Server Error - Unexpected server error
 */
export const POST: APIRoute = async ({ request, locals }) => {
  // Generate request ID for better debugging
  const requestId = Math.random().toString(36).substr(2, 9);
  console.log(`[API:${requestId}] POST /api/contact-submissions - Request started`);

  // 1. Pobranie danych użytkownika (opcjonalne - endpoint dostępny dla anonimowych)
  const { session, supabase } = locals;
  const userId = session?.user?.id || null;

  console.log(`[API:${requestId}] User context: ${userId ? `authenticated (${userId})` : "anonymous"}`);

  if (!supabase) {
    console.error(`[API:${requestId}] Supabase client not found in locals. Check middleware setup.`);
    return new Response(JSON.stringify({ error: "Server configuration error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Odczytanie i parsowanie ciała żądania
  let requestBody: CreateContactSubmissionCommand;
  try {
    requestBody = await request.json();
    console.log(`[API:${requestId}] Request body parsed successfully`);
  } catch (parseError) {
    console.error(`[API:${requestId}] Failed to parse JSON body:`, parseError);
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. Walidacja danych wejściowych
  const validationResult = CreateContactSubmissionSchema.safeParse(requestBody);
  if (!validationResult.success) {
    console.log(`[API:${requestId}] Validation failed:`, validationResult.error.flatten().fieldErrors);
    return new Response(
      JSON.stringify({
        error: "Validation failed",
        details: validationResult.error.flatten().fieldErrors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const validatedData = validationResult.data;
  console.log(
    `[API:${requestId}] Data validated - email: ${validatedData.emailAddress}, messageBodyLength: ${validatedData.messageBody.length}`
  );

  // 4. Wywołanie serwisu do zapisu zgłoszenia
  try {
    console.log(`[API:${requestId}] Creating contact submission`);

    const contactSubmissionsService = getContactSubmissionsService(supabase);
    const submissionDto: ContactSubmissionDto = await contactSubmissionsService.createSubmission(validatedData, userId);

    console.log(`[API:${requestId}] Contact submission created successfully: ${submissionDto.id}`);

    // 5. Zwrócenie odpowiedzi sukcesu (201 Created)
    return new Response(JSON.stringify(submissionDto), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error(`[API:${requestId}] Error during contact submission creation:`, error);

    // Handle specific service errors
    if (error instanceof Error) {
      // Handle database constraint violations
      if (error.message.includes("Duplicate submission detected")) {
        console.warn(`[API:${requestId}] Duplicate submission attempt`);
        return new Response(
          JSON.stringify({
            error: "Validation failed",
            details: { submission: "Duplicate submission detected." },
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (error.message.includes("violates database constraints")) {
        console.warn(`[API:${requestId}] Database constraint violation`);
        return new Response(
          JSON.stringify({
            error: "Validation failed",
            details: { submission: "Invalid submission data." },
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Handle database connection issues
      if (error.message.includes("Database connection error")) {
        console.error(`[API:${requestId}] Database connection error`);
        return new Response(JSON.stringify({ error: "Database connection error." }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Handle RLS policy violations
      if (error.message.includes("new row violates row-level security policy")) {
        console.error(`[API:${requestId}] RLS policy violation`);
        return new Response(JSON.stringify({ error: "Access denied." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Log specific error details for debugging
      console.error(`[API:${requestId}] Service error details:`, error.message);
    } else {
      console.error(`[API:${requestId}] Non-Error exception:`, error);
    }

    // Fallback to generic internal server error
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
