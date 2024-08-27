import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {

    try {
        const keyIdeas = await prisma.keyIdea.findMany();
        return NextResponse.json(keyIdeas)
    } catch (error) {
        console.error('Error reading file:', error);
        return NextResponse.json({ error: error }, { status: 404 });
    }
}