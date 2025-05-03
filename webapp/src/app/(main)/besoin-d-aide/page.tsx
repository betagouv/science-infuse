import Image from 'next/image'
import AutoBreadCrumb from "@/components/AutoBreadCrumb";
import StairsContainer from "@/components/StairsContainer";
import FAQ from './FAQ'

const NeedHelp = () => {
    return (
        <div className='w-full fr-grid-row fr-grid-row--center'>
            <div className='flex flex-col fr-container main-content-item mt-4'>
                <AutoBreadCrumb className="mb-4" />

                <div className="fr-col-12 fr-col-md-12 main-content-item mb-4 self-center">
                    <div className="flex flex-col md:flex-row pb-16">

                        <div className="w-full md:w-3/5 flex flex-col">
                            <h1 className='mt-4'>Des questions ou des remarques ?</h1>

                            <p className="mt-8">Vous pouvez contacter notre équipe par email <a className='text-[#000091]' href="mailto:science-infuse@universcience.fr">(science-infuse@universcience.fr)</a> ou par téléphone (06 69 29 18 66) tous les jours entre 9h30 et 19h</p>
                            <p>Nous prenons vos questions à coeur, afin de vous être le plus utiles possible. Vos retours d'expérience sont précieux et permettent d'améliorer le service.</p>
                            <p>A bientôt !</p>
                        </div>
                        <div className="hidden md:flex w-full md:w-2/5">
                            <Image
                                src="/images/compass.svg"
                                height={300}
                                width={300}
                                alt="Picture of the author"
                                className="w-[120px] sm:w-[180px] md:w-[240px] lg:w-[300px] h-auto object-contain mix-blend-multiply mx-auto" />
                        </div>
                    </div>
                <FAQ />
                </div>
            </div>
        </div>
    )
}

export default NeedHelp;