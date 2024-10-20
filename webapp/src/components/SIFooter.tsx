'use client';

import useWindowSize from "@/course_editor/hooks/useWindowSize";

const SIFooter = () => {
    const { isMobile } = useWindowSize();
    return (
        <div className="w-full m-0 fr-grid-row fr-grid-row--gutters fr-grid-row--center ">
            <div className="fr-col-12 fr-col-md-8 main-content-item">
                <div className={`w-full flex ${isMobile ? 'flex-col' : 'flex-row'} ${isMobile ? "gap-4":"gap-16"} text-center justify-evenly items-center py-8`}>
                    <a href="/universcience" className={`m-0 text-xs font-bold text-[#161616] ${isMobile ? 'mb-4' : ''}`}>
                        Venir à la Cité des sciences et de l'industrie et au Palais de la découverte
                    </a>
                    <a href="/conditions-generales-d-utilisation" className={`m-0 text-xs font-bold text-[#161616] ${isMobile ? 'mb-4' : ''}`}>
                        Conditions Générales d'Utilisation
                    </a>
                    <a href="/politique-de-confidentialite" className={`m-0 text-xs font-bold text-[#161616] ${isMobile ? 'mb-4' : ''}`}>
                        Politique de confidentialité
                    </a>
                </div>
            </div>
        </div>
    )
}
export default SIFooter;