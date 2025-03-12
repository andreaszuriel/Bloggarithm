import { z as zod } from "zod";

export const signUpSchema = zod
  .object({
    username: zod
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must not exceed 20 characters"),
    
    firstname: zod
      .string()
      .min(3, "First name must be at least 3 characters")
      .max(50, "First name must not exceed 50 characters")
      .regex(/^[A-Za-z]+$/, "First name cannot contain numbers or symbols"),
    
    lastname: zod
      .string()
      .min(3, "Last name must be at least 3 characters")
      .max(50, "Last name must not exceed 50 characters")
      .regex(/^[A-Za-z]+$/, "Last name cannot contain numbers or symbols"),
    
    email: zod.string().email("Invalid email format"),

    password: zod
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/\d/, "Must contain at least one number")
      .regex(/[\W_]/, "Must contain at least one special character"),
    
    confirmPassword: zod.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpForm = zod.infer<typeof signUpSchema>;