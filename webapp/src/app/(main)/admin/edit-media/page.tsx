import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { userIs } from '@/app/api/accessControl';
import { UserRoles } from '@prisma/client';
import prisma from '@/lib/prisma';
import MediaSelectionList from './MediaSelectionList';
import AdminWrapper from '../AdminWrapper';

export default async function EditMediaPage() {
    const session = await auth();
    
    if (!session?.user?.id) {
        redirect('/connexion');
    }

    const isAdmin = await userIs(session.user.id, [UserRoles.ADMIN]);
    
    if (!isAdmin) {
        redirect('/');
    }

    try {
        // Fetch all documents with their tags for the selection list
        const documents = await prisma.document.findMany({
            where: { deleted: false },
            include: {
                tags: true
            },
            orderBy: { mediaName: 'asc' }
        });

        return (
            <AdminWrapper>
                <div>
                    <h1 className="text-2xl font-bold mb-8">Modifier les médias</h1>
                    <p className="text-gray-600 mb-6">
                        Sélectionnez un média dans la liste ci-dessous pour modifier ses informations.
                    </p>
                    <MediaSelectionList documents={documents} />
                </div>
            </AdminWrapper>
        );
    } catch (error) {
        console.error('Error fetching documents:', error);
        return (
            <AdminWrapper>
                <div>
                    <h1 className="text-2xl font-bold mb-8">Modifier les médias</h1>
                    <p className="text-red-500">Erreur lors du chargement des documents. Veuillez réessayer plus tard.</p>
                </div>
            </AdminWrapper>
        );
    } finally {
        await prisma.$disconnect();
    }
}
