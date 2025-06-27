'use client'
import React from "react";
import Image from 'next/image'
import useWindowSize from "@/course_editor/hooks/useWindowSize";
import { useRouter } from "next/navigation";
import Button from "@codegouvfr/react-dsfr/Button";
import H5PRenderer from "@/app/(main)/mediaViewers/H5PRenderer";
import prisma from "@/lib/prisma";
import { AdminSettingKey } from "@prisma/client";
import { getH5PHomeUrl } from "@/lib/utils/db";

export default function (props: { reverse?: boolean }) {
    const color = "#ff8642"
    const { isMobile } = useWindowSize();
    const router = useRouter()

    // const [h5pUrl, setH5pUrl] = React.useState<string | null>(null);

    // React.useEffect(() => {
    //     const fetchH5PUrl = async () => {
    //         const url = await getH5PHomeUrl();
    //         if (!url) return;
    //         setH5pUrl(url);
    //     };
    //     fetchH5PUrl();
    // }, []);
    return (
        <div className="fr-container overflow-x-hidden">
            <div className="fr-grid-row fr-grid-row--center">
                    <div className="fr-col-12 fr-col-md-10">
                    <div className="w-full flex flex-col items-center gap-8 md:gap-8 px-4 md:px-0 my-16">
                        <h2 className="m-0 text-[32px] md:text-md font-bold text-center text-[#161616]">
                            Un apprentissage enrichi par l'Intelligence Artificielle d'Ada
                        </h2>

                        <p className="m-0 text-base md:text-lg text-center text-[#161616]">
                            Transformez chaque vidéo en une expérience d'apprentissage interactive et personnalisée. <br /> Notre
                            Intelligence Artificielle (IA) génère automatiquement des définitions contextuelles et des
                            questions stimulantes, que vous pouvez adapter selon vos besoins pédagogiques.
                        </p>

                        <div className="flex flex-col gap-2 w-full max-w-[600px]">
                            <div className="flex items-center w-full relative" style={{ aspectRatio: '1.7' }}>

                                {/* {h5pUrl ?
                                    <H5PRenderer h5pPublicUrl={h5pUrl} />
                                    : */}
                                    <Image
                                        src="/images/interactive-video-preview.png"
                                        fill
                                        alt="Illustration vidéo interactive"
                                        className="mix-blend-multiply object-cover"
                                    />
                                {/* } */}

                                <Image
                                    src="/images/landing_section_2.svg"
                                    height={300}
                                    width={300}
                                    alt="Picture of the author"
                                    className="hidden md:block w-[140px] sm:w-[190px] md:w-[240px] lg:w-[290px] h-auto object-contain mix-blend-multiply mx-auto"
                                    style={{ position: 'absolute', right: 0, transform: 'translateX(calc(100% + 1rem))' }} />
                            </div>

                            <p className="m-0 ml-2 text-xs text-left text-[#666]">
                                Exemple de vidéo interactive générée sur le thème de l'extinction des dinosaures
                            </p>
                        </div>

                        <Button
                            linkProps={{
                                href: "/intelligence-artificielle/video-interactive",
                            }}
                            className="w-full justify-center md:w-auto">Créer une vidéo interactive</Button>

                    </div>
                </div>
            </div>
        </div>
    )
}