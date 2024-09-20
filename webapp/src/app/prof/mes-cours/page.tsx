
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { EMPTY_DOCUMENT } from "@/config";
import { getChaptersWithBlocks } from "@/lib/utils/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import ProfDashboardContent from "../ProfDashboardContent";

export default async function ProfDashboard() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/');
    }

    async function createChapter() {
        'use server';
        if (!session) return "";
        const newChapter = await prisma.chapter.create({
            data: {
                title: 'Chapitre sans titre',
                content: JSON.stringify(EMPTY_DOCUMENT),
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

        return await getChaptersWithBlocks(session.user.id)
    }



    const chapters = await getChaptersWithBlocks(session.user.id);
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

