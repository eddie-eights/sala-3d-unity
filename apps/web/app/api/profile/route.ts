
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth.api.getSession({
        headers: headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
}

export async function PUT(req: Request) {
    const session = await auth.api.getSession({
        headers: headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

        return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((e as any).code === '23505') { // Postgres unique violation for username
             return NextResponse.json({ error: "Username already taken" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update profile", details: e.message }, { status: 500 });
    }
}
