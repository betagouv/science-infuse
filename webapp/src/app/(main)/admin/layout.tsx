import { auth } from '@/auth';
import { userIs } from '@/app/api/accessControl';
import { UserRoles } from '@prisma/client';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user?.id) {
        redirect('/connexion');
    }

    // Check if user has admin role
    const isAdmin = await userIs(session.user.id, [UserRoles.ADMIN]);

    if (!isAdmin) {
        redirect('/');
    }

    return <>{children}</>;
}

