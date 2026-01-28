'use client';

import dynamic from 'next/dynamic';

const DialogcardGenerator = dynamic(() => import('./DialogcardGenerator'), {
    ssr: false
});

export default function DialogcardsClient() {
    return (
        <div className="fr-col-12 fr-col-md-8 main-content-item mb-4 self-center">
            <DialogcardGenerator />
        </div>
    );
}
