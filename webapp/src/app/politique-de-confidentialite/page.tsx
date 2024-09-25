const PDC = () => {
    return (
        <div className="w-full fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-6 main-content-item my-24">
                <div className="py-16 flex flex-col gap-4 md:px-0">


                    <h1>Politique de Confidentialité de la Plateforme Science Infuse</h1>

                    <h2>Qui sommes-nous ?</h2>
                    <p>Science Infuse est une plateforme conçue par Universcience, établissement public regroupant la Cité des sciences et de l'industrie et le Palais de la découverte, pour permettre aux enseignants de sciences du secondaire de créer des supports de cours personnalisés et attractifs.</p>
                    <p>Science Infuse est portée par Universcience en partenariat avec le ministère de la Culture.</p>

                    <h2>Pourquoi traitons-nous des données à caractère personnel ?</h2>
                    <p>Science Infuse traite des données personnelles pour permettre aux enseignants de bénéficier d’un espace personnel sécurisé, d’accéder à des ressources pédagogiques adaptées, et de personnaliser leurs supports de cours.</p>

                    <h2>Quelles sont les données à caractère personnel que nous traitons ?</h2>
                    <p>Science Infuse collecte les données suivantes :</p>
                    <ul>
                        <li>Données de contact : Prénom, nom, adresse électronique professionnelle, nom de l’établissement scolaire, académie de rattachement.</li>
                        <li>Données professionnelles : Niveaux d’enseignement, matière enseignée.</li>
                        <li>Données de navigation : Statistiques d’utilisation via Matomo, sans collecte de données identifiantes (pages vues, sessions, requêtes issues du moteur de recherche,...).</li>
                    </ul>

                    <h2>Qu’est-ce qui nous autorise à traiter des données à caractère personnel ?</h2>
                    <p><strong>Données de contact et professionnelles :</strong> L'intérêt légitime d'Universcience (article 6-1 e) du RGPD à rendre les sciences accessibles à tous et à proposer des services innovants aux enseignants, en particulier pour la création de contenus pédagogiques personnalisés. Ces informations sont importantes pour la création de votre compte et l'accès à la plateforme.</p>
                    <p><strong>Données de navigation :</strong> L'intérêt légitime d'Universcience à améliorer le service Science Infuse et de mieux répondre aux besoins des utilisateurs.</p>
                    <p><strong>Acceptation des CGU et statistiques Matomo :</strong> Votre consentement vous sera demandé lors de la création de votre compte pour valider les Conditions Générales d'Utilisation. Ce consentement vous sera également demandé pour chaque modification des CGU. Enfin, votre consentement sera requis pour l'utilisation de Matomo à des fins de statistiques.</p>

                    <h2>Pendant combien de temps conservons-nous vos données à caractère personnel ?</h2>
                    <p>Les données de contact, données professionnelles et de navigation sont conservées pendant deux ans à compter de votre dernière activité sur la plateforme. Les données de navigation anonymisées peuvent être conservées au-delà de cette période pour des analyses internes.</p>

                    <h2>Quels sont vos droits ?</h2>
                    <ul>
                        <li>Droit d’information et d’accès</li>
                        <li>Droit de rectification</li>
                        <li>Droit d’opposition</li>
                        <li>Droit à l’effacement</li>
                        <li>Droit à la limitation du traitement de vos données</li>
                    </ul>

                    <h2>À qui adresser vos demandes ?</h2>
                    <p>Pour toute demande concernant vos données personnelles, vous pouvez contacter le ministère de la Culture, responsable du traitement de ces données pour la plateforme Science Infuse, aux coordonnées suivantes :</p>
                    <p><strong>Par voie postale :</strong></p>
                    <p>Ministère de la Culture<br />À l’attention du délégué à la protection des données (DPD)<br />182 rue Saint-Honoré<br />75001 Paris, France</p>
                    <p><strong>Par courriel :</strong> <a href="mailto:delegue-protection-donnees@culture.gouv.fr">delegue-protection-donnees@culture.gouv.fr</a></p>
                    <p><strong>Important :</strong> Pour des raisons de sécurité et de confidentialité, il est impératif de joindre une preuve de votre identité à votre demande. Cette mesure permet de garantir que seules les personnes autorisées puissent accéder à ces informations sensibles.</p>
                    <p>Pour vous accompagner dans vos démarches, vous pouvez consulter la fiche CNIL <em>Exercer son droit d’accès</em> et un modèle de courrier élaboré par la CNIL.</p>
                    <p>Le responsable de traitement s’engage à vous répondre dans un délai raisonnable qui ne saurait dépasser 1 mois à compter de la réception de votre demande.</p>

                    <h2>Qui peut accéder à vos données ?</h2>
                    <p>Les destinataires des données sont les membres de l’équipe Science Infuse et, si nécessaire, des sous-traitants chargés de l’hébergement des données ou de la maintenance technique, conformément aux garanties de confidentialité et de sécurité requises par la loi.</p>

                    <h2>Qui nous aide à traiter vos données à caractère personnel ?</h2>
                    <p>Les données peuvent être transmises à des sous-traitants situés au sein de l’Union européenne, qui assurent l’hébergement des données.</p>
                    <table className="border-collapse w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2 text-left">Sous-traitant</th>
                                <th className="border p-2 text-left">Pays destinataire</th>
                                <th className="border p-2 text-left">Traitement réalisé</th>
                                <th className="border p-2 text-left">Garanties</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="hover:bg-gray-50">
                                <td className="border p-2">Mattomo</td>
                                <td className="border p-2">France</td>
                                <td className="border p-2">Statistiques des données</td>
                                <td className="border p-2"><a href="https://fr.matomo.org/matomo-cloud-dpa/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://fr.matomo.org/matomo-cloud-dpa/</a></td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border p-2">OVH</td>
                                <td className="border p-2">France</td>
                                <td className="border p-2">Hébergement des données</td>
                                <td className="border p-2"><a href="https://us.ovhcloud.com/legal/data-processing-agreement/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://us.ovhcloud.com/legal/data-processing-agreement/</a></td>
                            </tr>
                        </tbody>
                    </table>

                    <h2>Comment êtes-vous informés des modifications de cette politique de confidentialité ?</h2>
                    <p>Universcience se réserve le droit de modifier cette politique de confidentialité. Toute modification sera notifiée aux utilisateurs par courriel et via la plateforme. Il est recommandé de consulter régulièrement cette politique pour rester informé des éventuelles mises à jour.</p>

                    <h2>Science Infuse utilise-t-il des cookies ?</h2>
                    <p>Science Infuse utilise Matomo pour analyser l'utilisation de la plateforme et améliorer l'expérience des utilisateurs. Matomo est configuré en "mode exempté", ce qui signifie qu'il respecte les réglementations sur la vie privée et ne nécessite pas de recueil de votre consentement pour la collecte de données de navigation anonymes.</p>

                    <h3>Voici comment Matomo fonctionne en mode exempté sur Science Infuse :</h3>
                    <ul>
                        <li><strong>Adresses IP anonymisées :</strong> Matomo collecte les adresses IP mais les anonymise, empêchant l'identification des utilisateurs individuels.</li>
                        <li><strong>Données techniques :</strong> Matomo collecte des informations sur le type d'appareil, le système d'exploitation, le navigateur et la résolution d'écran pour comprendre l'environnement technique des utilisateurs.</li>
                        <li><strong>Interactions avec les pages :</strong> Matomo suit les pages consultées, les liens cliqués et le temps passé sur chaque page, sans créer de profils d'utilisateurs détaillés.</li>
                        <li><strong>Termes de recherche :</strong> Matomo enregistre les termes de recherche utilisés dans le moteur de recherche interne de Science Infuse, mais de manière anonymisée. Ces informations permettent de comprendre les besoins des utilisateurs en matière de contenus, sans associer les recherches à des individus spécifiques.</li>
                        <li><strong>Données de session :</strong> Matomo peut suivre les visites d'un utilisateur au cours d'une même session sans utiliser de cookies, en s'appuyant sur des techniques qui ne permettent pas de relier ces sessions à d'autres visites ou sites web.</li>
                        <li><strong>Statistiques globales :</strong> Les données collectées par Matomo sont agrégées pour fournir des statistiques anonymes sur l'utilisation globale du site, sans possibilité de les relier à des utilisateurs individuels.</li>
                    </ul>
                    <p>Science Infuse s'engage à respecter votre vie privée et à traiter vos données de navigation de manière responsable et transparente.</p>
                    <p>Pour en savoir plus, vous pouvez consulter les fiches suivantes proposées par la CNIL :</p>
                    <ul>
                        <li><a href="https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/que-dit-la-loi" >Cookies & traceurs : que dit la loi ?</a></li>
                        <li><a href="https://www.cnil.fr/fr/cookies-et-autres-traceurs/comment-se-proteger/maitriser-votre-navigateur" >Cookies : les outils pour les maîtriser</a></li>
                    </ul>


                </div >
            </div>
        </div>
    )
}

export default PDC;