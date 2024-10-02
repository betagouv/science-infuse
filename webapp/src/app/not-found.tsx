'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
    interface Window {
        _paq: any[];
    }
}

export default function NotFound(): JSX.Element {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (typeof window !== 'undefined' && window._paq) {
            const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

            window._paq.push([
                'setDocumentTitle',
                '404/URL = ' + encodeURIComponent(fullPath) + ' /From = ' + encodeURIComponent(document.referrer)
            ]);

            window._paq.push(['trackPageView']);
        }
    }, [pathname, searchParams]);

    return (
        <div className='w-full h-full flex flex-col gap-8 py-64 items-center justify-center'>
            <h1 className='m-0'>404 - Page Non Trouvée</h1>
            <p className='m-0'>Désolé, la page que vous recherchez n'existe pas.</p>
            <a href="/" className="m-0 text-blue-500 hover:text-blue-700">Retour à l'accueil</a>
        </div>
    );
}