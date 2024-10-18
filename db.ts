import { Client } from "postgres";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "./env.ts";

export function createClient() {
  return new Client({
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    hostname: DB_HOST,
    port: DB_PORT,
  });
}

export async function createConnection() {
  const client = createClient();
  await client.connect();

  return client;
}
