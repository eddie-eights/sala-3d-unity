
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// CORS helper for mobile app
function corsHeaders(origin: string | null): Record<string, string> {
    const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://192.168.3.53:8081",
    ];
    const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : "http://localhost:3000";
    return {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
    };
}

export async function OPTIONS(req: Request) {
    const origin = req.headers.get("origin");
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function GET(req: Request) {
    const origin = req.headers.get("origin");
    
    // Try cookie-based auth first (web app)
    let session = await auth.api.getSession({
        headers: headers()
    });

    // If no cookie session, try Bearer token (mobile app)
    if (!session) {
        const authHeader = req.headers.get("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            // Look up session by token in database
            const sessionData = await db.query.sessions.findFirst({
                where: eq(sessions.token, token),
            });
            
            if (sessionData && (!sessionData.expiresAt || new Date(sessionData.expiresAt) > new Date())) {
                const userData = await db.query.users.findFirst({
                    where: eq(users.id, sessionData.userId),
                });
                if (userData) {
                    session = { user: userData, session: sessionData } as any;
                }
            }
        }
    }

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders(origin) });
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404, headers: corsHeaders(origin) });
    }

    return NextResponse.json(user, { headers: corsHeaders(origin) });
}

export async function PUT(req: Request) {
    const origin = req.headers.get("origin");
    
    // Try cookie-based auth first (web app)
    let session = await auth.api.getSession({
        headers: headers()
    });

    // If no cookie session, try Bearer token (mobile app)
    if (!session) {
        const authHeader = req.headers.get("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            const sessionData = await db.query.sessions.findFirst({
                where: eq(sessions.token, token),
            });
            
            if (sessionData && (!sessionData.expiresAt || new Date(sessionData.expiresAt) > new Date())) {
                const userData = await db.query.users.findFirst({
                    where: eq(users.id, sessionData.userId),
                });
                if (userData) {
                    session = { user: userData, session: sessionData } as any;
                }
            }
        }
    }

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders(origin) });
    }

    const body = await req.json();
    const { username, gender, birthday, hometown, currentResidence, hobbies } = body;

    try {
        await db.update(users).set({
            username: username || null, // Allow setting to null if empty, though UI should enforce required
            gender,
            birthday: birthday ? new Date(birthday) : null,
            hometown,
            currentResidence,
            hobbies,
            updatedAt: new Date(),
        }).where(eq(users.id, session.user.id));

        return NextResponse.json({ success: true }, { headers: corsHeaders(origin) });
    } catch (e: any) {
        if (e.code === '23505') { // Postgres unique violation for username
             return NextResponse.json({ error: "Username already taken" }, { status: 400, headers: corsHeaders(origin) });
        }
        return NextResponse.json({ error: "Failed to update profile", details: e.message }, { status: 500, headers: corsHeaders(origin) });
    }
}
