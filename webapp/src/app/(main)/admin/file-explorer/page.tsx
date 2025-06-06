// page.tsx
import { PrismaClient, UserRoles } from '@prisma/client';
import { redirect } from 'next/navigation';
import AdminWrapper from '../AdminWrapper';
import FileExplorer from './FileExplorer';
import prisma from '@/lib/prisma';
import { FileExplorerDocument } from './file-utils';
import { userIs } from '@/app/api/accessControl';
import { auth } from '@/auth';

export default async function FileExplorerPage() {
    const session = await auth();

    const isAdmin = await userIs(session?.user.id, [UserRoles.ADMIN]);

    if (!isAdmin) {
        redirect('/');
    }

    try {
        const documents: FileExplorerDocument[] = await prisma.document.findMany({
            // where: { deleted: false },
            select: {
                id: true,
                originalPath: true,
                deleted: true,
                s3ObjectName: true,
                tags: true,
                mediaName: true
            },
        });

        return (
            <AdminWrapper>
                <h1>Explorateur de fichiers</h1>
                <div className="p-4 bg-white shadow-md rounded-lg">
                    <FileExplorer documents={documents} />
                </div>
            </AdminWrapper>
        );
    } catch (error) {
        console.error('Error fetching documents:', error);
        return (
            <AdminWrapper>
                <h1>Explorateur de fichiers</h1>
                <p className="text-red-500">Erreur lors du chargement de l'explorateur de fichiers. Veuillez réessayer plus tard.</p>
            </AdminWrapper>
        );
    } finally {
        await prisma.$disconnect();
    }
}
