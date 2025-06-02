import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "../db/supabase.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../db/database.types";

/**
 * Middleware for handling authentication and Supabase client initialization.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  // Initialize Supabase client with cookie support for SSR
  const supabase: SupabaseClient<Database> = createSupabaseServerClient(context.cookies, context.request);

  // Handle user session based on cookies
  let session = null;

  try {
    // Get user from Supabase (more secure than getSession)
    const { data: userData, error } = await supabase.auth.getUser();

    if (error) {
      console.warn("Error getting user from Supabase:", error.message);
    } else if (userData.user) {
      session = {
        user: {
          id: userData.user.id,
          email: userData.user.email,
          aud: userData.user.aud,
          role: userData.user.role,
          created_at: userData.user.created_at,
          updated_at: userData.user.updated_at,
          user_metadata: userData.user.user_metadata,
          app_metadata: userData.user.app_metadata,
        },
      };
    }
  } catch (e) {
    console.error("Error processing user session:", e);
  }

  context.locals.supabase = supabase;
  context.locals.session = session;

  return next();
});
