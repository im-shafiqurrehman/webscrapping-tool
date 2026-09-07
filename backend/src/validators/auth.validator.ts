import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Enter a valid email address').max(254);

export const loginInput = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(72, 'Password is too long'),
});

export const signupInput = z.object({
  name: z.string().trim().min(2, 'Name must contain at least 2 characters').max(80),
  email,
  password: z
    .string()
    .min(8, 'Password must contain at least 8 characters')
    .max(72, 'Password is too long')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/\d/, 'Password must include a number'),
});
