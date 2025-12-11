import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from apps/web/.env (one level up from scripts folder)
dotenv.config({ path: resolve(__dirname, '../.env') });

const sql = postgres(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('Checking if passkey table exists...');
    
    // Check if passkey table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'passkey'
      );
    `;
    
    if (!tableCheck[0].exists) {
      console.log('Creating passkey table...');
      await sql`
        CREATE TABLE "passkey" (
          "id" text PRIMARY KEY NOT NULL,
          "name" text,
          "public_key" text NOT NULL,
          "user_id" text NOT NULL,
          "webauthn_user_id" text NOT NULL,
          "credential_id" text NOT NULL,
          "counter" integer NOT NULL,
          "device_type" text NOT NULL,
          "backed_up" boolean NOT NULL,
          "transports" text,
          "created_at" timestamp
        );
      `;
      
      await sql`
        ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
      `;
      
      console.log('Passkey table created successfully!');
    } else {
      console.log('Passkey table exists. Checking for credential_id column...');
      
      const columnCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'passkey' AND column_name = 'credential_id'
        );
      `;
      
      if (!columnCheck[0].exists) {
        console.log('Adding credential_id column...');
        // First, drop any existing passkeys since we can't add NOT NULL without default
        await sql`DELETE FROM passkey;`;
        await sql`ALTER TABLE "passkey" ADD COLUMN "credential_id" text NOT NULL;`;
        console.log('credential_id column added successfully!');
      } else {
        console.log('credential_id column already exists.');
      }
      
      // Check for aaguid column
      const aaguidCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'passkey' AND column_name = 'aaguid'
        );
      `;
      
      if (!aaguidCheck[0].exists) {
        console.log('Adding aaguid column...');
        await sql`ALTER TABLE "passkey" ADD COLUMN "aaguid" text;`;
        console.log('aaguid column added successfully!');
      } else {
        console.log('aaguid column already exists.');
      }
    }
    
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

runMigration();
