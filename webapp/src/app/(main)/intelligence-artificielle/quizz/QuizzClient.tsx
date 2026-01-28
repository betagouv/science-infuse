'use client';

import dynamic from 'next/dynamic';

const QuizzGenerator = dynamic(() => import('./QuizzGenerator'), {
    ssr: false
});

export default function QuizzClient() {
    return (
        <div className="fr-col-12 fr-col-md-8 main-content-item mb-4 self-center">
            <QuizzGenerator />
        </div>
    );
}
