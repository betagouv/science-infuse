// page.tsx
import { PrismaClient, UserRoles } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { userIs } from '@/app/api/accessControl';
import AdminWrapper from '../AdminWrapper';
import FileExplorer from './FileExplorer';

export default async function FileExplorerPage() {
    const session = await getServerSession(authOptions);

    const isAdmin = await userIs(session?.user.id, [UserRoles.ADMIN]);

    if (!isAdmin) {
        redirect('/');
    }

    const prisma = new PrismaClient();

    try {
        // Fetch only required fields to optimize query
        const documents = await prisma.document.findMany({
            where: { deleted: false },
            select: {
                id: true,
                originalPath: true,
                s3ObjectName: true,
            },
        });

        return (
            <AdminWrapper>
                <h1 className="text-xl font-semibold">File Explorer</h1>
                <div className="p-4 bg-white shadow-md rounded-lg">
                    <FileExplorer documents={documents} />
                </div>
            </AdminWrapper>
        );
    } catch (error) {
        console.error('Error fetching documents:', error);
        return (
            <AdminWrapper>
                <h1 className="text-xl font-semibold">File Explorer</h1>
                <p className="text-red-500">Error loading file explorer. Please try again later.</p>
            </AdminWrapper>
        );
    } finally {
        await prisma.$disconnect();
    }
}
