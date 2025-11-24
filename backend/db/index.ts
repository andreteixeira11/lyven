import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
  throw new Error(
    '❌ Missing Turso credentials!\n' +
    'Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your .env file\n' +
    'See TURSO_SETUP.md for instructions'
  );
}

const client = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

export const db = drizzle(client, { schema });

export * from './schema';
