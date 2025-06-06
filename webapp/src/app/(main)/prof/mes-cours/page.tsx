
import { redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { EMPTY_DOCUMENT } from "@/config";
import { getChaptersWithBlocks } from "@/lib/utils/db";
import ProfDashboardContent from "../ProfDashboardContent";
import { ChapterStatus } from "@prisma/client";
import AutoBreadCrumb from "@/components/AutoBreadCrumb";
import { auth } from '@/auth';

export default async function ProfDashboard() {
    const session = await auth();

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
            await prisma.chapter.update({
                where: { id: chapterId },
                data: {
                    status: ChapterStatus.DELETED,
                }
            })
            // // Delete all blocks associated with the chapter
            // await prisma.block.deleteMany({
            //     where: { chapterId: chapterId },
            // });
            // // Now delete the chapter
            // await prisma.chapter.delete({
            //     where: { id: chapterId },
            // });
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
        <div className='w-full fr-grid-row fr-grid-row--center'>
            <div className='flex flex-col fr-container main-content-item mt-4'>
                <AutoBreadCrumb className="mb-4" />
                <h1 className="self-center">Mes cours</h1>

                <ProfDashboardContent
                    initialChapters={chapters}
                    initialBlocks={blocks}
                    createChapter={createChapter}
                    deleteChapter={deleteChapter}
                    user={session.user} />
            </div>
        </div>
    )
}

