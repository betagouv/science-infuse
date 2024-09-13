import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import { UserFull } from '@/lib/api-client';
import { getUserFull } from '@/lib/utils/db';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await getUserFull(session.user.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { school, firstName, lastName, academyId, educationLevels, schoolSubjects }: Partial<UserFull> = body;
    console.log("UPDATE USER", schoolSubjects)

    const updateData: any = {};
    if (school !== undefined) updateData.school = school;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (academyId !== undefined) updateData.academyId = academyId;
    if (schoolSubjects !== undefined) {
      updateData.schoolSubjects = {
        set: schoolSubjects.map(e => ({ id: e.id }))
      };
    }
    if (educationLevels !== undefined) {
      updateData.educationLevels = {
        set: educationLevels.map(e => ({ id: e.id }))
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}