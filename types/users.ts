import { z } from 'zod';

export const userIdSchema = z.string().uuid();
export const userObjectIdSchema = z.object({ id: userIdSchema });

export const userSchema = z.object({
  email: z.string(),
  encrypted_password: z.string(),
});

export const persistantUserSchema = userSchema.and(userObjectIdSchema);
export type PersistantUser = z.infer<typeof persistantUserSchema>;
