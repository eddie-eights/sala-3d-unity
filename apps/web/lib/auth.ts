
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "@better-auth/passkey";


export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", 
        schema: {
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications,
            passkey: schema.passkey,
        },
    }),
    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }
    },
    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://192.168.3.53:3000",
        "http://192.168.3.53:8081",
        "exp://192.168.3.53:8081",
    ],
    plugins: [
        nextCookies(),
        passkey({
            rpID: "localhost",
            origin: "http://localhost:3000",
            rpName: "Sala 3D",
        })
    ],
    debug: true, // Enable debug logs to troubleshoot 500 error
});
