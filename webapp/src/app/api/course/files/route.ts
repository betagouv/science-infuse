import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic'
export async function GET(
    request: Request,
) {
    try {
        const session = await auth();

        const user = await prisma.user.findUnique({ where: { id: session?.user?.id } })
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const files = await prisma.file.findMany({ where: { userId: user.id } });

        return NextResponse.json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }
}
