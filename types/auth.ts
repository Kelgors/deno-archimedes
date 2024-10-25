import { z } from 'zod';

export const authSignBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authRefreshBodySchema = z.object({
  refreshToken: z.string(),
});

export const decodedRefreshTokenSchema = z.object({
  jti: z.string().uuid(),
  exp: z.number().positive(),
  iat: z.number().positive(),
  sub: z.string().uuid(),
});

export type DecodedRefreshToken = z.infer<typeof decodedRefreshTokenSchema>;

export const decodedAccessTokenSchema = z.object({
  exp: z.number().positive(),
  sub: z.string().uuid(),
});

export type DecodedAccessToken = z.infer<typeof decodedAccessTokenSchema>;
