import StairsContainer from "../StairsContainer";
import ImageStackWithText from "../ImageStackWithText";
import useWindowSize from "@/course_editor/hooks/useWindowSize";
import React from "react";



export default (props: { reverse?: boolean }) => {
    const color = "#a243e3"
    const {isMobile} = useWindowSize();

    return (
        <StairsContainer color={color}>
            <div className={`flex ${isMobile ? 'flex-col p-16' : 'gap-16'}`} style={{ flexFlow: !isMobile && props.reverse ? "row-reverse" : isMobile ? "column" : "row" }}>

                <div className={`${isMobile ? 'w-full mt-8' : 'w-5/12'} flex flex-col justify-center items-start gap-8`}>

                    <div className="flex flex-col justify-center items-start gap-8 py-10">
                        <div className="flex flex-col gap-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-[#ececfe]">Création de cours</h2>
                            <ul className="text-lg text-[#ececfe] space-y-4">

                                <li>Rédigez les textes, importez vos propres fichiers, choisissez des contenus Science Infuse, créez vos quizz et flashcards...</li>
                                <li>Exportables dans votre ENT (environnement numérique de travail)</li>
                                <li>Partageables avec la communauté Science Infuse si vous le souhaitez</li>
                            </ul>
                        </div>
                    </div>
                </div>


                <div className={isMobile ? "w-full" : "w-7/12 pr-16"}>
                    <ImageStackWithText
                        aspect="4/5"
                        disableStack={true}
                        stairColor={'#a243e380'}
                        mainImage="/images/home/frame-3.png"
                        title="SVT - Cycle 4"
                        subTitle={<><p className='m-0 text-2xl font-bold text-left text-[#1a1a1a]'>Titre de chapitre</p>
                            <p className='m-0 text-lg font-bold text-left text-[#1a1a1a]'> <a href="">Découvrir +</a></p>
                        </>}
                    />
                </div>
            </div>
        </StairsContainer >
    )
}