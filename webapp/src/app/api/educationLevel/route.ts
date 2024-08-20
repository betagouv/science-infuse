import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {

    try {
        const educationLevels = await prisma.educationLevel.findMany();
        return NextResponse.json(educationLevels)
    } catch (error) {
        console.error('Error getting EducationLevel:', error);
        return NextResponse.json({ error: 'Error getting EducationLevel' }, { status: 404 });
    }
}