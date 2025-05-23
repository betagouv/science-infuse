import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';



export async function GET() {
  try {
    const themes = await prisma.theme.findMany();

    return NextResponse.json(themes);
  } catch (error) {
    console.error('Error fetching course chapters:', error);
    return NextResponse.json({ error: 'Failed to fetch course chapters' }, { status: 500 });
  }
}