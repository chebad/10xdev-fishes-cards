import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PrivacyPolicyLink } from "@/components/common/PrivacyPolicyLink";
import type { RegisterFormData, RegistrationFormProps } from "@/types";
import { registerFormSchema } from "./validation";

// Custom component to display all password validation errors

function PasswordErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;

  return (
    <div className="space-y-1">
      {errors.map((error, index) => (
        <p key={index} className="text-red-600 text-sm font-medium">
          {error}
        </p>
      ))}
    </div>
  );
}

export function RegistrationForm({ onSubmit, isLoading, apiError }: RegistrationFormProps) {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      privacyPolicyAccepted: false,
    },
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "all",
  });

  const handleSubmit = async (data: RegisterFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Registration form submission error:", error);
    }
  };

  const passwordValue = form.watch("password");
  const confirmPasswordValue = form.watch("confirmPassword");
  const isFormValid = form.formState.isValid;
  const passwordErrors = form.formState.errors.password;

  useEffect(() => {
    if (confirmPasswordValue) {
      form.trigger("confirmPassword");
    }
  }, [passwordValue, form, confirmPasswordValue]);

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-2xl font-bold text-center text-gray-900">Rejestracja</CardTitle>
        <CardDescription className="text-center text-gray-600 text-sm">
          Utwórz nowe konto, aby rozpocząć naukę z fiszkami
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Adres email</FormLabel>
                  <Input
                    type="email"
                    placeholder="twoj@email.com"
                    autoComplete="email"
                    disabled={isLoading}
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    {...field}
                  />
                  <FormMessage className="text-red-600 text-sm font-medium mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Hasło</FormLabel>
                  <Input
                    type="password"
                    placeholder="Wprowadź hasło"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    {...field}
                  />
                  <PasswordErrors errors={passwordErrors?.message ? [passwordErrors.message] : []} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Potwierdzenie hasła</FormLabel>
                  <Input
                    type="password"
                    placeholder="Powtórz hasło"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    {...field}
                  />
                  <FormMessage className="text-red-600 text-sm font-medium mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="privacyPolicyAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isLoading}
                      id="privacy-policy-checkbox"
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2 cursor-pointer relative z-10"
                      style={{ minWidth: "16px", minHeight: "16px" }}
                    />
                  </div>

                  <div className="grid gap-1.5 leading-none">
                    <FormLabel
                      htmlFor="privacy-policy-checkbox"
                      className="text-sm font-normal cursor-pointer text-gray-600 leading-relaxed"
                    >
                      Akceptuję <PrivacyPolicyLink href="/privacy-policy">politykę prywatności</PrivacyPolicyLink>
                    </FormLabel>
                    <FormMessage className="text-red-600 text-sm font-medium" />
                  </div>
                </FormItem>
              )}
            />

            {apiError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{apiError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejestrowanie...
                </>
              ) : (
                "Zarejestruj"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
