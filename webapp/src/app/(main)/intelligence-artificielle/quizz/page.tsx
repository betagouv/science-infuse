import AutoBreadCrumb from '@/components/AutoBreadCrumb';
import { checkBetaAccess } from '@/lib/betaAccessControl';
import { requireAuthenticated } from '@/lib/userAccessControl';
import QuizzClient from './QuizzClient';

export default async function QuizzPage() {
    await requireAuthenticated();
    await checkBetaAccess('/intelligence-artificielle/quizz');
    
    return (
        <div className='w-full fr-grid-row fr-grid-row--center'>
            <div className='flex flex-col fr-container main-content-item mt-4'>
                <AutoBreadCrumb className='mb-4' />
                <div id="quizz-back-portal"></div>
                <QuizzClient />
            </div>
        </div>
    );
}
