import { expect } from '@std/expect';
import { after, before, describe, it } from '@std/testing/bdd';
import { assertSnapshot } from '@std/testing/snapshot';
import { createApp } from '../app.ts';
import { createClient } from '../db/mod.ts';

const db = createClient();
const app = createApp(db);
before(async () => {
  await db.connect();
  const populateScript = await Deno.readTextFile('db/seeds/01-bookmarks.sql');
  await db.queryArray(populateScript);
});
after(() => db.end());

let createItemId: string;

describe('GET /bookmarks', () => {
  it('should return bookmarks', async (t) => {
    const result = await app.request('/api/bookmarks');
    expect(result.status).toBe(200);
    assertSnapshot(t, await result.json());
  });
});

describe('GET /bookmarks/:id', () => {
  it('should return google bookmark ', async (t) => {
    const result = await app.request('/api/bookmarks/99943bac-567a-4bee-ba4d-fc72fed4c26b');
    expect(result.status).toBe(200);
    assertSnapshot(t, await result.json());
  });

  it('should return a bad request when id param is not a uuid', async () => {
    const result = await app.request('/api/bookmarks/1');
    expect(result.status).toBe(400);
  });

  it('should return a not found response', async () => {
    const result = await app.request('/api/bookmarks/99999999-9999-4999-9999-999999999999');
    expect(result.status).toBe(404);
  });
});

describe('POST /bookmarks', () => {
  it('should create a bookmark', async (t) => {
    const result = await app.request('/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify({
        name: 'name',
        url: 'http://url',
        description: 'description\n',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result.status).toBe(201);
    const body = await result.json();
    assertSnapshot(t, { ...body.data, id: undefined });
    expect(body.data.id).toHaveLength(36);
    createItemId = body.data.id;
  });

  it('should return a bad request response when body is not valid', async () => {
    const result = await app.request('/api/bookmarks', { method: 'POST' });
    expect(result.status).toBe(400);
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
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result.status).toBe(200);
    const body = await result.json();
    assertSnapshot(t, { ...body.data, id: undefined });
    expect(body.data.id).toBe(createItemId);
  });

  it('should return a bad request when id param is not a uuid', async () => {
    const result = await app.request('/api/bookmarks/1');
    expect(result.status).toBe(400);
  });

  it('should return a not found response', async () => {
    const result = await app.request('/api/bookmarks/99999999-9999-4999-9999-999999999999');
    expect(result.status).toBe(404);
  });

  it('should return a bad request response when body is not valid', async () => {
    const result = await app.request('/api/bookmarks/99999999-9999-4999-9999-999999999999', { method: 'PUT' });
    expect(result.status).toBe(400);
  });
});

describe('DELETE /bookmarks/:id', () => {
  it('should delete a bookmark', async () => {
    const result = await app.request(`/api/bookmarks/${createItemId}`, { method: 'DELETE' });
    expect(result.status).toBe(200);
    await expect(result.json()).resolves.toEqual({ success: true });
  });

  it('should return a bad request when id param is not a uuid', async () => {
    const result = await app.request('/api/bookmarks/1');
    expect(result.status).toBe(400);
  });

  it('should return a not found response', async () => {
    const result = await app.request('/api/bookmarks/99999999-9999-4999-9999-999999999999');
    expect(result.status).toBe(404);
  });
});
