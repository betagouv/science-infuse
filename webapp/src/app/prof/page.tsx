// app/prof/page.tsx
import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import ProfDashboardContent from './ProfDashboardContent';
import { prisma } from '@/prisma/prisma';
import { revalidatePath } from 'next/cache';

export default async function ProfDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return <div>Please sign in to access the dashboard.</div>;
  }

  async function createChapter() {
    'use server';
    if (!session) return "";
    const newChapter = await prisma.courseChapter.create({
      data: {
        title: 'New Chapter',
        content: '',
        authorId: session.user.id,
      },
    });

    revalidatePath('/prof');
    return newChapter.id;
  }

  async function deleteChapter(chapterId: string) {
    'use server';
    if (!session) return [];
    const chapter = await prisma.courseChapter.findUnique({
      where: { id: chapterId },
    });
    if (chapter && chapter.authorId === session.user.id) {
      await prisma.courseChapter.delete({
        where: { id: chapterId },
      });
    }
    // Fetch and return the updated list of chapters
    return await prisma.courseChapter.findMany({
      where: {
        authorId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  
  


  const chapters = await prisma.courseChapter.findMany({
    where: {
      authorId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const blocks = await prisma.courseChapterBlock.findMany({
    where: {
      authorId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfDashboardContent
        initialChapters={chapters}
        initialBlocks={blocks}
        createChapter={createChapter}
        deleteChapter={deleteChapter}
        user={session.user} />
    </Suspense>
  );
}