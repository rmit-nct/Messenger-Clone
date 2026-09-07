import { z } from 'zod'

const email = z.string().min(1, 'Enter your email').email('Invalid email')

const password = z.string().min(8, 'Password must have at least 8 character')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Please enter your password'),
})

export const signupSchema = z
  .object({
    email,
    password,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Password did not match',
    path: ['confirmPassword'],
  })

export const recoverSchema = z.object({ email })

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, 'please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Password did not match',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type RecoverInput = z.infer<typeof recoverSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
