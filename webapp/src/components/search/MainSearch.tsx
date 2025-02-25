import Image from 'next/image'
import { styled } from "@mui/material"
import { useRouter } from "next/navigation"
import SearchBar from "./SearchBar"

export default () => {
    const router = useRouter()

    return (
        <div className="mx-auto w-full flex flex-col items-center gap-4 sm:gap-6 lg:gap-8 px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-[#161616] mb-2 sm:mb-3 lg:mb-4">
                Enseignez la science avec simplicité
            </h1>

            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8">
                <Image
                    src="/images/landing.svg"
                    height={300}
                    width={300}
                    alt="Picture of the author"
                    className="w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px] h-auto object-contain mix-blend-multiply mx-auto"
                />
                <div className="flex flex-col justify-center max-w-2xl flex-1">
                    <p className="text-base sm:text-lg md:text-xl text-start text-[#161616] mb-4 sm:mb-6">
                    Accédez à une bibliothèque riche de milliers de ressources pédagogiques multimédia. Créez des cours innovants grâce aux contenus exclusifs de la Cité des sciences, du Palais de la découverte et de nos partenaires - le tout gratuitement !
                    </p>
                    <SearchBar className="p-0 mb-4 sm:mb-6" inputClassName="bg-white" autoFocus={true} />
                </div>
            </div>
        </div>
    )
}