export default function AccessibilityPage() {
    return (
        <div className="w-full fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-6 main-content-item my-24">
                <div className="py-16 flex flex-col gap-4 md:px-0">
                    <h1>Accessibilité du site ADA</h1>

                    <section>
                        <h2>Une démarche en cours</h2>
                        <p>
                            Le site ADA est actuellement en <strong>version bêta</strong>, en cours de développement.
                            À ce stade, aucun audit de conformité RGAA (Référentiel général d'amélioration de l'accessibilité)
                            n'a encore été réalisé, mais <strong>un audit est prévu prochainement par l'un de nos experts internes</strong>.
                        </p>
                    </section>

                    <section>
                        <h2>Travaux en cours et objectifs</h2>
                        <p>
                            L'accessibilité numérique est une priorité dès la conception du site. Nous progressons de manière itérative
                            vers une mise en conformité avec le RGAA :
                        </p>
                        <ul className="list-disc list-inside">
                            <li>Amélioration continue de l'interface et des contenus ;</li>
                            <li>Intégration progressive des critères d'accessibilité (navigation clavier, contraste, alternatives aux images, etc.) ;</li>
                            <li>Réalisation à venir d'un audit interne basé sur le RGAA.</li>
                        </ul>
                        <p>Une <strong>déclaration d'accessibilité</strong> sera publiée à l'issue de cet audit.</p>
                    </section>

                    <section>
                        <h2>Schéma pluriannuel d'accessibilité</h2>
                        <p>
                            Il vous est possible de consulter notre
                            <a className="text-blue-600" href="https://www.cite-sciences.fr/fr/outils/accessibilite-du-site-internet/schema-pluriannuel-daccessibilite-numerique" target="_blank" rel="noopener noreferrer">
                                schéma pluriannuel d'accessibilité numérique et ses plans d'actions
                            </a>.
                        </p>
                    </section>

                    <section>
                        <h2>Besoin d'aide ?</h2>
                        <p>
                            Si vous avez besoin d'aide pour accéder à des informations, nous vous invitons à nous contacter :
                            <br />
                            📧 <a className="text-blue-600" href="mailto:infocontact@universcience.fr">infocontact@universcience.fr</a>
                        </p>
                    </section>

                    <section>
                        <h2>Voies de recours</h2>
                        <p>
                            Si vous constatez un défaut d'accessibilité vous empêchant d'accéder à un contenu ou à une fonctionnalité du site,
                            après nous en avoir informés et en l'absence de réponse de notre part, vous pouvez contacter le Défenseur des droits.
                        </p>
                        <p>Plusieurs moyens sont à votre disposition :</p>
                        <ul className="list-disc list-inside">
                            <li>un formulaire de réclamation ;</li>
                            <li>la liste du ou des délégués de votre région avec leurs informations de contact directs ;</li>
                            <li>un numéro de téléphone : 09 69 39 00 00 ;</li>
                            <li>
                                une adresse postale (courrier gratuit, sans affranchissement) :<br />
                                <strong>Le Défenseur des droits – Libre réponse 71120 – 75342 Paris CEDEX 07.</strong>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
