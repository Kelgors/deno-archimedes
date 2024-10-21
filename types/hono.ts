import type { Payload } from 'djwt';
import type { Client } from 'postgres';

export type HonoEnv = {
  Variables: {
    db: Client;
    privateKey: CryptoKey;
    secret: Uint8Array;
    token: Payload;
  };
};
