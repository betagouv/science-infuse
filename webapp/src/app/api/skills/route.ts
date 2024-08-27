import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {

    try {
        const skills = await prisma.skill.findMany();
        return NextResponse.json(skills)
    } catch (error) {
        console.error('Error reading file:', error);
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
}