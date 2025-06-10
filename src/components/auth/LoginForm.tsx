import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLoginForm } from "@/hooks/useLoginForm";
import type { LoginFormProps } from "@/types";

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { form, onSubmit, isLoading, apiError, isFormValid } = useLoginForm(onLoginSuccess);

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-2xl font-bold text-center text-gray-900">Logowanie</CardTitle>
        <CardDescription className="text-center text-gray-600 text-sm">Zaloguj się do swojego konta</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Adres email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="twoj@email.com"
                      autoComplete="email"
                      disabled={isLoading}
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      data-testid="email-input"
                      {...field}
                    />
                  </FormControl>
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
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Wprowadź hasło"
                      autoComplete="current-password"
                      disabled={isLoading}
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      data-testid="password-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 text-sm font-medium mt-1" />
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
              data-testid="login-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logowanie...
                </>
              ) : (
                "Zaloguj"
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Nie masz konta?{" "}
            <a
              href="/register"
              className="font-medium text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            >
              Zarejestruj się
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
