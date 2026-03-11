import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { userIs } from '@/app/api/accessControl';
import { UserRoles } from '@prisma/client';
import prisma from '@/lib/prisma';
import EditMediaForm from './EditMediaForm';
import AdminWrapper from '../../AdminWrapper';

interface EditMediaPageProps {
    params: { id: string };
}

export default async function EditMediaPage({ params }: EditMediaPageProps) {
    const session = await auth();
    
    if (!session?.user?.id) {
        redirect('/connexion');
    }

    const isAdmin = await userIs(session.user.id, [UserRoles.ADMIN]);
    
    if (!isAdmin) {
        redirect('/');
    }

    try {
        // Fetch the document with its tags
        const document = await prisma.document.findUnique({
            where: { id: params.id },
            include: {
                tags: true
            }
        });

        if (!document) {
            redirect('/admin');
        }

        // Fetch all available tags for the dropdown
        const allTags = await prisma.documentTag.findMany({
            orderBy: { title: 'asc' }
        });

        return (
            <AdminWrapper>
                <EditMediaForm document={document} allTags={allTags} />
            </AdminWrapper>
        );
    } catch (error) {
        console.error('Error fetching document:', error);
        redirect('/admin');
    } finally {
        await prisma.$disconnect();
    }
}
