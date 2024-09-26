import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import prisma from '@/lib/prisma';
import { ChapterWithoutBlocks } from '@/lib/api-client';
import { ChapterStatus } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: params.id,
        // userId: session.user.id,
      },
      include: {
        skills: true,
        educationLevels: true
      }
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Error fetching course chapter:', error);
    return NextResponse.json({ error: 'Failed to fetch course chapter' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const data: Partial<ChapterWithoutBlocks> = await request.json();
    if (!data) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 404 });
    }
    const { status, title, content, skills, educationLevels, themeId, schoolSubjectId, skillsAndKeyIdeas, additionalInformations, coverPath } = data;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (schoolSubjectId !== undefined) updateData.schoolSubjectId = schoolSubjectId;
    if (coverPath !== undefined) updateData.coverPath = coverPath as string;
    if (content !== undefined) updateData.content = content as string;
    if (skillsAndKeyIdeas !== undefined) updateData.skillsAndKeyIdeas = skillsAndKeyIdeas as string;
    if (additionalInformations !== undefined) updateData.additionalInformations = additionalInformations as string;
    if (themeId !== undefined) updateData.themeId = themeId;
    if (status !== undefined && [ChapterStatus.DELETED, ChapterStatus.DRAFT, ChapterStatus.REVIEW].includes(status as any)) updateData.status = status;
    if (skills !== undefined) {
      updateData.skills = {
        set: skills.map((s) => ({ id: s.id })),
      };
    }
    if (educationLevels !== undefined) {
      updateData.educationLevels = {
        set: educationLevels.map(el => ({ id: el.id }))
      };
    }

    const updatedChapter = await prisma.chapter.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: updateData,
    });
    return NextResponse.json(updatedChapter);
  } catch (error) {
    console.error('Error updating course chapter:', error);
    return NextResponse.json({ error: 'Failed to update course chapter' }, { status: 500 });
  }
}