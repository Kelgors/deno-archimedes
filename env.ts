import '@std/dotenv/load';

export const SERVER_PORT = Number(Deno.env.get('PORT')) || 3000;
export const APP_SECRET_PATH = Deno.env.get('APP_SECRET_PATH') || 'private.key';
export const DATABASE_URL = Deno.env.get('DATABASE_URL') || '';
