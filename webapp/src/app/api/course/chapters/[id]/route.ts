import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { updateBlock } from '@/app/api/search/sql_raw_queries';
import prisma from '@/lib/prisma';
import { getEmbeddings } from '@/lib/utils/getEmbeddings';
import { ChapterWithoutBlocks } from '@/types/api';
import { Question } from '@/types/course-editor';
import { ChapterStatus, UserRoles } from '@prisma/client';
import { JSONContent } from '@tiptap/core';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { getTiptapNodeText } from '../blocks/[id]/getTiptapNodeText';
import { userFullFields, userIs } from '@/app/api/accessControl';
import sendMailChapterToReview from '@/mail/sendMailChapterToReview';

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
        educationLevels: true,
        theme: true,
        user: {
          select: userFullFields
        }
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

const _sendMailChapterToReview = async (chapterId: string) => {
  const chapterFull = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
    include: {
      skills: true,
      educationLevels: true,
      theme: true,
      user: {
        select: userFullFields
      }
    }
  });
  const allReviewers = await prisma.user.findMany({
    where: {
      roles: {
        has: UserRoles.REVIEWER
      }
    },
    select: userFullFields
  })
  if (allReviewers.length > 0 && chapterFull)
    await sendMailChapterToReview(allReviewers, chapterFull)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const chapterId = params.id;

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data: Partial<ChapterWithoutBlocks> = await request.json();
    if (!data) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 404 });
    }
    
    const isAdmin = await userIs(session.user.id, [UserRoles.ADMIN]);
    
    // If user is not admin, verify they own the chapter
    if (!isAdmin) {
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId }
      });
      if (chapter?.userId !== session.user.id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
    }

    const { status, title, content, skills, educationLevels, themeId, schoolSubjectId, skillsAndKeyIdeas, additionalInformations, coverPath } = data;

    // blocks
    if (content) {
      const blocks = ((content as JSONContent).content || [])
        .filter(block => block.type == 'courseBlock')

      await Promise.all(blocks.map(async block => {
        if (!block.content || !block.attrs?.id) return;
        const blockTitle = block.attrs?.title;
        const blockTextContent = getTiptapNodeText({ content: block.content }, 0);
        const blockQuizQuestions = (block.attrs?.quizQuestions || []) as Question[];
        const blockQuizText = blockQuizQuestions.map(q => `${q.question}\n${q.options.filter(o => o.correct).map(o => o.answer).join('\n')}`).join('\n')
        const blockText = `${title}\n${blockTitle}\n${blockTextContent}\n${blockQuizText}`;
        const blockTextEmbeddings = await getEmbeddings(blockText);

        await updateBlock(blockTitle, block.content, blockTextEmbeddings, session.user.id, block.attrs.id, chapterId);
      }));
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (schoolSubjectId !== undefined) updateData.schoolSubjectId = schoolSubjectId;
    if (coverPath !== undefined) updateData.coverPath = coverPath as string;
    if (content !== undefined) updateData.content = content as string;
    if (skillsAndKeyIdeas !== undefined) updateData.skillsAndKeyIdeas = skillsAndKeyIdeas as string;
    if (additionalInformations !== undefined) updateData.additionalInformations = additionalInformations as string;
    if (themeId !== undefined) updateData.themeId = themeId;
    if (status !== undefined && (isAdmin || [ChapterStatus.DELETED, ChapterStatus.DRAFT, ChapterStatus.REVIEW].includes(status as any))) {
      updateData.status = status;
      if (status == ChapterStatus.REVIEW) {
        await _sendMailChapterToReview(chapterId);
      }
    }
    if (skills !== undefined) {
      updateData.skills = {
        set: skills.map((s) => ({ id: s.id })),
      };
    }
    if (educationLevels !== undefined) {
      updateData.educationLevels = {
        set: educationLevels.map(el => ({ id: el.id })),
      };
    }

    const whereClause = {
      id: chapterId,
      ...(isAdmin ? {} : { userId: session.user.id }),
    };

    const updatedChapter = await prisma.chapter.update({
      where: whereClause,
      data: updateData,
    });
    
    return NextResponse.json(updatedChapter);
  } catch (error) {
    console.error('Error updating course chapter:', error);
    return NextResponse.json({ error: 'Failed to update course chapter', message: (error as Error).message }, { status: 500 });
  }
}