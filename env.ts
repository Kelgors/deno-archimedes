import '@std/dotenv/load';

export const SERVER_PORT = Number(Deno.env.get('PORT')) || 3000;
export const PRIVATE_KEY_PATH = Deno.env.get('PRIVATE_KEY_PATH') || 'private.key';
export const DATABASE_URL = Deno.env.get('DATABASE_URL') || '';
