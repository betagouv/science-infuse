import AutoBreadCrumb from '@/components/AutoBreadCrumb';
import { checkBetaAccess } from '@/lib/betaAccessControl';
import ImageACompleterClient from './ImageACompleterClient';

export default async function ImageACompleterPage() {
    // Check beta access - will redirect to /prof/club-ada if not allowed
    await checkBetaAccess('/intelligence-artificielle/image-a-completer');
    
    return (
        <div className='w-full fr-grid-row fr-grid-row--center'>
            <div className='flex flex-col fr-container main-content-item mt-4'>
                <AutoBreadCrumb className='mb-4' />
                <div id="interactive-video-back-portal"></div>
                <ImageACompleterClient />
            </div>
        </div>
    );
}
