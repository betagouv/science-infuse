import { Button } from "@mui/material";
import StairsContainer from "../StairsContainer";
import ImageStackWithText from "../ImageStackWithText";



export default (props: { reverse?: boolean }) => {
    const color = "#0a76f6"
    return (
        <StairsContainer color={color}>
            <div className="flex gap-16" style={{ flexFlow: props.reverse ? "row-reverse" : "row" }}>

                <div className="w-7/12 pr-16">
                    <ImageStackWithText
                        stairColor={color}
                        mainImage="/images/home/frame-2.png" />
                </div>

                <div className="w-5/12 flex flex-col justify-center items-start gap-8">

                    <div className="flex flex-col justify-center items-start gap-8 py-10">
                        <div className="flex flex-col gap-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-[#ececfe]">
                                Recherche d'images, vidéos, documents...
                            </h2>
                            <ul className="text-lg text-[#ececfe] space-y-4">
                                <li>Dans la base de données de la Cité des sciences et de l'industrie, du Palais de la
                                    découverte et de leurs partenaires</li>
                                <li>Gratuit et libre d'utilisation dans le cadre de vos cours</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </StairsContainer>
    )
}