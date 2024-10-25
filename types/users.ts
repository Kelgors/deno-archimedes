import { z } from 'zod';

export const userIdSchema = z.string().uuid();
export const userObjectIdSchema = z.object({ id: userIdSchema });

export const userSchema = z.object({
  email: z.string(),
  encrypted_password: z.string(),
});
