import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const passwordErrorMessage =
  'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).';

export const registerSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters'),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters'),
    email: z
      .string()
      .email('Invalid email address format'),
    password: z
      .string()
      .regex(passwordRegex, passwordErrorMessage),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email address format'),
    password: z
      .string()
      .min(1, 'Password cannot be empty'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email address format'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z
      .string()
      .min(1, 'Token cannot be empty'),
    password: z
      .string()
      .regex(passwordRegex, passwordErrorMessage),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .min(1, 'Current password cannot be empty'),
    newPassword: z
      .string()
      .regex(passwordRegex, passwordErrorMessage),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }).optional(),
});
