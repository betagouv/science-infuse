import { Button } from "@mui/material";
import StairsContainer from "../StairsContainer";
import ImageStackWithText from "../ImageStackWithText";
import useWindowSize from "@/course_editor/hooks/useWindowSize";
import React from "react";



export default (props: { reverse?: boolean }) => {
    const color = "#ff8642"
    const {isMobile} = useWindowSize();

    return (
        <StairsContainer color={color}>
            <div className={`flex ${isMobile ? 'flex-col p-16' : 'gap-16'}`} style={{ flexFlow: !isMobile && props.reverse ? "row-reverse" : isMobile ? "column" : "row" }}>

                <div className={`${isMobile ? 'w-full mt-8' : 'w-5/12'} flex flex-col justify-center items-start gap-8`}>
                    <div className="flex flex-col gap-10">
                        <h1 className="text-[40px] font-bold text-[#1a1a1a]">
                            Catalogue de cours
                        </h1>
                        <ul className="text-lg text-[#1a1a1a] space-y-4">
                            <li>Créés et validés par d'autres enseignants de l'Éducation Nationale</li>
                            <li>Exportables dans votre ENT (environnement numérique de travail)</li>
                            <li>Editables pour s'adapter à votre manière d'enseigner</li>
                        </ul>
                        <Button type='submit' className='w-fit px-4 flex items-center justify-center bg-black text-[#fff]'>Accéder au catalogue</Button>
                    </div>
                </div>


                <div className={isMobile ? "w-full" : "w-7/12 pr-16"}>
                    <ImageStackWithText
                        stairColor={'#ffa800'}
                        mainImage="/images/home/frame-1.png"
                        title="SVT - Cycle 4"
                        subTitle={<><p className='m-0 text-2xl font-bold text-left text-[#1a1a1a]'>Titre de chapitre</p>
                            <p className='m-0 text-lg font-bold text-left text-[#1a1a1a]'> <a href="">Découvrir +</a></p>
                        </>}
                    />
                </div>
            </div>
        </StairsContainer>
    )
}