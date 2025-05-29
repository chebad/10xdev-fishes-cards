import { z } from "zod";

/**
 * Schema for validating request body for POST /api/contact-submissions endpoint
 */
export const CreateContactSubmissionSchema = z.object({
  emailAddress: z
    .string({ required_error: "Email address is required." })
    .email({ message: "Invalid email format." })
    .max(255, { message: "Email address must not exceed 255 characters." }),
  subject: z.string().max(255, { message: "Subject must not exceed 255 characters." }).optional(),
  messageBody: z
    .string({ required_error: "Message body is required." })
    .min(1, { message: "Message body cannot be empty." })
    .max(5000, { message: "Message body must not exceed 5000 characters." })
    .trim(),
});
