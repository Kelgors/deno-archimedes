import { exists } from '@std/fs';
import { Hono } from 'hono';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { Client } from 'postgres';
import { PRIVATE_KEY_PATH } from './env.ts';
import routers from './routers/main.ts';
import { HonoEnv } from './types/hono.ts';

export async function createApp(db: Client) {
  const key = await loadPrivateKey();
  const secret = (await Deno.readFile(PRIVATE_KEY_PATH)).slice(0, 16);
  const app = new Hono<HonoEnv>();

  app.use(trimTrailingSlash());

  app.use(async (c, next) => {
    c.set('db', db);
    c.set('privateKey', key);
    c.set('secret', secret);
    await next();
  });

  app.route('/', routers);

  return app;
}

export async function loadPrivateKey() {
  const format: Exclude<KeyFormat, 'jwk'> = 'raw';
  const alg: HmacImportParams = { name: 'HMAC', hash: 'SHA-512' };
  const keyUsages: KeyUsage[] = ['sign', 'verify'];

  const isKeyExists = await exists(PRIVATE_KEY_PATH, { isFile: true });
  if (isKeyExists) {
    return crypto.subtle.importKey(format, await Deno.readFile(PRIVATE_KEY_PATH), alg, true, keyUsages);
  }

  const key = await crypto.subtle.generateKey(alg, true, keyUsages);
  const buf = await crypto.subtle.exportKey(format, key);
  await Deno.writeFile(PRIVATE_KEY_PATH, new Uint8Array(buf));

  return key;
}
