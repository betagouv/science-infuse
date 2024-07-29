import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
    try {
        const { email, password, firstName, lastName } = await req.json()

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName
            }
        })

        return NextResponse.json({ message: "User created successfully" }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: "An error occurred" }, { status: 500 })
    }
}