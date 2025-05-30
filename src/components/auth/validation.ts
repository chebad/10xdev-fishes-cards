import { z } from "zod";

export const registerFormSchema = z
  .object({
    email: z.string().min(1, "Email jest wymagany").email("Niepoprawny format adresu email"),
    password: z
      .string()
      .min(1, "Hasło jest wymagane")
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .refine((password) => /[a-z]/.test(password), {
        message: "Hasło musi zawierać co najmniej jedną małą literę",
      })
      .refine((password) => /[A-Z]/.test(password), {
        message: "Hasło musi zawierać co najmniej jedną wielką literę",
      })
      .refine((password) => /\d/.test(password), {
        message: "Hasło musi zawierać co najmniej jedną cyfrę",
      }),
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
    privacyPolicyAccepted: z.boolean().refine((val) => val === true, {
      message: "Musisz zaakceptować politykę prywatności",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });
