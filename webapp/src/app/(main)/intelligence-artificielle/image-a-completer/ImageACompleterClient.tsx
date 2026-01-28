'use client';

import dynamic from 'next/dynamic';

const ImageACompleterGenerator = dynamic(() => import('./ImageACompleterGenerator'), {
    ssr: false
});

export default function ImageACompleterClient() {
    return (
        <div className="fr-col-12 fr-col-md-8 main-content-item mb-4 self-center">
            <ImageACompleterGenerator />
        </div>
    );
}
