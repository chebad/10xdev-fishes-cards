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
    // Get session from Supabase (checks cookies automatically)
    const { data: sessionData, error } = await supabase.auth.getSession();

    if (error) {
      console.warn("Error getting session from Supabase:", error.message);
    } else if (sessionData.session) {
      session = {
        user: {
          id: sessionData.session.user.id,
          email: sessionData.session.user.email,
          aud: sessionData.session.user.aud,
          role: sessionData.session.user.role,
          created_at: sessionData.session.user.created_at,
          updated_at: sessionData.session.user.updated_at,
          user_metadata: sessionData.session.user.user_metadata,
          app_metadata: sessionData.session.user.app_metadata,
        },
      };
    }
  } catch (e) {
    console.error("Error processing session:", e);
  }

  context.locals.supabase = supabase;
  context.locals.session = session;

  return next();
});
