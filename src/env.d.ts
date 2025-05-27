interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Astro.locals types
declare namespace App {
  interface Locals {
    supabase: import("@supabase/supabase-js").SupabaseClient<import("./db/database.types").Database>;
    session: {
      user: {
        id: string;
        email?: string;
        aud?: string;
        role?: string;
        created_at?: string;
        updated_at?: string;
        user_metadata?: Record<string, unknown>;
        app_metadata?: Record<string, unknown>;
      };
    } | null;
  }
}
