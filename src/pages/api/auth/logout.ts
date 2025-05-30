import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../db/supabase.server";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Utwórz klienta Supabase z cookies
    const supabase = createSupabaseServerClient(cookies, request);

    // Wyloguj użytkownika
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return new Response(
        JSON.stringify({
          error: "Wystąpił błąd podczas wylogowania",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sukces - zwróć odpowiedź JSON
    return new Response(
      JSON.stringify({
        success: true,
        message: "Wylogowano pomyślnie",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected logout error:", error);
    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd podczas wylogowania",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
