import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ChapterStatus, Prisma } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';
import { userFullFields } from '@/app/api/accessControl';
import { auth } from '@/auth';


const createNewCourseBlockIds = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(createNewCourseBlockIds);
  } else if (typeof obj === 'object' && obj !== null) {
    if (obj.type === 'courseBlock') {
      return {
        ...obj,
        attrs: {
          ...obj.attrs,
          id: createId()
        },
        content: createNewCourseBlockIds(obj.content)
      };
    } else {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, createNewCourseBlockIds(value)])
      );
    }
  }
  return obj;
}


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: params.id,
      },
      include: {
        skills: true,
        theme: true,
        educationLevels: true,
        user: {
          select: userFullFields
        }
      }
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const { id, createdAt, updatedAt, content, userId, status, user, theme, ...chapterData } = chapter;

    if (userId == session.user.id) {
      return NextResponse.json({ error: 'Ce chapitre vous appartient déjà' }, { status: 409 })
    }

    const updatedContent = createNewCourseBlockIds(content);

    const duplicatedChapter = await prisma.chapter.create({
      data: {
        ...chapterData,
        title: `${chapter.title} (Copie)`,
        themeId: chapter.themeId,
        userId: session.user.id,
        status: ChapterStatus.DRAFT,
        skills: {
          connect: chapter.skills.map(skill => ({ id: skill.id }))
        },
        educationLevels: {
          connect: chapter.educationLevels.map(level => ({ id: level.id }))
        },
        content: updatedContent as Prisma.InputJsonValue
      },
      include: {
        skills: true,
        educationLevels: true,
        user: {
          select: userFullFields
        }
      }
    });

    if (!duplicatedChapter) {
      return NextResponse.json({ error: 'Failed to duplicate chapter' }, { status: 500 });
    }

    return NextResponse.json(duplicatedChapter);
  } catch (error) {
    console.error('Error duplicating course chapter:', error);
    return NextResponse.json({ error: 'Failed to duplicate course chapter' }, { status: 500 });
  }
}