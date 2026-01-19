'use client'
import AutoBreadCrumb from '@/components/AutoBreadCrumb';
import dynamic from 'next/dynamic'

const TexteATrousGenerator = dynamic(() => import('./TexteATrousGenerator'), {
    ssr: false
})

export default function TexteATrousPage() {
    return (
        <div className='w-full fr-grid-row fr-grid-row--center'>
            <div className='flex flex-col fr-container main-content-item mt-4'>
                <AutoBreadCrumb className='mb-4' />
                <div id="texte-a-trous-back-portal"></div>
                <div className="fr-col-12 fr-col-md-8 main-content-item mb-4 self-center">
                    <TexteATrousGenerator />
                </div>
            </div>
        </div>
    )
}