'use client';
import Image from 'next/image';
import useWindowSize from "@/course_editor/hooks/useWindowSize";

const SIFooter = () => {
    const { isMobile } = useWindowSize();
    return (
        <>
            <div className="w-full flex flex-col bg-[#f6f6f6]">
                <div className="fr-container" >
                    <div className="fr-grid-row fr-grid-row--center">
                        <div className="fr-col-12 py-16">

                            <h2 className="text-[20px] md:text-[28px] font-bold text-left text-[#161616]">
                                Qui sommes-nous ?
                            </h2>
                            <div className={`flex flex-col md:flex-row gap-4 md:gap-8`}>
                                <p className="flex-1 m-0 text-sm md:text-base text-left text-[#161616]">
                                    <strong>Ada</strong> est un service public gratuit porté par Universcience, l'établissement public qui regroupe la Cité des sciences et de l'industrie, le Palais de la découverte.<br />
                                    Depuis sa création en 2010, Universcience a pour mission de rendre les sciences accessibles et attrayantes, en promouvant la culture scientifique et technique auprès de toutes et tous.<br />
                                    Les contenus proposés sur la plateforme Ada s'appuient sur les ressources produites par la Cité des sciences, le Palais de la découverte et leblob.fr, tirant parti de l'expertise reconnue de ces trois entités dans le domaine de la médiation scientifique.<br />
                                    Le projet est accompagné par <strong>l'Atelier Numérique</strong>, l'incubateur du Ministère de la Culture, intégrée programme <strong>Beta.gouv.fr</strong> de la Direction interministérielle du numérique.
                                </p>
                                <div className={`flex flex-row flex-wrap justify-center gap-4 items-center`}>
                                    <Image
                                        src="/images/science_infuse_logo.jpg"
                                        alt="Logo Universcience"
                                        width={100}
                                        height={49.5}
                                        className="object-contain mix-blend-multiply md:w-[135px] md:h-[66.75px]"
                                    />
                                    <Image
                                        src="/images/culture.png"
                                        alt="Logo ministère de la culture"
                                        width={100}
                                        height={77.8}
                                        className="object-contain mix-blend-multiply md:w-[135px] md:h-[105px]"
                                    />
                                    <Image
                                        src="/images/beta.png"
                                        alt="Logo beta gouv"
                                        width={100}
                                        height={34.4}
                                        className="object-contain mix-blend-multiply md:w-[135px] md:h-[46.5px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fr-container" >
                <div className="fr-grid-row fr-grid-row--center">
                    <div className="fr-col-12">

                        <div className={`w-full flex flex-col md:flex-row gap-0 md:gap-16 text-center justify-start items-start py-4 md:py-8`}>
                            <a href="/universcience" className="m-0 text-[10px] md:text-xs font-bold text-[#161616] mb-2 md:mb-0">
                                Venir à la Cité des sciences et de l'industrie <br /> et au Palais de la découverte
                            </a>
                            <a href="/conditions-generales-d-utilisation" className="m-0 text-[10px] md:text-xs font-bold text-[#161616] mb-2 md:mb-0">
                                Conditions Générales d'Utilisation
                            </a>
                            <a href="/politique-de-confidentialite" className="m-0 text-[10px] md:text-xs font-bold text-[#161616] mb-2 md:mb-0">
                                Politique de confidentialité
                            </a>
                            <a href="/mentions-legales" className="m-0 text-[10px] md:text-xs font-bold text-[#161616] mb-2 md:mb-0">
                            Mentions légales
                            </a>
                            <a href="/chiffres-cles" className="m-0 text-[10px] md:text-xs font-bold text-[#161616] mb-2 md:mb-0">
                                Chiffres clés
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default SIFooter;