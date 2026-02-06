import AutoBreadCrumb from '@/components/AutoBreadCrumb';
import { checkBetaAccess } from '@/lib/betaAccessControl';
import { requireAuthenticated } from '@/lib/userAccessControl';
import DialogcardsClient from './DialogcardsClient';

export default async function DialogcardsPage() {
    await requireAuthenticated();
    await checkBetaAccess('/intelligence-artificielle/dialogcards');
    
    return (
        <div className='w-full fr-grid-row fr-grid-row--center'>
            <div className='flex flex-col fr-container main-content-item mt-4'>
                <AutoBreadCrumb className='mb-4' />
                <div id="interactive-video-back-portal"></div>
                <DialogcardsClient />
            </div>
        </div>
    );
}
