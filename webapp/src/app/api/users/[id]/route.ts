import prisma from '@/lib/prisma';
import { getUserFull } from '@/lib/utils/db';
import { UserFull } from '@/types/api';
import { UserRoles } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { userIs } from '../../accessControl';
import { authOptions } from '../../auth/[...nextauth]/authOptions';

export async function GET(request: NextRequest,
  { params }: { params: { id: string } }
) {

  const session = await getServerSession(authOptions);


  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = params.id == "me" ? session.user.id : params.id;
  const isAdmin = await userIs(session.user.id, [UserRoles.ADMIN])
  try {
    let user: UserFull | null = null;

    if (isAdmin || session.user.id == userId) {
      user = await getUserFull(userId);
    }

    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest,
  { params }: { params: { id: string } }
) {

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = params.id == "me" ? session.user.id : params.id;
  const isAdmin = await userIs(session.user.id, [UserRoles.ADMIN])

  try {
    const body = await request.json();
    const { school, firstName, roles, lastName, job, academyId, educationLevels, schoolSubjects }: Partial<UserFull> = body;

    const updateData: any = {};
    if (school !== undefined) updateData.school = school;
    if (job !== undefined) updateData.job = job;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (isAdmin && roles !== undefined) updateData.roles = roles;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (academyId !== undefined) updateData.academyId = academyId;
    if (schoolSubjects !== undefined) {
      updateData.schoolSubjects = {
        connect: schoolSubjects.map(e => ({ id: e.id }))
      };
    }
    if (educationLevels !== undefined) {
      updateData.educationLevels = {
        connect: educationLevels.map(e => ({ id: e.id }))
      };
    }

    if (isAdmin || session.user.id == userId) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
      return NextResponse.json(updatedUser);
    }
    return NextResponse.json({ error: 'User not found' }, { status: 404 });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}