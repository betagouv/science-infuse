import StairsContainer from "@/components/StairsContainer";

const NeedHelp = () => {
    return (
        <div className="w-full fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-container main-content-item">
                <div className="py-16 flex flex-col gap-8 md:px-0">

                    <div className="relative  bg-[#f2f2f2]">

                        <div className="absolute top-0 right-0 w-60">
                            <div className="w-[120px] h-[111px] absolute top-0 right-0 bg-white" />
                            <div className="w-60 h-[69px] absolute top-0 right-0 bg-white" />
                        </div>

                        <div className="flex flex-col gap-16 items-center text-center p-24 w-full h-full">
                            
                            <p className="m-0 w-full text-4xl md:text-5xl font-medium text-center text-[#a243e3]">
                                Une question ?
                                <br />
                                Une remarque ?
                            </p>

                            <div className="flex flex-col gap-8 max-w-2xl mt-auto mb-auto">
                                <p className="m-0">Contactez l’équipe Science Infuse : </p>
                                <p className="m-0">Par e-mail, Olivier : <b>science-infuse@universcience.fr</b> </p>
                                <p className="m-0">Tous les jours entre 9h30 et 19h, Alexandra : <b>06 69 29 18 66</b> </p>
                                <p className="m-0">Nous prenons vos questions à coeur, afin de vous être le plus utiles possible. Vos retours d’expérience sont précieux et permettent d’améliorer le service.</p>
                                <p className="m-0">A bientôt !</p>
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 w-60">
                            <div className="w-[120px] h-[145px] absolute bottom-0 left-0 bg-white" />
                            <div className="w-60 h-[48.67px] absolute bottom-0 left-0 bg-white" />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default NeedHelp;