import { z } from 'zod'

/** Login form schema */
export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

/** Signup form schema */
export const signupSchema = z.object({
  email: z.email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z
    .string()
    .min(8, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

/** Login form values */
export type LoginFormValues = z.infer<typeof loginSchema>

/** Signup form values */
export type SignupFormValues = z.infer<typeof signupSchema>
