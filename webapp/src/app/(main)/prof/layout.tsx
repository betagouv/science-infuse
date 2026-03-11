import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function ProfLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Get the current pathname from headers
    const headersList = headers();
    const pathname = headersList.get('x-pathname') || headersList.get('referer') || '';
    
    // Define public routes that don't require authentication
    const isInscriptionPage = pathname.includes('/prof/inscription');
    const isViewPage = pathname.includes('/prof/chapitres/') && pathname.includes('/view');
    
    // Allow public access to inscription and view pages
    if (isInscriptionPage || isViewPage) {
        return <>{children}</>;
    }

    // For all other /prof routes, require authentication
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/connexion');
    }

    return <>{children}</>;
}

