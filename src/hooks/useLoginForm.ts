import { useState } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";

import { toast } from "sonner";

import { supabaseClient } from "@/db/supabase.client";

import type { LoginFormData } from "@/types";

// Schemat walidacji dla formularza logowania

const loginSchema = z.object({
  email: z

    .string()

    .min(1, { message: "Adres email jest wymagany." })

    .email({ message: "Nieprawidłowy format adresu email." }),

  password: z

    .string()

    .min(1, { message: "Hasło jest wymagane." })

    .min(6, { message: "Hasło musi mieć co najmniej 6 znaków." }),
});

// Funkcja mapująca błędy Supabase na przyjazne komunikaty

function getErrorMessage(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "Nieprawidłowy email lub hasło.";
  }

  if (message.includes("Email not confirmed")) {
    return "Proszę potwierdzić swój adres email przed zalogowaniem.";
  }

  if (message.includes("Too many requests")) {
    return "Zbyt wiele prób logowania. Spróbuj ponownie za chwilę.";
  }

  if (message.includes("Invalid email")) {
    return "Nieprawidłowy format adresu email.";
  }

  return "Wystąpił błąd podczas logowania. Spróbuj ponownie.";
}

/**















 * Custom hook do zarządzania formularzem logowania















 * Hermetyzuje logikę formularza, interakcję z Supabase oraz zarządzanie stanami















 */

export function useLoginForm(onLoginSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);

  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",

      password: "",
    },

    mode: "onChange",

    reValidateMode: "onChange",
  });

  // Funkcja do obsługi przekierowań po pomyślnym logowaniu

  const handleSuccessRedirect = () => {
    if (onLoginSuccess) {
      onLoginSuccess();

      return;
    }

    // Sprawdź czy jest parametr redirect w URL

    const urlParams = new URLSearchParams(window.location.search);

    const redirectTo = urlParams.get("redirect");

    // Walidacja redirect URL - tylko względne ścieżki dla bezpieczeństwa

    let targetUrl = "/app"; // domyślne przekierowanie

    if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
      // Sprawdź czy to nie jest strona logowania/rejestracji (zapobieganie pętli)

      if (!redirectTo.startsWith("/login") && !redirectTo.startsWith("/register")) {
        targetUrl = redirectTo;
      }
    }

    // Przekierowanie z pełnym przeładowaniem strony, aby middleware mógł odczytać nową sesję

    setTimeout(() => {
      window.location.href = targetUrl;
    }, 1000);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    setApiError(null);

    try {
      const { data: authData, error } = await supabaseClient.auth.signInWithPassword({
        email: data.email,

        password: data.password,
      });

      if (error) {
        // Mapowanie błędów Supabase na przyjazne komunikaty

        const errorMessage = getErrorMessage(error.message);

        setApiError(errorMessage);

        toast.error("Błąd logowania", {
          description: errorMessage,
        });

        console.error("Supabase login error:", error);

        return;
      }

      if (authData.user && authData.session) {
        toast.success("Logowanie pomyślne!", {
          description: "Zostałeś pomyślnie zalogowany.",
        });

        // Sukces - obsłuż przekierowanie

        handleSuccessRedirect();
      }
    } catch (error: unknown) {
      console.error("Login submission error:", error);

      const errorMessage = "Wystąpił nieoczekiwany błąd podczas logowania. Spróbuj ponownie później.";

      setApiError(errorMessage);

      toast.error("Błąd logowania", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,

    onSubmit,

    isLoading,

    apiError,

    setApiError,

    isFormValid: form.formState.isValid,
  };
}
