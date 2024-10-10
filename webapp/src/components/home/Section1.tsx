import StairsContainer from "../StairsContainer";
import ImageStackWithText from "../ImageStackWithText";
import useWindowSize from "@/course_editor/hooks/useWindowSize";
import React from "react";
import Button from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";
import { RenderChapter, StyledCardWithoutTitle } from "@/app/recherche/DocumentChunkFull";
import { RenderChapterTOC } from "@/course_editor/components/CourseSettings/ChapterTableOfContents";
import { ChevronRight } from "lucide-react";


export default (props: { reverse?: boolean }) => {
    const color = "#ff8642"
    const { isMobile } = useWindowSize();
    const router = useRouter()


    return (
        // <StairsContainer color={color}>
        <div className="w-full relative flex justify-center bg-[#e8edff] py-16">
            <div className="fr-col-12 fr-col-md-8 main-content-item flex flex-col">

                <div className={`flex ${isMobile ? 'flex-col p-16' : 'gap-16'}`} style={{ flexFlow: !isMobile && props.reverse ? "row-reverse" : isMobile ? "column" : "row" }}>

                    <div className={`${isMobile ? 'w-full mt-8' : 'w-5/12'} flex flex-col justify-center items-start gap-8`}>
                        <div className="flex flex-col gap-10">
                            <h1 className="text-[40px] font-bold text-[#1a1a1a]">
                                Catalogue de cours
                            </h1>
                            <ul className="text-md text-[#1a1a1a] space-y-4">
                                <li>Adaptés au programme de SVT du cycle 4</li>
                                <li>Créés et validés par des enseignants de l’Éducation Nationale</li>
                                <li>Exportables dans votre ENT (environnement numérique de travail)</li>
                            <li>Editables pour s’adapter à votre manière d’enseigner</li>
                            </ul>
                            <Button onClick={() => router.push('/catalogue/all')} className='w-fit px-4 flex items-center justify-center'>Accéder au catalogue</Button>
                        </div>
                    </div>


                    <div className={isMobile ? "w-full" : "w-7/12"}>
                        <StyledCardWithoutTitle
                            background
                            enlargeLink
                            border
                            badge={<></>}
                            desc={
                                <div className="relative pt-4" >
                                    <p className="text-start text-3xl text-black">Météo et climat</p>
                                    <div className="flex flex-col gap-3">
                                        <ul className="list-none p-0">
                                            {[
                                                "Introduction",
                                                "La différence entre la météo et le climat",
                                                "Origine des différentes zones climatiques",
                                                "Les phénomènes naturels liés au climat",
                                                "Les variations du climat",
                                                "QCM",
                                            ].map((block, index) => (
                                                <li key={block}>
                                                    <p
                                                        className="m-0 flex-grow text-md text-left text-[#161616] font-medium"
                                                    >
                                                        {block}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                </div >
                            }
                            horizontal
                            imageAlt="image d'illustration du chapitre"
                            imageUrl={"/images/home/chapter-cover.jpeg"}
                            size="small"
                            title={""}
                            titleAs="h3"
                            linkProps={{
                                href: `#`,
                                target: "_self"
                            }}
                        ></StyledCardWithoutTitle>
                    </div>
                </div>
            </div>
        </div>
        // </StairsContainer>
    )
}