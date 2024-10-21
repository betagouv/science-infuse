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
        // const content =  [{"type": "heading", "attrs": {"level": 1}, "content": [{"text": "Exemple de mise en situation", "type": "text", "marks": [{"type": "textStyle", "attrs": {"color": "#3498db", "fontSize": null, "fontFamily": null}}]}]}, {"type": "paragraph", "attrs": {"class": null}, "content": [{"text": "Il existe de", "type": "text", "marks": [{"type": "textStyle", "attrs": {"color": "rgb(55, 53, 47)", "fontSize": "", "fontFamily": ""}}]}, {"text": " ", "type": "text", "marks": [{"type": "textStyle", "attrs": {"color": "rgb(193, 76, 138)", "fontSize": "", "fontFamily": ""}}]}, {"text": "multiples expressions quand on parle du monde microbien: on parle de microbes, de microorganismes, de bactéries, de virus ou de façon plus ancienne, de germes. Ces mots sont parfois utilisés dans les journaux ou dans les conversations courantes de manière équivalente alors que pourtant, ils peuvent désigner des êtres vivants très différents les uns des autres. Cette ambiguïté met en évidence la difficulté de s’emparer intellectuellement d’un monde qui est invisible à l’oeil nu.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 1}, "content": [{"text": "Définition", "type": "text", "marks": [{"type": "textStyle", "attrs": {"color": "#3498db", "fontSize": "", "fontFamily": ""}}]}]}, {"type": "paragraph", "attrs": {"class": null}, "content": [{"text": "Le mot microbe forgé à partir du grec ancien μικρός , mikrós (« petit ») et βίος , bíos (« vie ») désigne l’ensemble des êtres vivants invisibles à l’oeil nu, on peut également utiliser le mot microorganisme (ou micro-organisme).", "type": "text", "marks": [{"type": "textStyle", "attrs": {"color": "", "fontSize": "", "fontFamily": ""}}]}]}, {"type": "heading", "attrs": {"level": 1}, "content": [{"text": "Problème", "type": "text", "marks": [{"type": "textStyle", "attrs": {"color": "#e74c3c", "fontSize": null, "fontFamily": null}}]}]}, {"type": "paragraph", "attrs": {"class": null}, "content": [{"text": "Comment distinguer les microbes les uns des autres ?", "type": "text", "marks": [{"type": "textStyle", "attrs": {"color": "rgb(212, 76, 71)", "fontSize": "", "fontFamily": ""}}]}]}]

        await updateBlock(blockTitle, block.content, blockTextEmbeddings, session.user.id, block.attrs.id, chapterId);
      }));
    }

    const isAdmin = await userIs(session.user.id, [UserRoles.ADMIN])

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
        set: educationLevels.map(el => ({ id: el.id }))
      };
    }

    const updatedChapter = await prisma.chapter.update({
      where: {
        id: chapterId,
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