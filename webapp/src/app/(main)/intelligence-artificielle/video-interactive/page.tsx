import AutoBreadCrumb from '@/components/AutoBreadCrumb';
import { checkBetaAccess } from '@/lib/betaAccessControl';
import VideoInteractiveClient from './VideoInteractiveClient';

export default async function InteractiveVideoPage() {
    // Check beta access - will redirect to /prof/club-ada if not allowed
    await checkBetaAccess('/intelligence-artificielle/video-interactive');
    
    return (
        <div className='w-full fr-grid-row fr-grid-row--center'>
            <div className='flex flex-col fr-container main-content-item mt-4'>
                <AutoBreadCrumb className='mb-4' />
                <div id="interactive-video-back-portal"></div>
                <VideoInteractiveClient />
            </div>
        </div>
    );
}
