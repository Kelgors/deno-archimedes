import { verify as pwdVerify } from 'argon2';
import { create as jwtCreate, verify as jwtVerify } from 'djwt';
import { Hono } from 'hono';
import { createRefreshToken, findUserByEmail, isTokenPresent } from '../db/repositories/auth_sql.ts';
import { zJsonValidator } from '../middlewares/zValidator.ts';
import {
  authRefreshBodySchema,
  authSignBodySchema,
  type DecodedRefreshToken,
  decodedRefreshTokenSchema,
} from '../types/auth.ts';
import type { HonoEnv } from '../types/hono.ts';

const router = new Hono<HonoEnv>();

router.post('/sign', zJsonValidator(authSignBodySchema), async (c) => {
  const body = c.req.valid('json');

  const dbUser = await findUserByEmail(c.get('db'), { email: body.email });
  if (!dbUser?.id) return c.notFound();

  const isMatching = await pwdVerify(dbUser.encryptedPassword, body.password, c.get('secret'));
  if (!isMatching) {
    return c.notFound();
  }

  const now = new Date();
  const dbRefreshToken = await createRefreshToken(c.get('db'), {
    createdAt: now,
    expireAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30),
    userId: dbUser.id,
  });
  if (!dbRefreshToken) return c.json({}, 500);

  const accessToken = await jwtCreate({ alg: 'HS512', typ: 'JWT' }, {
    sub: dbUser.id,
    exp: Math.floor(now.getTime() / 1000) + 60 * 10,
  }, c.get('privateKey'));

  const refreshToken = await jwtCreate({ alg: 'HS512', typ: 'JWT' }, {
    jti: dbRefreshToken.id,
    sub: dbRefreshToken.userId,
    iat: dbRefreshToken.createdAt.getTime(),
    exp: dbRefreshToken.expireAt.getTime(),
  }, c.get('privateKey'));

  return c.json({ accessToken, refreshToken }, 201);
});

router.post('/renew', zJsonValidator(authRefreshBodySchema), async (c) => {
  const body = c.req.valid('json');
  let refreshToken: DecodedRefreshToken;
  try {
    const payload = await jwtVerify(body.refreshToken, c.get('privateKey'));
    refreshToken = decodedRefreshTokenSchema.parse(payload);
  } catch {
    return c.json({ error: { message: 'Token signature is wrong' } }, 400);
  }

  if (Date.now() > (refreshToken.exp ?? 0)) {
    return c.json({ error: { message: 'Expired refresh token' } }, 400);
  }

  const result = await isTokenPresent(c.get('db'), { id: refreshToken.jti, userId: refreshToken.sub });
  if (!result?.present) {
    return c.json({ error: { message: 'Token not found' } }, 404);
  }

  const accessToken = await jwtCreate({ alg: 'HS512', typ: 'JWT' }, {
    sub: refreshToken.sub,
    exp: Math.floor(Date.now() / 1000) + 60 * 10,
  }, c.get('privateKey'));
  return c.json({ accessToken });
});

export default router;
