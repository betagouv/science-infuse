import React from 'react';
import { checkBetaAccess } from '@/lib/betaAccessControl';
import DocumentPageClient from './DocumentPageClient';

interface PageProps {
  params: { id: string };
}

export default async function DocumentPage({ params }: PageProps) {
    // Check beta access - will redirect to /prof/club-ada if not allowed
    await checkBetaAccess('/intelligence-artificielle/video-interactive');
    
    // Pass params to client component
    return <DocumentPageClient documentId={params.id} />;
}
