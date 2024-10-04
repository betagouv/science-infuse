import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { UserFull } from "@/lib/api-client";
import { User } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, firstName, lastName, job, school, academyId, schoolSubjects, educationLevels }: Partial<User & UserFull> = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Vous devez fournir un email et un mot de passe." }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "Un compte est déjà associé à cet email." }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    const userData: any = {};
    if (school) userData.school = school;
    if (firstName) userData.firstName = firstName;
    if (lastName) userData.lastName = lastName;
    if (job) userData.job = job;
    if (academyId) userData.academyId = academyId;
    if (schoolSubjects) {
      userData.schoolSubjects = {
        connect: schoolSubjects.map(e => ({ id: e.id }))
      };
    }
    if (educationLevels) {
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

    return NextResponse.json({ message: "Utilisateur enregistré avec succès." }, { status: 201 })
  } catch (error) {
    console.log("ERROR", error)
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 })
  }
}