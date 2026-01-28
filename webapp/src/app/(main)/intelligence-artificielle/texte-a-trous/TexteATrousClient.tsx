'use client';

import dynamic from 'next/dynamic';

const TexteATrousGenerator = dynamic(() => import('./TexteATrousGenerator'), {
    ssr: false
});

export default function TexteATrousClient() {
    return (
        <div className="fr-col-12 fr-col-md-8 main-content-item mb-4 self-center">
            <TexteATrousGenerator />
        </div>
    );
}
