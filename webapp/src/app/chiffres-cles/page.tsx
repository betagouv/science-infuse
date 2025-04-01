
'use client';

import AutoBreadCrumb from "@/components/AutoBreadCrumb"
import Tile from "@codegouvfr/react-dsfr/Tile"

const ChiffresClés = () => {
    return (
        <div className='w-full fr-grid-row fr-grid-row--center'>
            <div className='flex flex-col fr-container main-content-item my-8 max-w-6xl'>
                <AutoBreadCrumb className="mb-6" />

                <h1 className="text-4xl font-bold mb-8 text-center">Chiffres clés</h1>

                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6 text-blue-800 border-b pb-2">Une bibliothèque riche et diversifiée</h2>

                    <p className="text-lg mb-8 max-w-3xl mx-auto text-center">
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

                    <p className="text-lg mb-8 italic max-w-3xl">
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
                            <Tile
                                title="96"
                                desc="vues uniques"
                                detail="L'origine des activités volcaniques et sismiques"
                                titleAs="h2"
                                grey
                                className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full"
                            />
                        </div>
                        <div className="fr-col-12 fr-col-md-4 p-2">
                            <Tile
                                title="91"
                                desc="vues uniques"
                                detail="Météo et climat"
                                titleAs="h2"
                                grey
                                className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full"
                            />
                        </div>
                        <div className="fr-col-12 fr-col-md-4 p-2">
                            <Tile
                                title="66"
                                desc="vues uniques"
                                detail="Mes organes : une équipe"
                                titleAs="h2"
                                grey
                                className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full"
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

                <section className="mt-8 mb-12 p-6 border-l-4 border-blue-600">
                    <p className="fr-text--lg fr-text--bold mb-4 text-blue-800">
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
                </section>
            </div>
        </div>
    )
}

export default ChiffresClés