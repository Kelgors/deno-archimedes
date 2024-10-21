import { z } from 'zod';
import { userIdSchema } from './users.ts';

export const authSignBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authRefreshBodySchema = z.object({
  refreshToken: z.string(),
});

export const refreshTokenIdSchema = z.string().uuid();
export const refreshTokenObjectIdSchema = z.object({ id: refreshTokenIdSchema });

export const refreshTokenSchema = z.object({
  user_id: userIdSchema,
  created_at: z.date(),
  expire_at: z.date(),
});

export const persistantRefreshTokenSchema = refreshTokenSchema.and(refreshTokenObjectIdSchema);
export type PersistantRefreshToken = z.infer<typeof persistantRefreshTokenSchema>;

export type DecodedRefreshToken = {
  jti: string;
  exp: number;
  iat: number;
  sub: string;
};

export type DecodedAccessToken = {
  exp: number;
  sub: string;
};
