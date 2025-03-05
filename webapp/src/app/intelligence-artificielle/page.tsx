import Card from "@codegouvfr/react-dsfr/Card"

export default () => {

return <div className='w-full fr-grid-row fr-grid-row--gutters fr-grid-row--center'>
        <div className='flex flex-col fr-container main-content-item my-24 gap-8'>

            <h1 className="text-[28px] md:text-[32px] font-bold text-center text-[#161616]">
                Un apprentissage enrichi par l'Intelligence Artificielle d'Ada
            </h1>
            <div className="flex gap-4">

                <Card
                    className="max-w-96"
                    background
                    border
                    title="Créer une vidéo interactive"
                    desc="Transformez une vidéo en une expérience d'apprentissage interactive et personnalisée. Notre Intelligence Artificielle  (IA) génère automatiquement des définitions contextuelles et des questions stimulantes, que vous pouvez adapter selon vos besoins pédagogiques."
                    enlargeLink
                    linkProps={{
                        href: '/intelligence-artificielle/video-interactive'
                    }}
                    size="medium"
                    titleAs="h3"
                />

            </div>

        </div>
    </div>
}