import { type Payload, verify as jwtVerify } from 'djwt';
import type { Context, Next } from 'hono';

export function authenticate() {
  return async function authenticationHandler(c: Context, next: Next) {
    const [authType, authToken] = (c.req.header('authorization') || '').split(' ');
    if (!authType || !authToken) {
      return c.json({ error: { message: 'Missing token' } }, 401);
    }
    if (authType !== 'Bearer') {
      return c.json({ error: { message: 'This api only accept Bearer tokens' } }, 401);
    }

    let token: Payload;
    try {
      token = await jwtVerify(authToken, c.get('privateKey'));
    } catch {
      return c.json({ error: { message: 'Wrong token signature' } }, 401);
    }
    if (Date.now() > (token.exp ?? 0)) {
      return c.json({ error: { message: 'Token expired' } }, 401);
    }
    c.set('token', token);

    await next();
  };
}
