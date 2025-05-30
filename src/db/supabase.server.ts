import { createServerClient } from "@supabase/ssr";
import type { Database } from "../db/database.types.ts";
import type { AstroCookies } from "astro";

export function createSupabaseServerClient(cookies: AstroCookies, request: Request) {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_KEY;

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        // Parsujemy cookies z request headers
        const cookieHeader = request.headers.get("cookie");
        if (!cookieHeader) return [];

        return cookieHeader
          .split(";")
          .map((cookie) => cookie.trim())
          .filter((cookie) => cookie.length > 0)
          .map((cookie) => {
            const [name, ...valueParts] = cookie.split("=");
            return {
              name: name.trim(),
              value: valueParts.join("=").trim(),
            };
          });
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, options);
        });
      },
    },
  });
}
