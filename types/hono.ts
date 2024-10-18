import type { Client } from "postgres";

export type HonoEnv = {
  Variables: { db: Client };
};
