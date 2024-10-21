import { expect } from '@std/expect/expect';
import { after, before, describe, it } from '@std/testing/bdd';
import { create as jwtCreate, decode, verify } from 'djwt';
import { createApp, ensureAppSecret } from '../app.ts';
import { createClient } from '../db/mod.ts';
import type { DecodedAccessToken, DecodedRefreshToken } from '../types/auth.ts';

const privateKey = await ensureAppSecret();
const db = createClient();
const app = await createApp(db);
before(async () => {
  await db.connect();
  await db.queryArray(await Deno.readTextFile('db/seeds/00-reset.sql'));
  await db.queryArray(await Deno.readTextFile('db/seeds/01-auth.sql'));
});
after(() => db.end());

const createdRefreshTokens: string[] = [];

describe('POST /api/auth/sign', () => {
  it('should return an access token', async () => {
    const result = await app.request('/api/auth/sign', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@mail.io', password: 'user' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result.status).toBe(201);
    const body = await result.json();

    const [, decodedAccessToken] = decode<DecodedAccessToken>(body.accessToken);

    expect(decodedAccessToken).toHaveProperty('sub', '67558dc7-15a9-4ec7-baa4-43610a81d17a');
    expect(typeof decodedAccessToken.exp).toBe('number');
  });

  it('should return a signed access token', async () => {
    const result = await app.request('/api/auth/sign', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@mail.io', password: 'user' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result.status).toBe(201);
    const body = await result.json();

    await expect(verify(body.accessToken, privateKey)).resolves.not.toThrow();
  });

  it('should return a refresh token', async () => {
    const result = await app.request('/api/auth/sign', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@mail.io', password: 'user' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result.status).toBe(201);
    const body = await result.json();
    createdRefreshTokens.push(body.refreshToken);

    const [, decodedRefreshToken] = decode<DecodedRefreshToken>(body.refreshToken);

    expect(decodedRefreshToken).toHaveProperty('sub', '67558dc7-15a9-4ec7-baa4-43610a81d17a');
    expect(typeof decodedRefreshToken.iat).toBe('number');
    expect(decodedRefreshToken).toHaveProperty('exp', decodedRefreshToken.iat + 1000 * 60 * 60 * 24 * 30);
    expect(decodedRefreshToken).toHaveProperty('jti');
  });

  it('should return a signed refresh token', async () => {
    const result = await app.request('/api/auth/sign', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@mail.io', password: 'user' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result.status).toBe(201);
    const body = await result.json();
    createdRefreshTokens.push(body.refreshToken);

    await expect(verify(body.refreshToken, privateKey)).resolves.not.toThrow();
  });

  it("should return a not found response when user don't exists", async () => {
    const result = await app.request('/api/auth/sign', {
      method: 'POST',
      body: JSON.stringify({ email: 'someone-not-existing@mail.io', password: 'user' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result.status).toBe(404);
  });

  it("should return a not found response when passwords don't match", async () => {
    const result = await app.request('/api/auth/sign', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@mail.io', password: 'wrong-password' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result.status).toBe(404);
  });

  it('should return a bad request response when body is not valid', async () => {
    const result = await app.request('/api/auth/sign', {
      method: 'POST',
    });
    expect(result.status).toBe(400);
  });
});

describe('POST /api/auth/renew', () => {
  it('should return an access token', async () => {
    const result = await app.request('/api/auth/renew', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: createdRefreshTokens.pop() }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result.status).toBe(200);
    const body = await result.json();
    const [, decodedAccessToken] = decode<DecodedAccessToken>(body.accessToken);

    expect(decodedAccessToken).toHaveProperty('sub', '67558dc7-15a9-4ec7-baa4-43610a81d17a');
    expect(typeof decodedAccessToken.exp).toBe('number');
  });

  it('should return a signed access token', async () => {
    const result = await app.request('/api/auth/renew', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: createdRefreshTokens.pop() }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result.status).toBe(200);
    const body = await result.json();

    await expect(verify(body.accessToken, privateKey)).resolves.not.toThrow();
  });

  it('should return a 400 when token is not signed with backend private key', async () => {
    const refreshToken = await jwtCreate({ alg: 'HS512', typ: 'JWT' }, {
      jti: '00000000-da2e-47b8-9040-140f652781aa',
      sub: '67558dc7-15a9-4ec7-baa4-43610a81d17a',
      iat: 1729483502463,
      exp: 2145927600000,
    }, await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-512' }, false, ['sign', 'verify']));

    const result = await app.request('/api/auth/renew', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result.status).toBe(400);
  });

  it('should return a 400 when refresh token is expired', async () => {
    const refreshToken = await jwtCreate({ alg: 'HS512', typ: 'JWT' }, {
      jti: '00000000-da2e-47b8-9040-140f652781aa',
      sub: '67558dc7-15a9-4ec7-baa4-43610a81d17a',
      iat: 1729483502463,
      exp: 1729483502463,
    }, privateKey);

    const result = await app.request('/api/auth/renew', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result.status).toBe(400);
  });

  it('should return a 404 when refresh token is unknown', async () => {
    const refreshToken = await jwtCreate({ alg: 'HS512', typ: 'JWT' }, {
      jti: '00000000-0000-4000-0000-000000000000',
      sub: '00000000-0000-4000-0000-000000000000',
      iat: 1729483502463,
      exp: 2145927600000,
    }, privateKey);

    const result = await app.request('/api/auth/renew', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result.status).toBe(404);
  });
});
