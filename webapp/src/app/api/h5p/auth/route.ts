import { NextRequest, NextResponse } from "next/server"
import { SignJWT } from "jose"
import { auth } from "@/auth";

// Secret key for JWT - store this in environment variables
const JWT_SECRET = process.env.H5P_JWT_SECRET

export async function GET(req: NextRequest) {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Create a token with user info that the H5P server will validate
    const token = await new SignJWT({
        id: session.user.id,
        email: session.user.email,
        name: session.user.firstName
            ? `${session.user.firstName} ${session.user.lastName || ""}`
            : session.user.email,
        // Map your user roles to H5P roles
        role: session.user.roles?.includes("ADMIN")
            ? "admin"
            : session.user.roles?.includes("USER")
                ? "teacher"
                : "student"
    })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1h")
        .sign(new TextEncoder().encode(JWT_SECRET))

    return NextResponse.json({ token })
}