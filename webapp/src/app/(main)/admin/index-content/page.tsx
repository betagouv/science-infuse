'use client';

import React, { useEffect, useState } from 'react';
import Snackbar from '@/course_editor/components/Snackbar';
import AdminWrapper from '../AdminWrapper';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import IndexImages from './IndexImages';
import IndexVideos from './IndexVideos';
import IndexPDF from './IndexPDF';
import IndexUrls from './IndexUrls';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

// Tab types
type TabType = 'images' | 'videos' | 'pdf' | 'urls';

// Helper function to determine the appropriate tab based on file mime types
const getTabTypeFromMimeTypes = (files: Array<{ mimeType: string }>): TabType => {
    if (!files || files.length === 0) return 'images';
    
    // Check the first file's mime type to determine the tab
    const firstFile = files[0];
    const mimeType = firstFile.mimeType;
    
    if (mimeType.startsWith('image/')) {
        return 'images';
    } else if (mimeType.startsWith('video/')) {
        return 'videos';
    } else if (mimeType === 'application/pdf') {
        return 'pdf';
    }
    
    // Default to images if unknown
    return 'images';
};

// Helper function to get tab type from draft's contentType field
const getTabTypeFromContentType = (contentType: string | null | undefined): TabType => {
    if (contentType === 'images' || contentType === 'videos' || contentType === 'pdf') {
        return contentType;
    }
    return 'images';
};

const IndexContent = (props: {}) => {
    const searchParams = useSearchParams();
    const draftId = searchParams.get('draftId');
    const [defaultTab, setDefaultTab] = useState<TabType | null>(draftId ? null : 'images');
    const [isLoadingDraftType, setIsLoadingDraftType] = useState(!!draftId);

    // When a draftId is present, fetch the draft to determine which tab to show
    useEffect(() => {
        const detectDraftType = async () => {
            if (!draftId) {
                setDefaultTab('images');
                setIsLoadingDraftType(false);
                return;
            }
            
            setIsLoadingDraftType(true);
            try {
                const response = await apiClient.getDraft(draftId);
                if (response.draft) {
                    // Priority 1: Use contentType field if available
                    if (response.draft.contentType) {
                        setDefaultTab(getTabTypeFromContentType(response.draft.contentType));
                    }
                    // Priority 2: Detect from file mime types
                    else if (response.draft.files && response.draft.files.length > 0) {
                        setDefaultTab(getTabTypeFromMimeTypes(response.draft.files));
                    }
                    // Default to images
                    else {
                        setDefaultTab('images');
                    }
                } else {
                    setDefaultTab('images');
                }
            } catch (error) {
                console.error('Error detecting draft type:', error);
                setDefaultTab('images');
            } finally {
                setIsLoadingDraftType(false);
            }
        };

        detectDraftType();
    }, [draftId]);

    // Show loading state while determining the default tab
    if (isLoadingDraftType || defaultTab === null) {
        return (
            <AdminWrapper>
                <div className="flex items-center justify-center p-8">
                    <div className="text-gray-500">Chargement...</div>
                </div>
            </AdminWrapper>
        );
    }

    return (
        <AdminWrapper>
            {/* Use key to force re-render when defaultTab changes */}
            <Tabs
                key={defaultTab}
                label="Onglets d'indexation de contenu"
                onTabChange={() => {}}
                tabs={[
                    {
                        content: <IndexImages />,
                        iconId: 'fr-icon-image-line',
                        label: 'Images',
                        isDefault: defaultTab === 'images'
                    },
                    {
                        content: <IndexVideos />,
                        iconId: 'fr-icon-youtube-line',
                        label: 'Vidéos',
                        isDefault: defaultTab === 'videos'
                    },
                    {
                        content: <IndexPDF />,
                        iconId: 'fr-icon-file-pdf-line',
                        label: 'PDF',
                        isDefault: defaultTab === 'pdf'
                    },
                    {
                        content: <IndexUrls />,
                        iconId: 'fr-icon-links-fill',
                        label: 'Site web',
                        isDefault: defaultTab === 'urls'
                    }
                ]}
            />
            <Snackbar />
        </AdminWrapper>
    );
};


export default IndexContent;