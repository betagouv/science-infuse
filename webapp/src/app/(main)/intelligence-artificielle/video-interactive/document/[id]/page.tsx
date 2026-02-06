import React from 'react';
import { checkBetaAccess } from '@/lib/betaAccessControl';
import { requireAuthenticated } from '@/lib/userAccessControl';
import DocumentPageClient from './DocumentPageClient';

interface PageProps {
  params: { id: string };
}

export default async function DocumentPage({ params }: PageProps) {
    await requireAuthenticated();
    await checkBetaAccess('/intelligence-artificielle/video-interactive');
    
    // Pass params to client component
    return <DocumentPageClient documentId={params.id} />;
}
