import { PROJECT_NAME } from "@/config";

const CGU = () => {
    return (
        <div className="w-full fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-6 main-content-item my-24">
                <div className="py-16 flex flex-col gap-4 md:px-0">
                    <h1>Conditions Générales d'Utilisation (CGU) - Ada</h1>
                    <p>
                        Les présentes conditions générales d’utilisation (dites « CGU ») fixent le
                        cadre juridique de la plateforme Ada (ci-après « la plateforme ») et
                        définissent les conditions d’accès et d’utilisation des services par les
                        Enseignants. Ada est portée par Universcience.
                        <br /> Les présentes conditions générales d'utilisation (CGU) sont donc
                        susceptibles d'être modifiées et mises à jour régulièrement. En utilisant la
                        plateforme, vous reconnaissez et acceptez ce caractère évolutif et vous
                        engagez à consulter régulièrement les présentes CGU pour prendre
                        connaissance des éventuelles modifications.
                    </p>

                    <p>
                        Les contenus de cette plateforme proviennent d’
                        <a href="https://www.universcience.fr/fr/accueil">Universcience</a>, un
                        établissement public industriel et commercial qui regroupe la Cité des
                        sciences et de l'industrie et le Palais de la découverte. Depuis sa création
                        en janvier 2010, Universcience a pour mission de rendre les sciences
                        accessibles et attrayantes, tout en promouvant la culture scientifique et
                        technique. Son objectif principal est d'aider les citoyens de tous âges et
                        de tous niveaux à mieux comprendre le monde, en expliquant clairement les
                        principes scientifiques et les avancées technologiques. Universcience
                        s'engage également à encourager la passion des sciences et des technologies
                        chez les jeunes, en vue de les inciter à entreprendre des carrières
                        scientifiques.
                    </p>

                    <h2>Article 1 – Champ d'application</h2>
                    <ul>
                        <li>Universcience se réserve le droit de modifier les présentes CGU à tout moment afin de refléter les évolutions de la plateforme. La plateforme est destinée aux enseignants de sciences du secondaire.</li>
                        <li>L'utilisation de la plateforme implique l'acceptation des présentes CGU ainsi que de notre <a href="Politique%20de%20Confidentialit%C3%A9.html">Politique de Confidentialité</a>.</li>
                    </ul>

                    <h2>Article 2 – Inscription et accès à la plateforme</h2>
                    <h3>2.1 Inscription</h3>
                    <ul>
                        <li><strong>Modalités d'inscription :</strong>
                            <ul>
                                <li>Accès via un connecteur avec votre portail</li>
                                <li>Accès par identifiant et mot de passe</li>
                            </ul>
                        </li>
                        <li><strong>Informations requises :</strong> prénom, nom, courriel professionnel, mot de passe, académie de rattachement, nom de l’établissement scolaire, niveaux enseignés pour l’année en cours, et la matière enseignée.</li>
                        <li>La collecte de ces données est nécessaire à la création et à la gestion de votre compte utilisateur, ainsi qu'à l'accès aux fonctionnalités de la plateforme.</li>
                        <li>Pour plus d'informations sur les données collectées et les finalités de traitement, veuillez consulter notre <a href="Politique%20de%20Confidentialit%C3%A9.html">Politique de Confidentialité</a>.</li>
                    </ul>

                    <h3>2.2 Authentification</h3>
                    <ul>
                        <li>L’accès aux fonctionnalités de la plateforme (moteur de recherche, module de création de cours, création de vidéos interactives) nécessite une authentification via adresse électronique et mot de passe.</li>
                    </ul>

                    <h3>2.3 Conservation des données des utilisateurs</h3>
                    <ul>
                        <li>Données de contact, professionnelles et de navigation : conservées 2 ans après la dernière activité sur la plateforme. Passé ce délai, les comptes inactifs seront supprimés.</li>
                        <li>Données GAR : code établissement et identifiant opaque supprimés au bout de 12 mois via un processus de purge.</li>
                    </ul>

                    <h2>Article 3 – Objet de la plateforme</h2>
                    <ul>
                        <li>Service destiné aux enseignants de sciences pour créer et personnaliser des cours en combinant leurs propres ressources avec celles d’Universcience.</li>
                        <li>Intégration d’outils d’intelligence artificielle pour proposer des contenus pédagogiques adaptés et automatiser certaines tâches (quiz, vidéos interactives).</li>
                    </ul>

                    <h2>Article 4 – Fonctionnalités</h2>
                    <ul>
                        <li><strong>4.1 Création et personnalisation de cours :</strong> intégration de vidéos, documents, images, jeux éducatifs fournis par Universcience.</li>
                        <li><strong>4.2 Utilisation de l’IA :</strong>
                            <ul>
                                <li>Quiz automatisés basés sur le contenu des chapitres.</li>
                                <li>Génération automatique de quiz et définitions à partir de vidéos.</li>
                            </ul>
                        </li>
                        <li><strong>4.3 Téléchargement et utilisation des contenus :</strong>
                            <ul>
                                <li>Certaines ressources téléchargeables au format compatibles ENT.</li>
                                <li>Vidéos non téléchargeables, consultation via player Ada.</li>
                                <li>Restrictions possibles sur téléchargements de PDF, images et contenus.</li>
                            </ul>
                        </li>
                        <li><strong>4.4 Recherche de contenus :</strong> moteur sémantique avec filtres.</li>
                        <li><strong>4.5 Gestion des contenus externes :</strong> modification des contenus intégrés via liens ou iframes.</li>
                        <li><strong>4.6 Assistance et support :</strong> espace personnel + support via <a href="mailto:ada@universcience.fr">ada@universcience.fr</a>.</li>
                        <li><strong>4.7 Catalogue de cours clé en main :</strong> cours prêts à l’emploi, utilisables ou adaptables.</li>
                        <li><strong>4.8 Edition de cours :</strong> modification des cours clé en main ou création de nouveaux.</li>
                        <li><strong>4.9 Signaler un problème :</strong> bouton sous chaque contenu pour signaler uniquement des droits d’auteur.</li>
                        <li><strong>4.10 Fonctionnalités sans connexion :</strong> accès au catalogue et à la recherche, mais pas de téléchargement et images avec filigrane.</li>
                        <li><strong>4.11 Fonctionnalités des contributeurs :</strong>
                            <ul>
                                <li>Définition de tags et droits (téléchargement, filigrane) pour PDF et images.</li>
                                <li>Renseignement de crédits pour chaque image.</li>
                            </ul>
                        </li>
                    </ul>

                    <h2>Article 5 – Responsabilités</h2>
                    <ul>
                        <li><strong>5.1 Éditeur (Universcience) :</strong>
                            <ul>
                                <li>Responsable mise à disposition et qualité des contenus.</li>
                                <li>Garantie de fiabilité scientifique et support adéquat.</li>
                            </ul>
                        </li>
                        <li><strong>5.2 Gestion des données :</strong> Universcience est responsable du traitement (RGPD).</li>
                        <li><strong>5.3 Utilisateurs :</strong>
                            <ul>
                                <li>Exactitude des informations fournies.</li>
                                <li>Respect des droits de propriété intellectuelle.</li>
                                <li>Responsabilité pédagogique finale malgré l’IA.</li>
                            </ul>
                        </li>
                    </ul>

                    <h2>Article 6 – Propriété intellectuelle</h2>
                    <ul>
                        <li><strong>6.1 Contenu d'Universcience :</strong>
                            <ul>
                                <li>Protégé par le droit d’auteur, reste propriété d’Universcience/partenaires.</li>
                                <li>Autorisation d’usage non exclusive, pédagogique, non commerciale, avec mention des auteurs/sources.</li>
                                <li>Signalement des droits d’auteur via la plateforme (art. 4.9).</li>
                            </ul>
                        </li>
                        <li><strong>6.2 Cours publiés par les utilisateurs :</strong>
                            <ul>
                                <li>Conservation des droits d’auteur par l’utilisateur.</li>
                                <li>Licence non exclusive, gratuite, mondiale et pour la durée légale du droit d’auteur accordée à Universcience pour usage pédagogique et non commercial.</li>
                                <li>Contenu peut alimenter l’algorithme et créer de nouveaux contenus.</li>
                                <li>Garantie de détention des autorisations nécessaires.</li>
                            </ul>
                        </li>
                        <li><strong>6.3 Comité éditorial :</strong>
                            <ul>
                                <li>Validation préalable des cours avant publication.</li>
                                <li>Décision finale d’Universcience.</li>
                                <li>Soumission sans incidence sur la propriété intellectuelle.</li>
                            </ul>
                        </li>
                    </ul>

                    <h2>Article 7 – Confidentialité des données</h2>
                    <ul>
                        <li><strong>Données collectées :</strong>
                            <ul>
                                <li>Données de contact : prénom, nom, adresse électronique professionnelle, nom de l’établissement, académie.</li>
                                <li>Données professionnelles : niveaux d’enseignement, matière.</li>
                                <li>Données de navigation : statistiques anonymes via Matomo.</li>
                            </ul>
                        </li>
                        <li><strong>Finalités :</strong>
                            <ul>
                                <li>Gestion du compte, accès fonctionnalités, communication.</li>
                                <li>Statistiques et amélioration du service.</li>
                            </ul>
                        </li>
                        <li><strong>Base légale :</strong> intérêt légitime d’Universcience (article 6-1 e RGPD).</li>
                        <li>Pour plus d’informations : <a href="Politique%20de%20Confidentialit%C3%A9.html">Politique de Confidentialité</a>.</li>
                    </ul>

                    <h2>Article 8 – Résiliation et désinscription</h2>
                    <ul>
                        <li>Désinscription à tout moment : envoyer un mail à <a href="mailto:ada@universcience.fr">ada@universcience.fr</a>.</li>
                        <li>Contenus publiés restent propriété des auteurs mais continuent d’être utilisés sur la plateforme conformément à l’article 6.</li>
                    </ul>

                    <h2>Article 9 – Contacts</h2>
                    <p>
                        Pour toute question ou demande : <a href="mailto:mailtoada@universcience.fr">ada@universcience.fr</a>
                    </p>

                    <h2>Article 10 – Utilisation de l’Intelligence Artificielle (IA)</h2>
                    <ul>
                        <li><strong>10.1 Finalités :</strong>
                            <ul>
                                <li>Suggérer du contenu pertinent selon le sujet et le niveau.</li>
                                <li>Adapter le niveau de difficulté des exercices et quiz.</li>
                                <li>Générer automatiquement des quiz à partir du cours ou d’une vidéo.</li>
                                <li>Indexer et analyser les contenus pédagogiques.</li>
                                <li>Traduire automatiquement des descriptions d’images.</li>
                                <li>Analyser la structure des documents PDF.</li>
                                <li>Améliorer la recherche sémantique.</li>
                            </ul>
                        </li>
                        <li><strong>10.2 Transparence :</strong> information des enseignants sur l’usage et le traitement de leurs données par l’IA.</li>
                        <li><strong>10.3 Responsabilité pédagogique :</strong> les enseignants restent responsables du contenu final dispensé aux élèves.</li>
                    </ul>

                    <h2>Article 11 – Récupération des données de production</h2>
                    <ul>
                        <li>Export à tout moment des contenus créés vers des formats compatibles ENT : .h5p, .html, .mbz.</li>
                        <li>Garantie de continuité pédagogique hors plateforme Ada.</li>
                    </ul>
                </div>
            </div >
        </div >
    )
}

export default CGU;