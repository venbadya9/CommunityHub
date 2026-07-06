import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email")
    .email("Please enter a valid email address"),
  password: z.string().min(6, "Password should be at least 6 characters long"),
});

export type LoginFields = z.infer<typeof loginSchema>;
