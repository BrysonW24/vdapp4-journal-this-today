import { z } from 'zod';

/**
 * Reusable Zod validators for form validation
 * Can be used with react-hook-form resolver
 */

// Email validation
export const emailSchema = z
  .string('Email is required')
  .email('Invalid email address')
  .toLowerCase();

// Password validation - at least 8 chars, 1 uppercase, 1 number, 1 special char
export const passwordSchema = z
  .string('Password is required')
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*]/,
    'Password must contain at least one special character (!@#$%^&*)'
  );

// Strong password (for signup)
export const strongPasswordSchema = passwordSchema;

// Weak password (for password field)
export const weakPasswordSchema = z
  .string('Password is required')
  .min(6, 'Password must be at least 6 characters');

// Name validation
export const nameSchema = z
  .string('Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must not exceed 50 characters')
  .regex(
    /^[a-zA-Z\s'-]+$/,
    'Name can only contain letters, spaces, hyphens, and apostrophes'
  );

// Phone validation
export const phoneSchema = z
  .string('Phone is required')
  .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone number');

// URL validation
export const urlSchema = z.string().url('Invalid URL');

// Search query validation
export const searchSchema = z
  .string()
  .min(1, 'Search query required')
  .max(100, 'Search query too long');

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Common form schemas

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string('Password is required').min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: strongPasswordSchema,
  confirmPassword: z.string('Confirm password is required'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

export type SignupFormData = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: strongPasswordSchema,
  confirmPassword: z.string('Confirm password is required'),
  token: z.string('Reset token is required'),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// Helper function to get field error message
export function getFieldError(
  errors: z.ZodFormattedError<any>,
  fieldPath: string
): string | undefined {
  const parts = fieldPath.split('.');
  let current: any = errors;

  for (const part of parts) {
    if (current[part]) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return current._errors?.[0];
}
