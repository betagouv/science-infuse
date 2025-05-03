import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, User, UserRoles } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

interface AccessControlOptions {
    allowedRoles: (UserRoles | '*')[];
}

export const userFullFields = {
    id: true,
    firstName: true,
    job: true,
    email: true,
    roles: true,
    school: true,
    lastName: true,
    acceptMail: true,
    // emailVerified: true,
    creationDate: true,
    image: true,
    academyId: true,
    educationLevels: true,
    schoolSubjects: true,
    otherSchoolSubject: true
}

export const userIs = async (userIdOrUser: string | User | undefined, roles: UserRoles[]) => {
    let user: User | null;
    if (!userIdOrUser) return false;
    if (typeof userIdOrUser === 'string') {
        user = await prisma.user.findUnique({
            where: { id: userIdOrUser },
        });
    } else {
        user = userIdOrUser;
    }
    return user && roles.some(role => (user?.roles || []).includes(role))
};

export function withAccessControl(options: AccessControlOptions, handler: Function,) {
    return async (request: NextRequest, context: { params: { [key: string]: string } }) => {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });


        if (!user || !options.allowedRoles.some(role => role === '*' || (user?.roles || []).includes(role))) {
            return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return handler(request, { ...context, user });
    };
}