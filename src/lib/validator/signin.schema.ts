import { z as zod } from "zod";

export const signInSchema = zod.object({
  email: zod
    .string()
    .email("Invalid email format")
    .refine((email) => email.includes("mail.com"), {
      message: "Email must contain 'mail.com'",
    }),
  password: zod
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[\W_]/, "Password must contain at least one special character"),
});

export type SignInForm = zod.infer<typeof signInSchema>;