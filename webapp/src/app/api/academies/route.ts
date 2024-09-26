import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {

    try {
        const academies = await prisma.academy.findMany();
        return NextResponse.json(academies)
    } catch (error) {
        console.error('Error getting academies:', error);
        return NextResponse.json({ error: 'Error getting academies' }, { status: 404 });
    }
}