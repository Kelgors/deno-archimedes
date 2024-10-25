import { verify as jwtVerify } from 'djwt';
import type { Context, Next } from 'hono';
import { type DecodedAccessToken, decodedAccessTokenSchema } from '../types/auth.ts';

export function authenticate() {
  return async function authenticationHandler(c: Context, next: Next) {
    const [authType, authToken] = (c.req.header('authorization') || '').split(' ');
    if (!authType || !authToken) {
      return c.json({ error: { message: 'Missing token' } }, 401);
    }
    if (authType !== 'Bearer') {
      return c.json({ error: { message: 'This api only accept Bearer tokens' } }, 401);
    }

    let accessToken: DecodedAccessToken;
    try {
      const payload = await jwtVerify(authToken, c.get('privateKey'));
      accessToken = decodedAccessTokenSchema.parse(payload);
    } catch {
      return c.json({ error: { message: 'Wrong token signature' } }, 401);
    }
    if (Date.now() > (accessToken.exp ?? 0)) {
      return c.json({ error: { message: 'Token expired' } }, 401);
    }
    c.set('token', accessToken);

    await next();
  };
}
