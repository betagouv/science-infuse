import { styled } from "@mui/material"
import { useRouter } from "next/navigation"
import SearchBar from "./SearchBar"



export default () => {
    const router = useRouter()

    return (
        <div className="mx-auto w-full flex flex-col items-center gap-8 px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center text-[#161616] mb-4">
                Quelle thématique souhaitez-vous explorer ?
            </h1>
            <p className="text-lg md:text-xl text-center text-[#161616] mb-8">
                Trouvez les contenus pour illustrer ou animer votre prochain cours, parmi les milliers de
                ressources gratuites de la Cité des sciences et de l'industrie, du Palais de la découverte.
            </p>
            <SearchBar className="px-4 mb-8 !max-w-[35rem]" autoFocus={true} />
        </div>
    )
}