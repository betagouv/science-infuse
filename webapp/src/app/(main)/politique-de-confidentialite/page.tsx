import { PROJECT_NAME } from "@/config";

const PDC = () => {
    return (
        <div className="w-full fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-6 main-content-item my-24">
                <div className="py-16 flex flex-col gap-4 md:px-0">

                    <header>
                        <h1>Politique de Confidentialité de la Plateforme Ada</h1>
                    </header>

                    <section>
                        <h2>Qui sommes-nous ?</h2>
                        <p>
                            Ada est une plateforme conçue par Universcience, établissement
                            public industriel et commercial regroupant la Cité des sciences et de
                            l'industrie et le Palais de la découverte, pour permettre aux enseignants
                            de sciences du secondaire de créer des supports de cours personnalisés
                            et attractifs.
                        </p>
                        <p>Ada est un projet porté par Universcience.</p>
                        
                        <h2>Responsable du traitement et sous-traitance</h2>
                        <p>La plateforme Ada, sera utilisée selon deux d'accès :</p>

                    <ul>
                      <li>
                        <p>
                          Accès via un connecteur vers votre portail dédié à l'Éducation
                          nationale par une population d'enseignants proposée par et sous la
                          responsabilité (en termes de responsable du traitement) du Ministre en
                          charge de l'éducation nationale. Universcience se verra attribué le
                          statut de sous-traitant (voir annexe 1 CGU).
                        </p>
                      </li>
                    
                      <li>
                        <p>
                          Accès avec votre identifiant et mot de passe Universcience, les
                          accès seront disponibles à d'autres personnels enseignants hors de la
                          responsabilité du ministère de l'éducation nationale, dans ce cas,
                          Universcience sera responsable du traitement (voir CGU).
                        </p>
                      </li>
                    </ul>
                    </section>

                    <section>
                        <h2>Pourquoi traitons-nous des données à caractère personnel ?</h2>
                        <p>
                            Ada dans les deux types d'accès traite des données personnelles pour permettre à
                            ses utilisateurs de bénéficier d'un espace personnel sécurisé, d'accéder à des
                            ressources pédagogiques adaptées, et de personnaliser leurs supports de cours.
                        </p>
                    </section>

                    <section>
                        <h2>Quelles sont les données à caractère personnel que nous traitons ?</h2>
                        <p>Ada collecte les données suivantes hors GAR :</p>
                        <ul>
                            <li>
                                <strong>Données de contact :</strong> Prénom, nom, adresse électronique
                                professionnelle, nom de l'établissement scolaire, académie de
                                rattachement.
                            </li>
                            <li>
                                <strong>Données professionnelles :</strong> Niveaux d'enseignement,
                                matière enseignée.
                            </li>
                            <li>
                                <strong>Données de navigation :</strong> Statistiques d'utilisation
                                via Matomo, sans collecte de données identifiantes (pages vues,
                                sessions, requêtes issues du moteur de recherche...).
                            </li>
                        </ul>
                        <p>
                            Concernant le GAR (Gestionnaire d'accès aux ressources numériques de l'Education nationale
                            et opéré par RENATER), les seules données que nous traitons sont le code
                            établissement et l'identifiant opaque.
                        </p>
                    </section>

                    <section>
                        <h2>
                            Qu'est-ce qui nous autorise à traiter des données à caractère personnel ?
                        </h2>

                        <p>Paragraphe s'appliquant hors GAR</p>

                        <ul>
                            <li>
                                <strong>Données de contact et professionnelles</strong> :
                                <br />
                                L'intérêt légitime d'Universcience (article 6-1 e) du RGPD) à rendre les
                                sciences accessibles à tous et à proposer des services innovants aux
                                enseignants, en particulier pour la création de contenus pédagogiques
                                personnalisés. Ces informations sont importantes pour la création de votre
                                compte et l'accès à la plateforme.
                            </li>
                            <li>
                                <strong>Données de navigation</strong> :
                                <br />
                                L'intérêt légitime d'Universcience à améliorer le service Ada et de mieux
                                répondre aux besoins des utilisateurs.
                            </li>
                            <li>
                                <strong>Acceptation des CGU et statistiques Matomo</strong> :
                                <br />
                                Votre consentement vous sera demandé lors de la création de votre
                                compte pour valider les Conditions Générales d'Utilisation. Ce
                                consentement vous sera également demandé pour chaque modification des
                                CGU. Enfin, votre consentement sera requis pour l'utilisation de Matomo à
                                des fins de statistiques.
                            </li>
                        </ul>

                        <p>Paragraphe s'appliquant au GAR :</p>

                        <ul>
                            <li>
                                <strong>Données de navigation</strong> :
                                <br />
                                L'intérêt légitime d'Universcience à améliorer le service Ada et de mieux
                                répondre aux besoins des utilisateurs.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>
                            Pendant combien de temps conservons-nous vos données à caractère
                            personnel ?
                        </h2>
                        <p>
                            Les données de contact, données professionnelles et de
                            navigation sont conservées pendant deux ans à compter de votre dernière
                            activité sur la plateforme. Les données de navigation anonymisées peuvent être
                            conservées au-delà de cette période pour des analyses internes.
                        </p>
                        <p>
                            Concernant le GAR (Gestionnaire d'accès aux ressources
                            numériques de l'Education nationale et opéré par RENATER), les seules données
                            que nous traitons sont le code établissement et l'identifiant opaque, qui sont
                            supprimés au bout de 12 mois via un processus de purge (voir la DCA en annexe
                            1).
                        </p>
                        <p>
                            Les données d'usage (logs de connexion, adresses IP, code
                            établissement), y compris les données de connexion pour les élèves et les
                            enseignants ont une durée de conservation de 12 mois glissants pour les logs de
                            connexion, et pour l'année scolaire (jusqu'au 15/08 de chaque année) pour les
                            données de navigation enregistrées par le serveur. Les données enregistrées via
                            des cookies ont une durée de conservation limitée à 13 mois au maximum. Ces
                            durées peuvent inclure un processus d'anonymisation sous réserve de
                            justification.
                        </p>
                        <p>
                            Les données de navigation
                            enregistrées (pages consultées et traces des interactions) par le serveur sont
                            conservées pour l'année scolaire (jusqu'au 15 août de chaque année), avec une
                            possibilité de processus d'anonymisation sous réserve de justification.
                        </p>
                        <p>
                            La durée de conservation des
                            données enregistrées via des cookies et outils de traçage (Matomo)
                            est limitée à 13 mois au maximum, avec une possibilité de processus
                            d'anonymisation sous réserve de justification.
                        </p>
                        <p>
                            Les données de personnalisation sont effacées à partir du 15
                            août de chaque année, date de fin de l'année scolaire (avec une période de
                            récupération éventuelle de trois mois).
                        </p>
                        <p>
                            Les données de production ne sont pas ne sont pas stockées
                            sur Ada mais dans l'ENT.
                        </p>
                        <p>
                            Les données de connexion (logs et adresses IP, traces des
                            accès, consultations, créations et modifications de données) sont conservées
                            pour une durée maximale de 12 mois glissants.
                        </p>
                    </section>

                    <section>
                        <h2>Quels sont vos droits ?</h2>
                        <p>
                            Vous disposez des droits suivants concernant vos données à
                            caractère personnel :
                        </p>
                        <ul>
                            <li>Droit d'information et d'accès</li>
                            <li>Droit de rectification</li>
                            <li>Droit d'opposition</li>
                            <li>Droit à l'effacement</li>
                            <li>Droit à la limitation du traitement de vos données</li>
                        </ul>

                        <h3>A qui adresser vos demandes si vous êtes inscrit via le formulaire de l'éducation nationale</h3>
                        <p>
                            Les personnes enseignantes dont les données sont traitées selon l'accès portail disposent
                            d'un droit d'information, d'accès, de rectification des données les concernant,
                            ainsi que d'un droit d'opposition et d'un droit à la limitation du traitement.
                            Vous pouvez accéder aux données vous concernant et exercer les droits d'accès,
                            de rectification et de limitation que vous tenez des articles 15, 16 et 18 du
                            RGPD, à l'adresse suivante : <a href="mailto:dne-gar@education.gouv.fr">dne-gar@education.gouv.fr</a>
                        </p>
                        <p>
                            Pour toute question
                            concernant le traitement de vos données à caractère personnel, vous pouvez
                            également contacter le délégué à la protection des données du Ministère en
                            charge de l'éducation nationale :
                        </p>
                        <ul>
                            <li>À l'adresse électronique suivante : dpd@education.gouv.fr</li>
                            <li>Via le formulaire de saisine en ligne : www.education.gouv.fr/pid33441/nous-contacter.html#RGPD</li>
                            <li>Ou par courrier en vous adressant au Délégué à la protection des données (DPD) du ministère de chargé de l'éducation nationale. 110, rue de Grenelle 75357 Paris Cedex 07</li>
                        </ul>

                        <h3>A qui adresser vos demandes si vous accédez avec vos identifiants et mot de passe ?</h3>
                        <p>
                            Pour toute demande concernant vos données
                            personnelles, vous pouvez contacter Universcience, responsable du traitement de
                            ces données pour la plateforme Ada, aux coordonnées suivantes :
                        </p>

                        <h4>Par voie postale :</h4>
                        <address>
                            Universcience<br />
                            A l'attention du délégué à la protection des données<br />
                            30, avenue Corentin-Cariou<br />
                            75019 Paris
                        </address>

                        <p>
                            Par courriel au DPO Universcience : <a href="mailto:rgpd@universcience.fr">rgpd@universcience.fr</a>
                        </p>

                        <p>
                            Si vous
                            estimez, même après avoir introduit une réclamation auprès du ministère chargé
                            de l'éducation nationale (cas des accès autorisés par l'éducation nationale ou
                            au DPO d'Universcience) que vos droits en matière de protection des données à caractère personnel ne sont pas
                            respectés, vous avez la possibilité d'introduire une réclamation auprès de la
                            Commission nationale de l'informatique et des libertés (CNIL) à l'adresse
                            suivante : 3 Place de Fontenoy – TSA 80715 – 75334 Paris Cedex 07. Dans le
                            cadre de l'exercice de vos droits, vous devez justifier de votre identité par
                            tout moyen. En cas de doute sur votre identité, les services chargés du droit
                            d'accès et le délégué à la protection des données se réservent le droit de vous
                            demander les informations supplémentaires qui leur apparaissent nécessaires, y
                            compris la photocopie d'un titre d'identité portant votre signature. Le responsable de
                            traitement s'engage à vous répondre dans un délai raisonnable qui ne saurait
                            dépasser 1 mois à compter de la réception de votre demande.
                        </p>
                    </section>

                    <section>
                        <h2>Qui peut accéder à vos données ?</h2>
                        <p>
                            Les destinataires des données sont les membres de l’équipe Ada et, si
                            nécessaire, des sous-traitants chargés de l’hébergement des données ou
                            de la maintenance technique, conformément aux garanties de confidentialité
                            et de sécurité requises par la loi.
                        </p>
                    </section>

                    <section>
                        <h2>Qui nous aide à traiter vos données à caractère personnel ?</h2>
                        <p>
                            Les données peuvent être transmises à des sous-traitants situés au sein
                            de l’Union européenne, qui assurent l’hébergement des données.
                        </p>

                        <table className="border-collapse border border-gray-400 [&_td]:p-2 [&_th]:p-2" border={1}>
                            <thead>
                                <tr>
                                    <th>Sous-traitant</th>
                                    <th>Pays destinataire</th>
                                    <th>Traitement réalisé</th>
                                    <th>Garanties</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Mattomo</td>
                                    <td>France</td>
                                    <td>Statistiques des données</td>
                                    <td>
                                        <a href="https://fr.matomo.org/matomo-cloud-dpa/">
                                            https://fr.matomo.org/matomo-cloud-dpa/
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>OVH</td>
                                    <td>France</td>
                                    <td>Hébergement des données</td>
                                    <td>
                                        <a href="https://us.ovhcloud.com/legal/data-processing-agreement/">
                                            https://us.ovhcloud.com/legal/data-processing-agreement/
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <section>
                        <h2>
                            Comment êtes-vous informés des modifications de cette politique de
                            confidentialité ?
                        </h2>
                        <p>
                            Universcience se réserve le droit de modifier cette politique de
                            confidentialité. Toute modification sera notifiée aux utilisateurs par
                            courriel et via la plateforme. Il est recommandé de consulter
                            régulièrement cette politique pour rester informé des éventuelles mises à
                            jour.
                        </p>
                    </section>
                    <section>
                        <h2>Ada utilise-t-elle des cookies ?</h2>
                        <p>
                            Ada utilise Matomo pour analyser l'utilisation de la plateforme et
                            améliorer l'expérience des utilisateurs. Matomo est configuré en "mode
                            exempté", ce qui signifie qu'il respecte les réglementations sur la vie
                            privée et ne nécessite pas de recueil de votre consentement pour la
                            collecte de données de navigation anonymes.
                        </p>

                        <h3>Voici comment Matomo fonctionne en mode exempté sur Ada :</h3>
                        <ul>
                            <li>
                                <strong>Adresses IP anonymisées :</strong> Matomo collecte les adresses
                                IP mais les anonymise, empêchant l'identification des utilisateurs
                                individuels.
                            </li>
                            <li>
                                <strong>Données techniques :</strong> Matomo collecte des informations
                                sur le type d'appareil, le système d'exploitation, le navigateur et la
                                résolution d'écran pour comprendre l'environnement technique des
                                utilisateurs.
                            </li>
                            <li>
                                <strong>Interactions avec les pages :</strong> Matomo suit les pages
                                consultées, les liens cliqués et le temps passé sur chaque page, sans
                                créer de profils d'utilisateurs détaillés.
                            </li>
                            <li>
                                <strong>Termes de recherche :</strong> Matomo enregistre les termes de
                                recherche utilisés dans le moteur de recherche interne de Ada, mais de
                                manière anonymisée. Ces informations permettent de comprendre les
                                besoins des utilisateurs en matière de contenus, sans associer les
                                recherches à des individus spécifiques.
                            </li>
                            <li>
                                <strong>Données de session :</strong> Matomo peut suivre les visites
                                d'un utilisateur au cours d'une même session sans utiliser de
                                cookies, en s'appuyant sur des techniques qui ne permettent pas de
                                relier ces sessions à d'autres visites ou sites web.
                            </li>
                            <li>
                                <strong>Statistiques globales :</strong> Les données collectées par
                                Matomo sont agrégées pour fournir des statistiques anonymes sur
                                l'utilisation globale du site, sans possibilité de les relier à des
                                utilisateurs individuels.
                            </li>
                        </ul>

                        <p>
                            Ada s'engage à respecter votre vie privée et à traiter vos données de
                            navigation de manière responsable et transparente.
                        </p>
                        <p>
                        Vous trouverez ci-dessous les mentions RGPD du GAR :
                        <a href="https://gar.education.fr/mentions-informatives-rgpd">https://gar.education.fr/mentions-informatives-rgpd</a>
                        </p>
                        <p>
                            Pour en savoir plus, vous pouvez consulter les fiches suivantes proposées
                            par la CNIL :
                        </p>

                        <ul>
                            <li>
                                <a href="https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/que-dit-la-loi">
                                    Cookies &amp; traceurs : que dit la loi ?
                                </a>
                            </li>
                            <li>
                                <a href="https://www.cnil.fr/fr/cookies-et-autres-traceurs/comment-se-proteger/maitriser-votre-navigateur">
                                    Cookies : les outils pour les maîtriser
                                </a>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default PDC;