'use client';
import Image from 'next/image';
import useWindowSize from "@/course_editor/hooks/useWindowSize";

const SIFooter = () => {
    const { isMobile } = useWindowSize();
    return (
        <>
            <div className="w-full m-0 fr-grid-row fr-grid-row--gutters fr-grid-row--center bg-[#f6f6f6]">
                <div className="fr-col-12 fr-col-md-9 main-content-item">

                    <div className={`flex flex-col py-8 gap-4`}>
                        <h2 className="text-[28px] font-bold text-left text-[#161616]">
                            Qui sommes-nous ?
                        </h2>
                        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-8`}>
                            <p className="flex-1 m-0 text-base text-left text-[#161616]">
                                Ada (anciennement Science Infuse) est un service public gratuit porté par la Cité des sciences
                                et de l'industrie et le Palais de la découverte. Ce projet est accompagné par l'Atelier
                                Numérique, incubateur du Ministère de la Culture, intégrée au programme <a href="https://beta.gouv.fr/" target='_blank'>Beta.gouv.fr</a> de la
                                Direction interministérielle du numérique.
                            </p>
                            <div className={`flex flex-row gap-4 justify-center items-center`}>
                                <Image
                                    src="/images/science_infuse_logo.jpg"
                                    alt="Logo Universcience"
                                    width={135}
                                    height={66.75}
                                    className="object-contain mix-blend-multiply"
                                />
                                <Image
                                    src="/images/culture.png"
                                    alt="Logo ministère de la culture"
                                    width={135}
                                    height={105}
                                    className="object-contain mix-blend-multiply"
                                />
                                <Image
                                    src="/images/beta.png"
                                    alt="Logo beta gouv"
                                    width={135}
                                    height={46.5}
                                    className="object-contain mix-blend-multiply"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>


            <div className="w-full m-0 fr-grid-row fr-grid-row--gutters fr-grid-row--center ">
                <div className="fr-col-12 fr-col-md-9 main-content-item">
                    <div className={`w-full flex ${isMobile ? 'flex-col' : 'flex-row'} ${isMobile ? "gap-4" : "gap-16"} text-center justify-evenly items-center py-8`}>
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
        </>
    )
}
export default SIFooter;