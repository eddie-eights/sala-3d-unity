import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from apps/web/.env (one level up from scripts folder)
dotenv.config({ path: resolve(__dirname, '../.env') });

const sql = postgres(process.env.DATABASE_URL);

async function recreatePasskeyTable() {
  try {
    console.log('Dropping and recreating passkey table with correct schema...');
    
    // Drop the existing table
    await sql`DROP TABLE IF EXISTS passkey CASCADE;`;
    console.log('Dropped passkey table.');
    
    // Create the table with the correct schema matching better-auth v1.4.6 expectations
    // Note: webauthn_user_id is nullable because better-auth doesn't send it
    await sql`
      CREATE TABLE "passkey" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text,
        "public_key" text NOT NULL,
        "user_id" text NOT NULL REFERENCES "users"("id"),
        "webauthn_user_id" text,
        "credential_id" text NOT NULL,
        "counter" integer NOT NULL,
        "device_type" text NOT NULL,
        "backed_up" boolean NOT NULL,
        "transports" text,
        "aaguid" text,
        "created_at" timestamp
      );
    `;
    console.log('Created passkey table with correct schema!');
    
    // Show final schema
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'passkey'
      ORDER BY ordinal_position;
    `;
    
    console.log('\nPasskey table columns:');
    console.table(columns);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
  }
}

recreatePasskeyTable();
