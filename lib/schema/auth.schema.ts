import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export const signupInitSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be under 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export const signupVerifySchema = z
  .object({
    otp: z
      .string()
      .min(1, "OTP is required")
      .length(6, "OTP must be 6 digits")
      .regex(/^\d{6}$/, "OTP must be numeric"),

    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .min(1, "OTP is required")
      .length(6, "OTP must be 6 digits")
      .regex(/^\d{6}$/, "OTP must be numeric"),

    newPassword: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormData          = z.infer<typeof loginSchema>;
export type SignupInitFormData     = z.infer<typeof signupInitSchema>;
export type SignupVerifyFormData   = z.infer<typeof signupVerifySchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData  = z.infer<typeof resetPasswordSchema>;
