import StairsContainer from "../StairsContainer";
import ImageStackWithText from "../ImageStackWithText";
import useWindowSize from "@/course_editor/hooks/useWindowSize";
import Image from 'next/image';

export default (props: { reverse?: boolean }) => {
    const color = "#0a76f6"
    const { isMobile } = useWindowSize();

    return (
        // <StairsContainer color={color}>
        <div className="w-full relative flex justify-center py-16">
            <div className="fr-col-12 fr-col-md-8 main-content-item flex flex-col">
                <div className={`flex ${isMobile ? 'flex-col p-16' : 'gap-16'}`} style={{ flexFlow: !isMobile && props.reverse ? "row-reverse" : isMobile ? "column" : "row" }}>

                    <div className={isMobile ? "w-full" : "w-7/12 pr-16"}>
                        <div className="flex w-auto h-full items-center justify-center">
                            <div className="relative w-full h-full">
                                <Image
                                    src="/images/home/section-2.png"
                                    alt=""
                                    layout="fill"
                                    objectFit="contain"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`${isMobile ? 'w-full mt-8' : 'w-5/12'} flex flex-col justify-center items-start gap-8`}>

                        <div className="flex flex-col justify-center items-start gap-8 py-10">
                            <div className="flex flex-col gap-6">
                                <h2 className="text-3xl md:text-4xl font-bold">
                                    Recherche d'images, vidéos, documents...
                                </h2>
                                <ul className="text-lg space-y-4">
                                    <li>Dans la base de données de la Cité des sciences et de l'industrie, du Palais de la
                                        découverte et de leurs partenaires</li>
                                    <li>Gratuit et libre d'utilisation dans le cadre de vos cours</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        // </StairsContainer>
    )
}