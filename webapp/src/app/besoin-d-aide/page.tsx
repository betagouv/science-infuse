import AutoBreadCrumb from "@/components/AutoBreadCrumb";
import StairsContainer from "@/components/StairsContainer";

const NeedHelp = () => {
    return (
        <div className="w-full fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-container pt-8 main-content-item">
                <AutoBreadCrumb />
                <div className="pb-16 flex flex-col gap-8 md:px-0">

                    <div className="relative  bg-[#f2f2f2]">

                        <div className="flex flex-col gap-16 items-center text-center p-24 w-full h-full">

                            <p className="m-0 w-full text-4xl md:text-5xl font-medium text-[--text-title-blue-france] text-center">
                                Vous avez des questions <br /> ou remarques ?
                            </p>

                            <div className="flex flex-col gap-8 max-w-2xl mt-auto mb-auto">
                                <p className="m-0">Contactez notre équipe :</p>
                                <p className="m-0">Olivier : par email à : <b>science-infuse@universcience.fr </b></p>
                                <p className="m-0">Alexandra : par téléphone au <b>06 69 29 18 66</b> (tous les jours entre 9h30 et 19h)</p>
                                <p className="m-0">Nous prenons vos questions à coeur, afin de vous être le plus utiles possible. Vos retours d’expérience sont précieux et permettent d’améliorer le service.</p>
                                <p className="m-0">A bientôt !</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default NeedHelp;