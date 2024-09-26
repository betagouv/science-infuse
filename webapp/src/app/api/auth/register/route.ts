import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { UserFull } from "@/lib/api-client";
import { User } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, firstName, lastName, school, academyId, schoolSubjects, educationLevels }: Partial<User & UserFull> = body;
    console.log("USER REGISTER", body);

    if (!email || !password) {
      return NextResponse.json({ error: "You need to provide email and password" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    const userData: any = {};
    if (school !== undefined) userData.school = school;
    if (firstName !== undefined) userData.firstName = firstName;
    if (lastName !== undefined) userData.lastName = lastName;
    if (academyId !== undefined) userData.academyId = academyId;
    if (schoolSubjects !== undefined) {
      userData.schoolSubjects = {
        connect: schoolSubjects.map(e => ({ id: e.id }))
      };
    }
    if (educationLevels !== undefined) {
      userData.educationLevels = {
        connect: educationLevels.map(e => ({ id: e.id }))
      };
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        ...userData
      }
    })

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 })
  }
}