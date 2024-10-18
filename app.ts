import { Hono } from "hono";
import { logger } from "hono/logger";
import routers from "./routers/main.ts";
import { Client } from "postgres";
import { HonoEnv } from "./types/hono.ts";
import { trimTrailingSlash } from "hono/trailing-slash";

export function createApp(db: Client) {
  const app = new Hono<HonoEnv>();

  app.use(trimTrailingSlash());
  app.use(logger());

  app.use(async (c, next) => {
    c.set("db", db);
    await next();
  });

  app.route("/", routers);

  return app;
}
