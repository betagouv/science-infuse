import StairsContainer from "../StairsContainer";
import ImageStackWithText from "../ImageStackWithText";
import useWindowSize from "@/course_editor/hooks/useWindowSize";
import React from "react";



export default (props: { reverse?: boolean }) => {
    const color = "#a243e3"
    const { isMobile } = useWindowSize();

    return (
        // <StairsContainer color={color}>
        <div className="w-full relative flex justify-center bg-[#e8edff] py-16">
            <div className="fr-col-12 fr-col-md-8 main-content-item flex flex-col">
                <div className={`flex ${isMobile ? 'flex-col p-16' : 'gap-16'}`} style={{ flexFlow: !isMobile && props.reverse ? "row-reverse" : isMobile ? "column" : "row" }}>

                    <div className={`${isMobile ? 'w-full mt-8' : 'w-5/12'} flex flex-col justify-center items-start gap-8`}>

                        <div className="flex flex-col justify-center items-start gap-8 py-10">
                            <div className="flex flex-col gap-6">
                                <h2 className="text-3xl md:text-4xl font-bold">Création de cours</h2>
                                <ul className="text-lg space-y-4">

                                    <li>Rédigez les textes, importez vos propres fichiers, choisissez des contenus Science Infuse, créez vos quizz et flashcards...</li>
                                    <li>Exportables dans votre ENT (environnement numérique de travail)</li>
                                    <li>Partageables avec la communauté Science Infuse si vous le souhaitez</li>
                                </ul>
                            </div>
                        </div>
                    </div>


                    <div className={isMobile ? "w-full" : "w-7/12 pr-16"}>
                        <div className="flex w-full h-full items-center justify-center">
                            <img className="w-full" src="/images/home/section-3.png" alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        // </StairsContainer >
    )
}