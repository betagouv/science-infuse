import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { User } from "@prisma/client";
import { UserFull } from "@/types/api";
import { sendMailCreated } from "@/mail/accountCreated";
import { userFullFields } from "../../accessControl";

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, firstName, lastName, job, school, academyId, schoolSubjects, educationLevels, otherSchoolSubject, acceptMail }: Partial<User & UserFull> = body;

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
    if (otherSchoolSubject) userData.otherSchoolSubject = otherSchoolSubject;
    if (firstName) userData.firstName = firstName;
    if (lastName) userData.lastName = lastName;
    if (job) userData.job = job;
    if (acceptMail !== undefined) userData.acceptMail = acceptMail;
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
      },
      select: userFullFields
    })

    await sendMailCreated(user)

    return NextResponse.json({ message: "Utilisateur enregistré avec succès." }, { status: 201 })
  } catch (error) {
    console.log("ERROR", error)
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 })
  }
}