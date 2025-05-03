import Button from "@codegouvfr/react-dsfr/Button";

const NeedHelp = () => {
    return (
        <div className="w-full fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-container main-content-item">
                <div className="py-16 flex flex-col gap-16 md:px-0">

                    <div className="m-0 text-left">
                        <h1>
                            Cité des sciences et de l'industrie <br />& Palais de la découverte
                        </h1>
                        <p className="text-xl m-0">
                            Universcience vous accueille à Paris, sur chacun de ses deux sites.
                        </p>
                    </div>


                    {/* cite des sciences */}
                    <div className="relative flex justify-center bg-[#f2f2f2]">
                        <div className="flex flex-col gap-4 items-center p-24 w-full h-full max-w-3xl">

                            <img src="/images/cite-des-sciences.jpg" alt="Illustration cité des sciences" className="flex-grow-0 mb-8 flex-shrink-0 w-80 h-auto" />

                            <h2 className="text-[#1a1a1a]">
                                La Cité des sciences et de l'industrie
                            </h2>

                            <p className="m-0">Bien plus qu'un simple lieu d'exposition, c’est une véritable invitation à l'exploration scientifique pour les élèves et leurs enseignants. Imaginez : plonger au cœur d'un sous-marin avec l'Argonaute, s'émerveiller des expériences ludiques de la Cité des enfants ou encore s'envoler pour un voyage extraordinaire aux confins du cosmos grâce au Planétarium...</p>
                            <p className="m-0">Au-delà de ces expériences phares, la Cité des sciences et de l'industrie offre un éventail d'activités pédagogiques spécialement conçues pour les groupes scolaires, et ce, pour tous les niveaux.</p>
                            <p className="m-0">Que vous souhaitiez aborder des thématiques scientifiques pointues ou simplement attiser la curiosité de vos élèves, la Cité des sciences et de l'industrie saura vous proposer des activités stimulantes et enrichissantes.</p>

                            <Button
                                linkProps={{
                                    href: "https://cite-sciences.fr/",
                                    target: "_blank",
                                    rel: "noopener noreferrer"
                                }}
                                priority="primary"
                                size="large"
                                className="mt-8"
                            >
                                Voir le site internet
                            </Button>

                        </div>
                    </div>


                    {/* cite des sciences */}
                    <div className="relative flex justify-center bg-[#f2f2f2]">

                        <div className="flex flex-col gap-4 items-center p-24 w-full h-full max-w-3xl">
                            <img src="/images/palais-decouverte.jpg" alt="Illustration palais de la découverte" className="flex-grow-0 mb-8 flex-shrink-0 w-80 h-auto" />

                            <h2 className="text-[#1a1a1a]">
                                Étincelles du Palais de la découverte
                            </h2>
                            <p className="m-0">Au cœur du 15e arrondissement de Paris, les Étincelles du Palais de la découverte vous accueillent pour un voyage extraordinaire au pays de la science ! Bien que le Palais de la découverte soit actuellement fermé pour rénovation, il continue de partager sa passion pour les sciences à travers des expériences spectaculaires et des expositions captivantes. Laissez vos élèves s'émerveiller devant la science en train de se faire, participer à des démonstrations époustouflantes et découvrir les dernières avancées scientifiques. Les Étincelles du Palais de la découverte, c'est une occasion unique de faire vivre la science à vos élèves et de leur donner le goût de la découverte !</p>

                            <Button
                                linkProps={{
                                    href: "https://www.palais-decouverte.fr/fr/venir-nous-voir/les-etincelles",
                                    target: "_blank",
                                    rel: "noopener noreferrer"
                                }}
                                priority="primary"
                                size="large"
                                className="mt-8"
                            >
                                Voir le site internet
                            </Button>

                        </div>

                    </div>

                </div>
            </div>
        </div>
    )
}

export default NeedHelp;