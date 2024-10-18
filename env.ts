export const SERVER_PORT = Number(Deno.env.get('PORT')) || 3000;

export const DB_USER = Deno.env.get('DB_USER') || 'postgres';
export const DB_PASSWORD = Deno.env.get('DB_PASSWORD') || 'postgres';
export const DB_NAME = Deno.env.get('DB_NAME') || 'postgres';
export const DB_HOST = Deno.env.get('DB_HOST') || 'localhost';
export const DB_PORT = Number(Deno.env.get('DB_PORT')) || 5432;
