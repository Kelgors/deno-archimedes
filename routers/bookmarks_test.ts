import { expect } from '@std/expect';
import { after, before, describe, it } from '@std/testing/bdd';
import { assertSnapshot } from '@std/testing/snapshot';
import { create } from 'djwt';
import { createApp, ensureAppSecret } from '../app.ts';
import { createClient } from '../db/mod.ts';

const privateKey = await ensureAppSecret();
const db = createClient();
const app = await createApp(db);
before(async () => {
  await db.connect();
  await db.queryArray(await Deno.readTextFile('db/seeds/00-reset.sql'));
  await db.queryArray(await Deno.readTextFile('db/seeds/01-auth.sql'));
  await db.queryArray(await Deno.readTextFile('db/seeds/02-bookmarks.sql'));
});
after(() => db.end());

const VALID_TOKEN = await create({ alg: 'HS512', typ: 'JWT' }, {
  sub: '67558dc7-15a9-4ec7-baa4-43610a81d17a',
  exp: Date.now() + 600000,
}, privateKey);

const EXPIRED_TOKEN = await create({ alg: 'HS512', typ: 'JWT' }, {
  sub: '67558dc7-15a9-4ec7-baa4-43610a81d17a',
  exp: Date.now() - 1,
}, privateKey);

const DEFAULT_HEADERS = {
  Authorization: `Bearer ${VALID_TOKEN}`,
  'Content-Type': 'application/json',
};

let createItemId: string;

describe('GET /bookmarks', () => {
  it('should return bookmarks', async (t) => {
    const result = await app.request('/api/bookmarks', {
      headers: DEFAULT_HEADERS,
    });
    expect(result.status).toBe(200);
    assertSnapshot(t, await result.json());
  });

  it('should return 401 status when token is missing', async () => {
    const result = await app.request('/api/bookmarks');
    expect(result.status).toBe(401);
    await expect(result.json()).resolves.toEqual({
      error: { message: 'Missing token' },
    });
  });

  it('should return 401 status when token is expired', async () => {
    const result = await app.request('/api/bookmarks', {
      headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${EXPIRED_TOKEN}` },
    });
    expect(result.status).toBe(401);
    await expect(result.json()).resolves.toEqual({
      error: { message: 'Token expired' },
    });
  });
});

describe('POST /bookmarks', () => {
  it('should create a bookmark', async (t) => {
    const result = await app.request('/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify({
        name: 'name',
        url: 'http://url',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque tincidunt tortor in venenatis tincidunt. In a egestas ex, non egestas orci. Pellentesque in nisi pharetra, tempus augue ut, condimentum augue. Nunc sed sagittis mi. Suspendisse rutrum consequat finibus. Curabitur aliquam risus in consectetur fermentum. Cras in ligula eu massa condimentum ullamcorper vel vitae arcu. Aliquam nec aliquet ex, in mattis ante. Mauris enim orci, feugiat scelerisque posuere sit amet, auctor in lacus. Ut semper, dolor et elementum feugiat, orci nibh eleifend mi, eget pharetra neque neque ac eros. Praesent fringilla tellus eu purus semper, vel ultrices magna tempus. Nulla tristique sodales magna sit amet fringilla.',
      }),
      headers: DEFAULT_HEADERS,
    });
    expect(result.status).toBe(201);
    const body = await result.json();
    assertSnapshot(t, { ...body.data, id: undefined });
    expect(body.data.id).toHaveLength(36);
    createItemId = body.data.id;
  });

  it('should return a bad request response when body is not valid', async () => {
    const result = await app.request('/api/bookmarks', { method: 'POST', headers: DEFAULT_HEADERS });
    expect(result.status).toBe(400);
  });

  it('should return 401 status when token is missing', async () => {
    const result = await app.request('/api/bookmarks', { method: 'POST' });
    expect(result.status).toBe(401);
    await expect(result.json()).resolves.toEqual({
      error: { message: 'Missing token' },
    });
  });

  it('should return 401 status when token is expired', async () => {
    const result = await app.request('/api/bookmarks', {
      method: 'POST',
      headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${EXPIRED_TOKEN}` },
    });
    expect(result.status).toBe(401);
    await expect(result.json()).resolves.toEqual({
      error: { message: 'Token expired' },
    });
  });
});

describe('GET /bookmarks/:id', () => {
  it('should return google bookmark ', async (t) => {
    const result = await app.request('/api/bookmarks/99943bac-567a-4bee-ba4d-fc72fed4c26b', {
      headers: DEFAULT_HEADERS,
    });
    expect(result.status).toBe(200);
    assertSnapshot(t, await result.json());
  });

  it('should return the created item ', async (t) => {
    const result = await app.request(`/api/bookmarks/${createItemId}`, {
      headers: DEFAULT_HEADERS,
    });
    expect(result.status).toBe(200);
    const body = await result.json();
    expect(body?.data?.id).toBe(createItemId);
    delete body?.data?.id;
    assertSnapshot(t, body);
  });

  it("should not return the other user's bookmark", async () => {
    const result = await app.request(`/api/bookmarks/1227de09-0806-488e-8e8e-c366b16b1638`, {
      headers: DEFAULT_HEADERS,
    });
    expect(result.status).toBe(404);
  });

  it('should return a bad request when id param is not a uuid', async () => {
    const result = await app.request('/api/bookmarks/1', {
      headers: DEFAULT_HEADERS,
    });
    expect(result.status).toBe(400);
  });

  it('should return a not found response', async () => {
    const result = await app.request('/api/bookmarks/99999999-9999-4999-9999-999999999999', {
      headers: DEFAULT_HEADERS,
    });
    expect(result.status).toBe(404);
  });

  it('should return 401 status when token is missing', async () => {
    const result = await app.request('/api/bookmarks/99999999-9999-4999-9999-999999999999');
    expect(result.status).toBe(401);
    await expect(result.json()).resolves.toEqual({
      error: { message: 'Missing token' },
    });
  });

  it('should return 401 status when token is expired', async () => {
    const result = await app.request('/api/bookmarks/99999999-9999-4999-9999-999999999999', {
      headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${EXPIRED_TOKEN}` },
    });
    expect(result.status).toBe(401);
    await expect(result.json()).resolves.toEqual({
      error: { message: 'Token expired' },
    });
  });
});

describe('PUT /bookmarks/:id', () => {
  it('should update a bookmark', async (t) => {
    const result = await app.request(`/api/bookmarks/${createItemId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: 'updated-name',
        url: 'http://updated-url',
        description: 'updated description\n',
      }),
      headers: DEFAULT_HEADERS,
    });
    expect(result.status).toBe(200);
    const body = await result.json();
    assertSnapshot(t, { ...body.data, id: undefined });
    expect(body.data.id).toBe(createItemId);
  });

  it('should return a bad request when id param is not a uuid', async () => {
    const result = await app.request('/api/bookmarks/1', {
      headers: DEFAULT_HEADERS,
    });
    expect(result.status).toBe(400);
  });

  it('should return a not found response', async () => {
    const result = await app.request('/api/bookmarks/99999999-9999-4999-9999-999999999999', {
      headers: DEFAULT_HEADERS,
    });
    expect(result.status).toBe(404);
  });

  it('should return a bad request response when body is not valid', async () => {
    const result = await app.request('/api/bookmarks/99999999-9999-4999-9999-999999999999', {
      method: 'PUT',
      headers: DEFAULT_HEADERS,
    });
    expect(result.status).toBe(400);
  });

  it('should return 401 status when token is missing', async () => {
    const result = await app.request('/api/bookmarks/99999999-9999-4999-9999-999999999999', {
      method: 'PUT',
    });
    expect(result.status).toBe(401);
    await expect(result.json()).resolves.toEqual({
      error: { message: 'Missing token' },
    });
  });

  it('should return 401 status when token is expired', async () => {
    const result = await app.request('/api/bookmarks/99999999-9999-4999-9999-999999999999', {
      method: 'PUT',
      headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${EXPIRED_TOKEN}` },
    });
    expect(result.status).toBe(401);
    await expect(result.json()).resolves.toEqual({
      error: { message: 'Token expired' },
    });
  });
});

describe('DELETE /bookmarks/:id', () => {
  it('should delete a bookmark', async () => {
    const result = await app.request(`/api/bookmarks/${createItemId}`, { method: 'DELETE', headers: DEFAULT_HEADERS });
    expect(result.status).toBe(200);
  });

  it('should return a bad request when id param is not a uuid', async () => {
    const result = await app.request('/api/bookmarks/1', { headers: DEFAULT_HEADERS });
    expect(result.status).toBe(400);
  });

  it('should return a not found response', async () => {
    const result = await app.request('/api/bookmarks/99999999-9999-4999-9999-999999999999', {
      headers: DEFAULT_HEADERS,
    });
    expect(result.status).toBe(404);
  });

  it('should return 401 status when token is missing', async () => {
    const result = await app.request('/api/bookmarks/99999999-9999-4999-9999-999999999999', { method: 'DELETE' });
    expect(result.status).toBe(401);
    await expect(result.json()).resolves.toEqual({
      error: { message: 'Missing token' },
    });
  });

  it('should return 401 status when token is expired', async () => {
    const result = await app.request('/api/bookmarks/99999999-9999-4999-9999-999999999999', {
      method: 'DELETE',
      headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${EXPIRED_TOKEN}` },
    });
    expect(result.status).toBe(401);
    await expect(result.json()).resolves.toEqual({
      error: { message: 'Token expired' },
    });
  });
});
