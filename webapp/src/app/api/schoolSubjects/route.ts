import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {

    try {
        const schoolSubjects = await prisma.schoolSubject.findMany();
        return NextResponse.json(schoolSubjects)
    } catch (error) {
        console.error('Error getting schoolSubjects:', error);
        return NextResponse.json({ error: 'Error getting schoolSubjects' }, { status: 404 });
    }
}