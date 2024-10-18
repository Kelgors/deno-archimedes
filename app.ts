import { Hono } from 'hono';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { Client } from 'postgres';
import routers from './routers/main.ts';
import { HonoEnv } from './types/hono.ts';

export function createApp(db: Client) {
  const app = new Hono<HonoEnv>();

  app.use(trimTrailingSlash());

  app.use(async (c, next) => {
    c.set('db', db);
    await next();
  });

  app.route('/', routers);

  return app;
}
