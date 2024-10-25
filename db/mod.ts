import { Client } from 'postgres';
import { DATABASE_URL } from '../env.ts';

export function createClient() {
  return new Client(DATABASE_URL);
}

export async function createConnection() {
  const client = createClient();
  await client.connect();
  return client;
}
