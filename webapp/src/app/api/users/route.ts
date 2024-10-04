import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession, User } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { userIs, withAccessControl } from '../accessControl';
import { UserRoles } from '@prisma/client';

export const GET = async (request: NextRequest, { params, user }: { params: { id: string }, user: User }) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                job: true,
                email: true,
                roles: true,
                school: true,
                lastName: true,
                emailVerified: true,
                image: true,
                academyId: true,
                educationLevels: true,
                schoolSubjects: true,
            }
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
};

// export const GET = withAccessControl(
//     { allowedRoles: ['ADMIN'] },
//     async (request: NextRequest, { params, user }: { params: { id: string }, user: User }) => {
//         try {
//             const users = await prisma.user.findMany();
//             return NextResponse.json(users);
//         } catch (error) {
//             console.error('Error fetching users:', error);
//             return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//         }
//     },
// )
