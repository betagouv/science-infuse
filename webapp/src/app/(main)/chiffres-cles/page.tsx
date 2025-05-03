
'use client';

import AutoBreadCrumb from "@/components/AutoBreadCrumb"
import Tile from "@codegouvfr/react-dsfr/Tile"
import CallOut from '@codegouvfr/react-dsfr/CallOut';
import Card from "@codegouvfr/react-dsfr/Card";

const ChiffresClés = () => {
    return (
        <div className='w-full fr-grid-row fr-grid-row--center'>
            <div className='flex flex-col fr-container main-content-item mt-4'>
                <AutoBreadCrumb className="mb-4" />

                <div className="fr-col-12 fr-col-md-10 main-content-item mb-4 self-center">
                    <div className="flex flex-col pb-16">

                        <h1 className="text-4xl font-bold mb-8 text-center">Chiffres clés</h1>

                        <section className="my-16">
                            <h2 className="text-2xl font-bold mb-6 text-blue-800 border-b pb-2">Une bibliothèque riche et diversifiée</h2>

                            <p className="text-lg mb-8 mx-auto">
                                Notre plateforme propose déjà une bibliothèque exceptionnelle de ressources pédagogiques.
                            </p>

                            <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
                                <div className="fr-col-12 fr-col-md-6 p-2">
                                    <Tile
                                        title="6 874"
                                        desc="vidéos indexées"
                                        detail="offrant un accès instantané à des contenus audiovisuels de qualité"
                                        titleAs="h2"
                                        grey
                                        className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full"
                                    />
                                </div>
                                <div className="fr-col-12 fr-col-md-6 p-2">
                                    <Tile
                                        title="11 909"
                                        desc="documents indexés"
                                        detail="constituant une base documentaire complète et approfondie"
                                        titleAs="h2"
                                        grey
                                        className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="mb-16  rounded-lg">
                            <h2 className="text-2xl font-bold mb-2 text-blue-800">Une croissance d'audience prometteuse</h2>

                            <p className="text-lg mb-8 italic">Depuis notre lancement le 1er octobre 2024.</p>

                            <div className="fr-grid-row fr-grid-row--gutters">
                                <div className="fr-col-12 fr-col-md-4 p-2">
                                    <Tile
                                        title="970"
                                        desc="visiteurs uniques"
                                        detail="ont découvert notre plateforme"
                                        titleAs="h2"
                                        grey
                                        className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full"
                                    />
                                </div>
                                <div className="fr-col-12 fr-col-md-4 p-2">
                                    <Tile
                                        title="9 428"
                                        desc="pages vues"
                                        detail="au total, démontrant l'intérêt suscité par nos contenus"
                                        titleAs="h2"
                                        grey
                                        className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full"
                                    />
                                </div>
                                <div className="fr-col-12 fr-col-md-4 p-2">
                                    <Tile
                                        title="178"
                                        desc="utilisateurs inscrits"
                                        detail="témoignant de l'attractivité de notre offre"
                                        titleAs="h2"
                                        grey
                                        className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="mb-16">
                            <h2 className="text-2xl font-bold mb-2 text-blue-800 border-b pb-2">Un engagement qualifié des utilisateurs</h2>

                            <p className="text-lg mb-8 italic">
                                Nos utilisateurs démontrent un véritable intérêt pour les contenus proposés.
                            </p>

                            <div className="fr-grid-row fr-grid-row--gutters">
                                <div className="fr-col-12 fr-col-md-6 p-2">
                                    <Tile
                                        title="10min 35s"
                                        desc="durée moyenne de visite"
                                        detail="pour les utilisateurs authentifiés, révélant une exploration approfondie des contenus"
                                        titleAs="h2"
                                        grey
                                        className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full"
                                    />
                                </div>
                                <div className="fr-col-12 fr-col-md-6 p-2">
                                    <Tile
                                        title="646"
                                        desc="requêtes"
                                        detail="effectuées sur notre moteur de recherche depuis le début 2025"
                                        titleAs="h2"
                                        grey
                                        className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="mb-16  rounded-lg">
                            <h2 className="text-2xl font-bold mb-2 text-blue-800">Des thématiques qui répondent aux attentes</h2>

                            <p className="text-lg mb-8 italic">
                                Nos contenus les plus populaires reflètent l'intérêt pour les sciences et la santé.
                            </p>

                            <div className="fr-grid-row fr-grid-row--gutters">
                                <div className="fr-col-12 fr-col-md-4 p-2">
                                    <Card
                                        background
                                        border
                                        desc="L'origine des activités volcaniques et sismiques"
                                        title="96 vues uniques"
                                        enlargeLink
                                        imageAlt="Illustration d'une coupe de la Terre montrant les activités volcaniques et sismiques"
                                        imageUrl="https://science-infuse.beta.gouv.fr/api/s3/presigned_url/object_name/prof/cm0zel864000c11styasoildy/11b64ca2-3d20-473f-9870-d1cdc84dec6b.png"
                                        linkProps={{
                                            href: "https://ada.beta.gouv.fr/prof/chapitres/cm1ieay760028te4pfnsxju83/view",
                                            target: "_blank",
                                        }}
                                        size="medium"
                                        titleAs="h3"
                                    />
                                </div>
                                <div className="fr-col-12 fr-col-md-4 p-2">
                                    <Card
                                        background
                                        border
                                        desc="Météo et climat"
                                        title="91 vues uniques"
                                        enlargeLink
                                        imageAlt="Illustration représentant des éléments météorologiques et climatiques"
                                        imageUrl="https://science-infuse.beta.gouv.fr/api/s3/presigned_url/object_name/prof/cm0zeprhf000d11st314t79ed/93266077-0f44-41f9-997f-e2df47e52bf5.jpeg"
                                        linkProps={{
                                            href: "https://ada.beta.gouv.fr/prof/chapitres/cm1j81p0c001gmqp9nhdjm9mc/view",
                                            target: "_blank",
                                        }}
                                        size="medium"
                                        titleAs="h3"
                                    />
                                </div>
                                <div className="fr-col-12 fr-col-md-4 p-2">
                                    <Card
                                        background
                                        border
                                        desc="Mes organes : une équipe"
                                        title="66 vues uniques"
                                        enlargeLink
                                        imageAlt="texte alternatif de l’image"
                                        imageUrl="https://science-infuse.beta.gouv.fr/api/s3/presigned_url/object_name/prof/cm0zel864000c11styasoildy/453daaa5-fc67-4110-b313-2ff86384f3c3.png"
                                        linkProps={{
                                            href: "https://ada.beta.gouv.fr/prof/chapitres/cm1ieg830002hte4pfocwj709/view",
                                            target: "_blank",
                                        }}
                                        size="medium"
                                        titleAs="h3"
                                    />


                                </div>
                            </div>
                        </section>

                        <section className="mb-16">
                            <h2 className="text-2xl font-bold mb-2 text-blue-800 border-b pb-2">Une dynamique positive pour 2025</h2>

                            <p className="text-lg mb-8 italic">Depuis le 1er janvier 2025.</p>

                            <div className="fr-grid-row fr-grid-row--gutters">
                                <div className="fr-col-12 fr-col-md-6 p-2">
                                    <Tile
                                        title="30"
                                        desc="utilisateurs actifs"
                                        detail="continuent d'exploiter régulièrement nos ressources"
                                        titleAs="h2"
                                        grey
                                        className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full"
                                    />
                                </div>
                                <div className="fr-col-12 fr-col-md-6 p-2">
                                    <Tile
                                        title="15"
                                        desc="nouveaux inscrits"
                                        detail="ont rejoint notre communauté"
                                        titleAs="h2"
                                        grey
                                        className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full"
                                    />
                                </div>
                            </div>
                        </section>

                        <CallOut className="mt-8 mb-12">
                            <p className="fr-text--lg fr-text--bold mb-4 ">
                                Ces résultats prometteurs confirment la pertinence de notre offre éducative
                                et constituent une base solide pour notre développement futur.
                            </p>
                            <p className="text-gray-700">
                                <strong>Note :</strong> Universcience fait le choix stratégique de limiter la communauté à
                                180 enseignants pour le moment, afin d'observer l'usage des ressources, affiner leur
                                diffusion et renforcer l'attractivité de la plateforme. Universcience portera son
                                déploiement à plus grand échelle à l'issue de la phase de pérennisation,
                                durant l'été 2025.
                            </p>
                        </CallOut>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChiffresClés