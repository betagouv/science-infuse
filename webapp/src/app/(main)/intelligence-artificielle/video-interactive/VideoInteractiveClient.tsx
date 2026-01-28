'use client';

import dynamic from 'next/dynamic';

const InteractiveVideoGenerator = dynamic(() => import('./InteractiveVideoGenerator'), {
    ssr: false
});

export default function VideoInteractiveClient() {
    return (
        <div className="fr-col-12 fr-col-md-8 main-content-item mb-4 self-center">
            <InteractiveVideoGenerator />
        </div>
    );
}
