
import { redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { EMPTY_DOCUMENT } from "@/config";
import { getChaptersWithBlocks } from "@/lib/utils/db";
import ProfDashboardContent from "../ProfDashboardContent";
import { ChapterStatus, UserRoles } from "@prisma/client";
import AutoBreadCrumb from "@/components/AutoBreadCrumb";
import { auth } from '@/auth';
import { userIs } from '@/app/api/accessControl';

export default async function ProfDashboard() {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/');
    }

    // Vérifier si l'utilisateur est admin
    const isAdmin = await userIs(session.user.id, [UserRoles.ADMIN]) ?? false;

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
        
        // Seul le propriétaire peut supprimer son chapitre
        if (chapter && chapter.userId === session.user.id) {
            await prisma.chapter.update({
                where: { id: chapterId },
                data: {
                    status: ChapterStatus.DELETED,
                }
            })
        }

        // Retourner les chapitres en fonction du rôle (admin voit tout)
        const isAdminUser = await userIs(session.user.id, [UserRoles.ADMIN]) ?? false;
        return await getChaptersWithBlocks(session.user.id, { isAdmin: isAdminUser })
    }



    // Les admins voient tous les cours, les autres utilisateurs voient seulement les leurs
    const chapters = await getChaptersWithBlocks(session.user.id, { isAdmin });
    
    // Pour les blocks, même logique: les admins voient tous les blocks
    const blocks = await prisma.block.findMany({
        where: isAdmin ? {} : {
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

