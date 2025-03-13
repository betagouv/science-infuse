'use client'

import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb"
import { usePathname } from 'next/navigation'

const pathMap: Record<string, string> = {
    '': 'Accueil',
    'video-interactive': 'Création de vidéo interactive',
    'catalogue': 'Catalogue de cours',
    'mes-cours': 'Mes cours',
    'webinaires': 'Webinaires Ada',
    'besoin-d-aide': `Besoin d'aide`,
    'mes-interactifs': `Mes interactifs`,
    'mes-favoris': `Mes favoris`,
    'parametres': 'Mon compte',
}

const skipSegments = ['intelligence-artificielle', 'prof']

export default ({ currentPageLabel }: { currentPageLabel?: string }) => {
    const pathname = usePathname()
    const pathSegments = pathname?.split('/').filter(Boolean) || []
    const segments = pathSegments
        .filter(segment => !skipSegments.includes(segment))
        .map((segment, index) => {
            const filteredSegments = pathSegments.filter(seg => !skipSegments.includes(seg))
            const href = '/' + filteredSegments.slice(0, index + 1).join('/')
            return {
                label: pathMap[segment] || segment,
                linkProps: {
                    href: href
                }
            }
        })

    return (
        <Breadcrumb
            currentPageLabel={currentPageLabel || segments[segments.length - 1]?.label || 'Page actuelle'}
            segments={[
                {
                    label: 'Accueil',
                    linkProps: {
                        href: '/'
                    }
                },
                ...segments.slice(0, -1)
            ]}
        />
    )
}