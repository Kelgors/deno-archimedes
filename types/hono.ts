import type { Client } from 'postgres';
import type { DecodedAccessToken } from './auth.ts';

export type HonoEnv = {
  Variables: {
    db: Client;
    privateKey: CryptoKey;
    secret: Uint8Array;
    token: DecodedAccessToken;
  };
};
