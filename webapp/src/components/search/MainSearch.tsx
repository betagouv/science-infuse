import Image from 'next/image'
import { styled } from "@mui/material"
import { useRouter } from "next/navigation"
import SearchBar from "./SearchBar"

export default () => {
    const router = useRouter()

    return (
        <div
            className="flex flex-col "
            style={{ background: "linear-gradient(135.4deg, #f5f5fe 0%, #e3e3fd 99.31%)" }}
        >
            <div className="fr-container" >
                <div className="fr-grid-row fr-grid-row--center">
                    <div className="fr-col-9">

                        <div className="w-full flex flex-col items-center gap-4 sm:gap-6 lg:gap-8 mt-16 mb-4">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-[#161616] mb-2 sm:mb-3 lg:mb-4">
                                Enseignez la science avec simplicité
                            </h1>

                            <div className="flex flex-col md:flex-row gap-4 sm:gap-4 lg:gap-4">
                                <Image
                                    src="/images/landing_section_1.svg"
                                    height={300}
                                    width={300}
                                    alt="Picture of the author"
                                    className="w-[140px] sm:w-[190px] md:w-[240px] lg:w-[290px] h-auto object-contain mix-blend-multiply mx-auto"                                />
                                <div className="flex flex-col gap-8 justify-center max-w-2xl flex-1">
                                    <p className="m-0 text-sm sm:text-lg md:text-md text-start text-[#161616]">
                                        Accédez à une bibliothèque riche de milliers de ressources pédagogiques multimédia. Créez des cours innovants grâce aux contenus exclusifs de la Cité des sciences et de l'industrie, du Palais de la découverte et de nos partenaires - le tout gratuitement !
                                    </p>
                                    <SearchBar big className="p-0 mb-4 sm:mb-6" inputClassName="bg-white" autoFocus={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}