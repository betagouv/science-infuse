'use client';

import React from "react"
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import SideMenu from "@codegouvfr/react-dsfr/SideMenu";

const faqData = [
    {
        "category": "Généralités",
        "questions": [
            {
                "question": "Qu'est-ce qu'Ada ?",
                "answer": "Ada (anciennement Science Infuse) est une plateforme éducative qui révolutionne l'enseignement des sciences en proposant une bibliothèque unique de contenus scientifiques multimédias provenant d'Universcience (Cité des sciences et de l'industrie, Palais de la découverte), enrichie par des outils d'Intelligence Artificielle pour les rendre plus ludiques et pédagogiques."
            },
            {
                "question": "À qui s'adresse Ada ?",
                "answer": "Ada s'adresse principalement aux enseignants de sciences et à leurs élèves. La plateforme est conçue pour faciliter la préparation des cours par les enseignants et améliorer l'engagement des élèves dans l'apprentissage des sciences."
            },
            {
                "question": "Ada est-il payant ?",
                "answer": "Non, Ada est entièrement gratuit et accessible à tous sur les Environnements Numériques de Travail (ENT). Cette gratuité s'inscrit dans la démarche d'open content d'Universcience, visant à démocratiser l'accès à des contenus scientifiques de haute qualité."
            },
            {
                "question": "Quelle est la différence entre Science Infuse et Ada ?",
                "answer": "Ada est le nouveau nom de Science Infuse. Cela s'inscrit dans une évolution majeure du service avec l'ajout de nouvelles fonctionnalités basées sur l'Intelligence Artificielle et une bibliothèque de contenus enrichie."
            }
        ]
    },
    {
        "category": "Contenu et fonctionnalités",
        "questions": [
            {
                "question": "Quels types de contenus puis-je trouver sur Ada ?",
                "answer": "Ada propose une variété de contenus scientifiques multimédias d'excellence issus de la Cité des sciences et de l'industrie et du Palais de la découverte : images, vidéos, jeux pédagogiques, PDF et bien d'autres formats. Ces contenus sont élaborés par des experts scientifiques reconnus et validés par les équipes pédagogiques d'Universcience, garantissant une rigueur scientifique irréprochable. Ils couvrent différentes disciplines scientifiques et sont constamment mis à jour pour refléter les avancées scientifiques les plus récentes."
            },
            {
                "question": "Comment fonctionne le moteur de recherche sémantique ?",
                "answer": "Le moteur de recherche sémantique d'Ada vous permet de trouver le contenu parfait en seulement 3 clics. Contrairement à une recherche par mots-clés classique, il comprend le sens de votre requête et identifie les ressources les plus pertinentes, même si elles ne contiennent pas exactement les termes utilisés."
            },
            {
                "question": "Qu'est-ce que le générateur de quiz intelligent ?",
                "answer": "Le générateur de quiz intelligent analyse automatiquement les supports de cours que vous choisissez et génère des questions à choix multiples adaptées. Cela vous permet de créer rapidement des évaluations pour tester la compréhension de vos élèves, tout en captivant leur attention grâce à une approche interactive et ludique. Ces quiz favorisent un apprentissage actif et augmentent significativement l'engagement des élèves dans le processus d'apprentissage."
            },
            {
                "question": "Comment fonctionnent les vidéos interactives augmentées ?",
                "answer": "Les vidéos interactives sont enrichies par l'IA avec des définitions contextuelles, des compléments d'information et des points d'arrêt pédagogiques. Il est également possible d'y insérer des quiz créés automatiquement par l'IA grâce au script de la vidéo. Cette génération basée sur le contenu exact de la vidéo garantit la fiabilité des questions, l'IA n'inventant aucune information. Ces éléments interactifs permettent de maintenir l'attention des élèves plus longtemps (multipliant par 2 le temps moyen d'attention) et d'approfondir leur compréhension des concepts abordés."
            }
        ]
    },
    {
        "category": "Utilisation pratique",
        "questions": [
            {
                "question": "Comment puis-je intégrer les contenus d'Ada à mon ENT ?",
                "answer": "Les contenus multimédias, quiz, vidéos interactives augmentées et cours créés sur Ada sont téléchargeables en formats exportables (h5p) compatibles avec les Environnements Numériques de Travail. Pour toute question sur l'intégration, contactez notre équipe support via le formulaire disponible sur la plateforme."
            },
            {
                "question": "D'où proviennent les cours disponibles dans le catalogue d'Ada ?",
                "answer": "Les cours disponibles dans le catalogue d'Ada ont été conçus par des enseignants de SVT de l'Éducation Nationale, dans le cadre de l'expérimentation menée par Ada (anciennement Science Infuse) en 2024. Ces cours sont libres d'utilisation et d'édition par tous les enseignants. Ils peuvent également servir d'inspiration sur l'utilisation de la bibliothèque de contenus multimédias d'Ada et l'intégration des quiz générés par son IA. Ce partage de ressources entre enseignants constitue l'un des aspects collaboratifs importants de la plateforme."
            },
            {
                "question": "Puis-je personnaliser les contenus proposés par Ada ?",
                "answer": "Oui, Ada vous permet d'adapter les contenus à vos besoins pédagogiques spécifiques. Vous pouvez ajouter vos propres commentaires aux ressources, sélectionner des passages spécifiques des vidéos, et créer des parcours d'apprentissage personnalisés."
            },
            {
                "question": "Comment partager un cours avec mes élèves ?",
                "answer": "Vous pouvez télécharger vos cours au format h5p et les intégrer directement dans votre ENT. Vous pouvez également générer un lien direct depuis Ada que vous pouvez envoyer à vos élèves par email ou tout autre canal de communication."
            }
        ]
    },
    {
        "category": "Aspects techniques et support",
        "questions": [
            {
                "question": "Quels sont les prérequis techniques pour utiliser Ada ?",
                "answer": "Ada est accessible depuis n'importe quel navigateur web récent. Aucune installation logicielle n'est nécessaire. Une connexion internet stable est recommandée pour profiter pleinement des contenus multimédias."
            },
            {
                "question": "Que faire en cas de problème technique ?",
                "answer": "En cas de problème technique, vous pouvez consulter notre guide de dépannage disponible dans la section \"Aide\" de la plateforme. Si le problème persiste, vous pouvez nous contacter par email via la section contact du site."
            },
            {
                "question": "Qu'est-ce qu'Universcience ?",
                "answer": "Universcience est l'établissement public qui regroupe la Cité des sciences et de l'industrie et le Palais de la découverte. Sa mission est de rendre les sciences accessibles à tous et de susciter l'intérêt du public pour les questions scientifiques et techniques. En tant qu'acteur majeur de la culture scientifique en France, Universcience produit des expositions, animations, ateliers et contenus multimédias d'excellence qui constituent le cœur de la bibliothèque de ressources d'Ada. Pour plus d'informations, vous pouvez consulter le site officiel d'Universcience : www.universcience.fr"
            },
            {
                "question": "J'ai des propositions d'amélioration à vous partager, où puis-je les faire ?",
                "answer": "Nous sommes très intéressés par vos retours et suggestions ! Vous pouvez partager vos propositions d'amélioration par email via le site web d'Ada dans la section contact. Chaque suggestion est examinée par notre équipe pour faire évoluer le service et répondre au mieux aux besoins des enseignants et des élèves."
            }
        ]
    },
    {
        "category": "Propriété intellectuelle et confidentialité",
        "questions": [
            {
                "question": "Comment mes données sont-elles protégées sur Ada ?",
                "answer": "Ada respecte pleinement le RGPD et la confidentialité des données des utilisateurs. Nous ne collectons que les données nécessaires au bon fonctionnement du service. Pour plus d'informations, consultez notre politique de confidentialité accessible depuis le pied de page du site."
            },
            {
                "question": "Les contenus créés par les enseignants sont-ils privés ?",
                "answer": "Oui, les cours et contenus créés par les enseignants sont confidentiels et ne sont accessibles qu'aux personnes avec qui ils choisissent de les partager. Ada ne revendique aucun droit sur les contenus que vous créez."
            },
            {
                "question": "Quelles sont les règles d'utilisation des contenus d'Ada concernant la propriété intellectuelle ?",
                "answer": "L'utilisation des contenus multimédias de la bibliothèque d'Ada est libre et gratuite dans le cadre des activités d’enseignement. Cette politique s'inscrit dans la démarche d'open content d'Universcience, qui vise à rendre accessible son patrimoine scientifique à l'ensemble de la communauté éducative."
            },
            {
                "question": "L'IA utilisée par Ada analyse-t-elle le travail des élèves ?",
                "answer": "L'IA d'Ada est principalement utilisée pour enrichir les contenus pédagogiques et générer des quiz. Les données d'utilisation anonymisées peuvent être analysées pour améliorer le service, mais toujours dans le respect strict de la vie privée des utilisateurs et conformément aux réglementations en vigueur."
            }
        ]
    }
]
const FAQ = () => {
    const [activeCategory, setActiveCategory] = React.useState<string | null>(null)

    const menuItems = faqData.map(category => ({
        isActive: activeCategory === category.category,
        linkProps: {
            href: `#${category.category}`,
            onClick: () => setActiveCategory(category.category)
        },
        text: category.category
    }))

    return (
        <div className="flex flex-col md:flex-row">
            <SideMenu
                className="w-fit whitespace-nowrap md:min-w-[25rem] md:sticky md:top-0 h-fit mb-8 md:mb-0"
                align="left"
                sticky={true}
                burgerMenuButtonText="Dans cette rubrique"
                items={menuItems}
            />
            <div className="flex flex-col gap-8 w-full">
                {faqData.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="faq-category" id={category.category}>
                        <h3>{category.category}</h3>
                        <div className="fr-accordions-group">
                            {category.questions.map((item, itemIndex) => (
                                <Accordion
                                    key={`${categoryIndex}-${itemIndex}`}
                                    label={item.question}
                                >
                                    {item.answer}
                                </Accordion>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FAQ;