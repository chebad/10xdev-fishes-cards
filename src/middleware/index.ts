import { defineMiddleware } from "astro:middleware";
// Tymczasowo wyłączone - będzie przywrócone wraz z integracją Supabase
// import { createClient } from "@supabase/supabase-js";
// import type { Database } from "../db/database.types";
// import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Middleware for handling authentication and Supabase client initialization.
 * Tymczasowo wyłączone - będzie aktywowane po dodaniu integracji Supabase.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  // Tymczasowo pomijamy logikę Supabase dla podstawowej implementacji strony głównej
  // TODO: Przywrócić po instalacji @supabase/supabase-js i konfiguracji zmiennych środowiskowych

  /*
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

  // Initialize default Supabase client
  let supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey);

  // Handle user session based on JWT token
  const authHeader = context.request.headers.get("Authorization");
  let session = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      // Create Supabase client with user token in headers
      supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error) {
        if (
          error.message.includes("AuthApiError") &&
          (error.message.includes("invalid JWT") || error.message.includes("expired"))
        ) {
          console.warn("Invalid or expired JWT token provided.");
        } else {
          console.error("Error fetching user from Supabase:", error.message);
        }
      } else if (user) {
        session = { user };
      }
    } catch (e) {
      console.error("Error processing JWT token:", e);
    }
  }

  context.locals.supabase = supabase;
  context.locals.session = session;
  */

  return next();
});
