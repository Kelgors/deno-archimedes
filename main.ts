import { createApp } from "./app.ts";
import { createConnection } from "./db.ts";
import { SERVER_PORT } from "./env.ts";

const db = await createConnection();
const app = createApp(db);
Deno.serve({ port: SERVER_PORT }, app.fetch);
