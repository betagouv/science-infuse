import SearchBar from "@codegouvfr/react-dsfr/SearchBar"
import { styled } from "@mui/material"
import { useRouter } from "next/navigation"

const StyledSearchBar = styled(SearchBar)`
.fr-btn {
background: black;
}

.fr-search-bar .fr-input {
box-shadow: inset 0 -2px 0 0 var(--border-action-high-blue-france);
}
`

export default () => {
    const router = useRouter()
    
    return (
        <div className="mx-auto w-full flex flex-col items-center gap-8">
            <h1 className="text-4xl md:text-5xl font-bold text-center text-[#161616] mb-4">
                Bienvenue sur Science Infuse
            </h1>
            <p className="text-lg md:text-xl text-left text-[#161616] mb-8">
                Trouvez les contenus pour illustrer ou animer votre prochain cours, parmi les milliers de
                ressources gratuites de la Cité des sciences et de l'industrie, du Palais de la découverte et de
                nos partenaires.
            </p>
            <StyledSearchBar
                className="w-[40rem] max-w-full"
                label="Rechercher une image, une vidéo, un document..."
                big
                allowEmptySearch={false}
                onButtonClick={(text: string) => {
                    router.push(`/search?query=${encodeURIComponent(text)}`)
                }}
            />
        </div>
    )
}