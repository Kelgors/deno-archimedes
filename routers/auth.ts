import { verify as pwdVerify } from 'argon2';
import { create as jwtCreate, type Payload, verify as jwtVerify } from 'djwt';
import { Hono } from 'hono';
import { zJsonValidator } from '../middlewares/zValidator.ts';
import { authRefreshBodySchema, authSignBodySchema, PersistantRefreshToken } from '../types/auth.ts';
import type { HonoEnv } from '../types/hono.ts';
import type { PersistantUser } from '../types/users.ts';

const router = new Hono<HonoEnv>();

router.post('/sign', zJsonValidator(authSignBodySchema), async (c) => {
  const db = c.get('db');
  const body = c.req.valid('json');
  const result = await db.queryObject<PersistantUser>(
    `SELECT id, email, encrypted_password FROM users WHERE email = $EMAIL`,
    { email: body.email },
  );

  const dbUser = result.rows[0];
  if (!dbUser?.id) {
    return c.notFound();
  }

  const isMatching = await pwdVerify(
    dbUser.encrypted_password,
    body.password,
    c.get('secret'),
  );
  if (!isMatching) {
    return c.notFound();
  }

  const now = new Date();
  const refreshTokenResult = await db.queryObject<PersistantRefreshToken>(
    `INSERT INTO auth_refresh_tokens (created_at, expire_at, user_id) VALUES ($CREATED_AT, $EXPIRE_AT, $USER_ID) RETURNING *`,
    {
      created_at: now,
      expire_at: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30),
      user_id: dbUser.id,
    },
  );

  if (refreshTokenResult.rowCount !== 1) {
    return new Response(null, { status: 500 });
  }

  const accessToken = await jwtCreate({ alg: 'HS512', typ: 'JWT' }, {
    sub: dbUser.id,
    exp: Math.floor(now.getTime() / 1000) + 60 * 10,
  }, c.get('privateKey'));

  const dbRefreshToken = refreshTokenResult.rows[0];
  const refreshToken = await jwtCreate({ alg: 'HS512', typ: 'JWT' }, {
    jti: dbRefreshToken.id,
    sub: dbRefreshToken.user_id,
    iat: dbRefreshToken.created_at.getTime(),
    exp: dbRefreshToken.expire_at.getTime(),
  }, c.get('privateKey'));

  return c.json({ accessToken, refreshToken }, 201);
});

router.post('/renew', zJsonValidator(authRefreshBodySchema), async (c) => {
  const db = c.get('db');
  const body = c.req.valid('json');
  let refreshToken: Payload;
  try {
    refreshToken = await jwtVerify(body.refreshToken, c.get('privateKey'));
  } catch {
    return c.json({ error: { message: 'Token signature is wrong' } }, 400);
  }
  if (Date.now() > (refreshToken.exp ?? 0)) {
    return c.json({ error: { message: 'Expired refresh token' } }, 400);
  }

  const result = await db.queryObject<{ count: number }>(
    `SELECT COUNT(*)::int FROM auth_refresh_tokens WHERE id = $ID AND user_id = $USER_ID`,
    { id: refreshToken.jti, user_id: refreshToken.sub },
  );
  if ((result.rows[0]?.count ?? 0) !== 1) {
    return c.json({ error: { message: 'Token not found' } }, 404);
  }

  const accessToken = await jwtCreate({ alg: 'HS512', typ: 'JWT' }, {
    sub: refreshToken.sub,
    exp: Math.floor(Date.now() / 1000) + 60 * 10,
  }, c.get('privateKey'));
  return c.json({ accessToken });
});

export default router;
