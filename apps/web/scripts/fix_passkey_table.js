import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  console.log('Creating passkey table...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "passkey" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text,
        "public_key" text NOT NULL,
        "user_id" text NOT NULL,
        "webauthn_user_id" text NOT NULL,
        "counter" integer NOT NULL,
        "device_type" text NOT NULL,
        "backed_up" boolean NOT NULL,
        "transports" text,
        "created_at" timestamp
      );
    `;
    console.log('passkey table created.');
    
    try {
        await sql`
        ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
        `;
        console.log('Constraint added.');
    } catch (e) {
        console.log('Constraint addition skipped (likely exists):', e.message);
    }

    console.log('Migration completed successfully.');
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    await sql.end();
  }
}

main();
