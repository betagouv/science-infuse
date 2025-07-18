import { PROJECT_NAME } from "@/config";

const Legals = () => {
    return (
        <div className="w-full fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-6 main-content-item my-24">
                <div className="py-16 flex flex-col gap-4 md:px-0">
                    <h1>Mentions légales</h1>

                    <section>
                        <h2>Plateforme Ada</h2>
                        <p>
                            Éditeur du site Le site Ada (
                            <a href="https://ada.beta.gouv.fr" target="_blank" rel="noopener">
                                https://ada.beta.gouv.fr
                            </a>{' '}
                            ) est édité par Universcience, établissement public du Palais de la
                            découverte et de la Cité des sciences et de l'industrie (EPPDCSI), en
                            partenariat avec le ministère de la Culture.
                        </p>

                        <ul>
                            <li>
                                <strong>Siège social</strong> : Palais de la découverte Avenue Franklin
                                Delano Roosevelt, 75008 Paris
                            </li>
                            <li>
                                <strong>Serveur vocal</strong> : 01 40 05 80 00
                            </li>
                            <li>
                                <strong>Adresse du projet</strong> : Cité des sciences et de
                                l'industrie 30, avenue Corentin-Cariou, 75019 Paris
                            </li>
                            <li>
                                <strong>Directeur de la publication</strong> : Bruno Maquart,
                                Président d’Universcience
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>1. Hébergement</h2>
                        <p>
                            Le site Ada est hébergé par :
                            <br />
                            <strong>OVH</strong> 2, rue Kellermann 59100 Roubaix – France{' '}
                            <a href="https://www.ovh.com/" target="_blank" rel="noopener">
                                https://www.ovh.com
                            </a>
                        </p>
                    </section>

                    <section>
                        <h2>2. Données personnelles</h2>
                        <p>
                            La plateforme Ada collecte et traite des données personnelles dans le
                            cadre de ses services destinés aux enseignants du secondaire.
                            Universcience est responsable du traitement des données à caractère
                            personnel collectées sur le site. Ces données sont nécessaires pour :
                        </p>
                        <ul>
                            <li>créer un compte utilisateur sécurisé</li>
                            <li>proposer des ressources pédagogiques adaptées</li>
                            <li>
                                améliorer la plateforme via des statistiques anonymisées (Matomo)
                            </li>
                        </ul>

                        <h3>Exercer vos droits</h3>
                        <p>
                            Conformément au RGPD et à la Loi Informatique et Libertés, vous
                            disposez des droits suivants : Accès, Rectification, Suppression (droit
                            à l’oubli), Portabilité, Opposition, Limitation du traitement, Retrait du
                            consentement.
                        </p>
                        <p>Vous pouvez exercer ces droits en contactant Universcience :</p>
                        <ul>
                            <li>
                                par courriel :{' '}
                                <a href="mailto:rgpd@universcience.fr">rgpd@universcience.fr</a>
                            </li>
                            <li>
                                par courrier postal : Universcience 30 avenue Corentin Cariou, 75019
                                Paris
                            </li>
                        </ul>
                        <p>
                            Un justificatif d’identité doit être joint à votre demande pour que nous
                            puissions vous identifier. Si vous estimez, après nous avoir contactés, que
                            vos droits ne sont pas respectés, vous pouvez adresser une réclamation à
                            la CNIL :{' '}
                            <a href="https://www.cnil.fr/" target="_blank" rel="noopener">
                                https://www.cnil.fr
                            </a>
                        </p>
                    </section>

                    <section>
                        <h2>3. Cookies et traceurs</h2>
                        <p>
                            La plateforme utilise Matomo, un outil de mesure d’audience respectueux
                            de la vie privée, configuré en mode exempté, ce qui signifie :
                        </p>
                        <ul>
                            <li>Aucune collecte de données personnelles identifiantes</li>
                            <li>Aucune transmission à des tiers</li>
                            <li>Aucune création de profils</li>
                        </ul>
                        <p>
                            Les données collectées sont anonymisées (adresse IP tronquée, informations
                            techniques globales, pages consultées, requêtes, etc.) et servent
                            uniquement à améliorer le service.
                        </p>
                    </section>

                    <section>
                        <h2>4. Propriété intellectuelle</h2>
                        <p>
                            L’ensemble des contenus présents sur le site Ada (textes,
                            illustrations, vidéos, interfaces, bases de données, etc.) est protégé par
                            les lois en vigueur sur la propriété intellectuelle et appartient à
                            Universcience ou à des tiers ayant autorisé leur utilisation. Toute
                            reproduction, représentation ou exploitation, partielle ou totale, sans
                            autorisation écrite préalable, est strictement interdite, notamment à
                            des fins commerciales ou dans des environnements en réseau.
                        </p>
                    </section>

                    <section>
                        <h2>5. Conditions d’utilisation</h2>
                        <p>
                            L’accès au site Ada implique l’acceptation pleine et entière des
                            Conditions Générales d’Utilisation (CGU). Universcience se réserve le
                            droit de modifier à tout moment le contenu du site ainsi que les présentes
                            mentions légales, sans préavis.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
};
export default Legals;
