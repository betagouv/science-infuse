
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { redirect } from 'next/navigation';

import { Suspense } from 'react';
import ProfDashboardContent from './ProfDashboardContent';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { useSession } from "next-auth/react";

export default async function ProfDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/prof/connexion');
  }

  async function createChapter() {
    'use server';
    if (!session) return "";
    const newChapter = await prisma.chapter.create({
      data: {
        title: 'New Chapter',
        content: '',
        userId: session.user.id,
      },
    });

    revalidatePath('/prof');
    return newChapter.id;
  }

  async function deleteChapter(chapterId: string) {
    'use server';
    if (!session) return [];
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });
    if (chapter && chapter.userId === session.user.id) {
      await prisma.chapter.delete({
        where: { id: chapterId },
      });
    }
    // Fetch and return the updated list of chapters
    return await prisma.chapter.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }




  const chapters = await prisma.chapter.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const blocks = await prisma.block.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (

    <ProfDashboardContent
      initialChapters={chapters}
      initialBlocks={blocks}
      createChapter={createChapter}
      deleteChapter={deleteChapter}
      user={session.user} />
  )
}