'use client';

import dynamic from 'next/dynamic';

const MotsCroisesGenerator = dynamic(() => import('./MotsCroisesGenerator'), {
    ssr: false
});

export default function MotsCroisesClient() {
    return (
        <div className="fr-col-12 fr-col-md-8 main-content-item mb-4 self-center">
            <MotsCroisesGenerator />
        </div>
    );
}
