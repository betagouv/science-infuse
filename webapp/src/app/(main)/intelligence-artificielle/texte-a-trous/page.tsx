import AutoBreadCrumb from '@/components/AutoBreadCrumb';
import { checkBetaAccess } from '@/lib/betaAccessControl';
import TexteATrousClient from './TexteATrousClient';

export default async function TexteATrousPage() {
    // Check beta access - will redirect to /prof/club-ada if not allowed
    await checkBetaAccess('/intelligence-artificielle/texte-a-trous');
    
    return (
        <div className='w-full fr-grid-row fr-grid-row--center'>
            <div className='flex flex-col fr-container main-content-item mt-4'>
                <AutoBreadCrumb className='mb-4' />
                <div id="texte-a-trous-back-portal"></div>
                <TexteATrousClient />
            </div>
        </div>
    );
}
