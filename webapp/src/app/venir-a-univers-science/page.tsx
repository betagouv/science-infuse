import StairsContainer from "@/components/StairsContainer";
import Button from "@codegouvfr/react-dsfr/Button";

const NeedHelp = () => {
    return (
        <div className="w-full fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-container main-content-item">
                <div className="py-16 flex flex-col gap-16 md:px-0">

                    <p className="text-center">
                        <span className="text-3xl font-bold block mb-2">
                            Cité des sciences et de l'industrie & Palais de la découverte
                        </span>
                        <span className="text-xl">
                            Universcience vous accueille à Paris, sur chacun de ses deux sites.
                        </span>
                    </p>


                    {/* cite des sciences */}
                    <div className="relative flex justify-center bg-[#f2f2f2]">

                        <div className="absolute top-0 right-0 w-60">
                            <div className="w-[120px] h-[111px] absolute top-0 right-0 bg-white" />
                            <div className="w-60 h-[69px] absolute top-0 right-0 bg-white" />
                        </div>

                        <div className="flex flex-col gap-4 items-center text-center p-24 w-full h-full max-w-3xl">

                            <img src="/images/cite-des-sciences.jpg" alt="Illustration cité des sciences" className="flex-grow-0 mb-8 flex-shrink-0 w-80 h-auto" />

                            <p className="text-5xl font-medium text-center text-[#1a1a1a]">
                                La Cité des sciences et de l'industrie
                            </p>

                            <p className="m-0">Bien plus qu'un simple lieu d'exposition, c’est une véritable invitation à l'exploration scientifique pour les élèves et leurs enseignants. Imaginez : plonger au cœur d'un sous-marin avec l'Argonaute, s'émerveiller des expériences ludiques de la Cité des enfants ou encore s'envoler pour un voyage</p>
                            <p className="m-0">extraordinaire aux confins du cosmos grâce au Planétarium...</p>
                            <p className="m-0">Au-delà de ces expériences phares, la Cité des sciences et de l'industrie offre un éventail d'activités pédagogiques spécialement conçues pour les groupes scolaires, et ce, pour tous les niveaux.</p>
                            <p className="m-0">Que vous souhaitiez aborder des thématiques scientifiques pointues ou simplement attiser la curiosité de vos élèves, la Cité des sciences et de l'industrie saura vous proposer des activités stimulantes et enrichissantes ?</p>

                            <Button
                                linkProps={{
                                    href: "https://cite-sciences.fr/",
                                    target: "_blank",
                                    rel: "noopener noreferrer"
                                }}
                                priority="secondary"
                                size="large"
                                className="mt-8 bg-[#1a1a1a] text-white hover:!bg-[#333] transition-colors"
                            >
                                Site internet de la Cité
                            </Button>

                        </div>

                        <div className="absolute bottom-0 left-0 w-60">
                            <div className="w-[120px] h-[145px] absolute bottom-0 left-0 bg-white" />
                            <div className="w-60 h-[48.67px] absolute bottom-0 left-0 bg-white" />
                        </div>
                    </div >


                    {/* cite des sciences */}
                    <div className="relative flex justify-center bg-[#f2f2f2]">

                        <div className="absolute top-0 right-0 w-60">
                            <div className="w-[120px] h-[111px] absolute top-0 right-0 bg-white" />
                            <div className="w-60 h-[69px] absolute top-0 right-0 bg-white" />
                        </div>

                        <div className="flex flex-col gap-4 items-center text-center p-24 w-full h-full max-w-3xl">
                        <img src="/images/palais-decouverte.jpg" alt="Illustration palais de la découverte" className="flex-grow-0 mb-8 flex-shrink-0 w-80 h-auto" />

                            <p className="text-5xl font-medium text-center text-[#1a1a1a]">
                                Etincelles du palais de la découverte
                            </p>
                            <p className="m-0">Au cœur du 15e arrondissement de Paris, les Étincelles du Palais de la découverte vous accueillent pour un voyage extraordinaire au pays de la science ! Bien que le Palais de la découverte soit actuellement fermé pour rénovation, il continue de partager sa passion pour les sciences à travers des expériences spectaculaires et des expositions captivantes. Laissez vos élèves s'émerveiller devant la science en train de se faire, participer à des démonstrations époustouflantes et découvrir les dernières avancées scientifiques. Les Étincelles du Palais de la découverte, c'est une occasion unique de faire vivre la science à vos élèves et de leur donner le goût de la découverte !</p>

                            <Button
                                linkProps={{
                                    href: "https://www.palais-decouverte.fr/fr/venir-nous-voir/les-etincelles",
                                    target: "_blank",
                                    rel: "noopener noreferrer"
                                }}
                                priority="secondary"
                                size="large"
                                className="mt-8 bg-[#1a1a1a] text-white hover:!bg-[#333] transition-colors"
                            >
                                Site internet des Etiencelles
                            </Button>

                        </div>

                        <div className="absolute bottom-0 left-0 w-60">
                            <div className="w-[120px] h-[145px] absolute bottom-0 left-0 bg-white" />
                            <div className="w-60 h-[48.67px] absolute bottom-0 left-0 bg-white" />
                        </div>
                    </div >

                </div >
            </div >
        </div >
    )
}

export default NeedHelp;