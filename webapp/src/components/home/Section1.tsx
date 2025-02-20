import React from "react";
import Image from 'next/image'
import useWindowSize from "@/course_editor/hooks/useWindowSize";
import { useRouter } from "next/navigation";
import Button from "@codegouvfr/react-dsfr/Button";

export default (props: { reverse?: boolean }) => {
    const color = "#ff8642"
    const { isMobile } = useWindowSize();
    const router = useRouter()

    return (
        <div className="w-full relative flex justify-center py-8 md:py-16">
            <div className="fr-col-12 fr-col-md-9 main-content-item flex flex-col">
                <div className="w-full flex flex-col items-center gap-4 md:gap-8 px-4 md:px-0">
                    <h2 className="text-[28px] md:text-[32px] font-bold text-center text-[#161616]">
                        Un apprentissage enrichi par l'Intelligence Artificielle d'Ada
                    </h2>

                    <p className="text-base md:text-lg text-center text-[#161616]">
                        Transformez chaque vidéo en une expérience d'apprentissage interactive et personnalisée. Notre
                        Intelligence Artificielle (IA) génère automatiquement des définitions contextuelles et des
                        questions stimulantes, que vous pouvez adapter selon vos besoins pédagogiques.
                    </p>

                    <Image
                        src="/images/interactive-video-preview.png"
                        height={300}
                        width={600}
                        alt="Illustration vidéo interactive"
                        className="w-full md:w-auto h-full object-contain mix-blend-multiply"
                    />

                    <Button
                        linkProps={{
                            href: "/prof/creer-un-interactif",
                        }}
                        className="w-full justify-center md:w-auto">Créer une vidéo interactive</Button>

                </div>
            </div>
        </div>
    )
}