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
                                <strong>SIRET</strong> : 519 587 851 00014
                            </li>
                            <li>
                                <strong>Siège social</strong> : Palais de la découverte Avenue Franklin
                                Delano Roosevelt, 75008 Paris
                            </li>
                            <li>
                                <strong>Adresse postale</strong> : Cité des sciences et de
                                l'industrie 30, avenue Corentin-Cariou, 75019 Paris
                            </li>
                            <li>
                                <strong>Serveur vocal</strong> : 01 40 05 80 00
                            </li>
                            <li>
                                <strong>Directrice de la publication</strong> : <strong>SAMSOEN Delphine</strong>, 
                                Présidente par intérim.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>1. Hébergement</h2>
                        <p>
                            Le site Ada est hébergé par : OVH 2, rue Kellermann 59100
                            Roubaix – France{' '}
                            <a href="https://www.ovh.com/" target="_blank" rel="noopener">
                                https://www.ovh.com
                            </a>
                        </p>
                        <p>
                            <strong>Téléphone</strong> : +33 9 72 10 10 07
                        </p>
                    </section>

                    <section>
                        <h2>2. Protection des données</h2>
                        <p>
                            Vos données sont traitées conformément au RGPD. Pour en savoir
                            plus, consultez la Politique de Confidentialité du site Ada.
                        </p>
                    </section>

                    <section>
                        <h2>3. Conditions d'utilisation</h2>
                        <p>
                            L'accès au site Ada implique l'acceptation pleine et entière des
                            Conditions Générales d'Utilisation (CGU). Universcience se réserve le
                            droit de modifier à tout moment le contenu du site ainsi que les présentes
                            mentions légales, sans préavis.
                        </p>
                        <p>
                            Pour accéder aux mentions légales spécifiques à la ressource GAR, veuillez consulter :{' '}
                            <a href="https://gar.education.fr/mentions-legales/" target="_blank" rel="noopener">
                                https://gar.education.fr/mentions-legales/
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
};
export default Legals;
