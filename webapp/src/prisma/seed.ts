import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const createThemes = async () => {
  const themes = ["La planète Terre, l'environnement et l'action humaine", "Le vivant et son évolution", "Le corps humain et la santé"]
  await prisma.theme.createMany({
    data: themes.map(title => ({ title })),
    skipDuplicates: true,
  })
}

const createFileTypes = async () => {
  const types = ["image", "activité"]
  await prisma.fileType.createMany({
    data: types.map(name => ({ name })),
    skipDuplicates: true,
  })
}

const createEducationLevels = async () => {
  const EducationLevels = ["6e", "5e", "4e", "3e"]//, "2nde", "1ere", "Terminale"]
  await prisma.educationLevel.createMany({
    data: EducationLevels.map(name => ({ name })),
    skipDuplicates: true,
  })
}

const createAcademies = async () => {
  const academies = ["Aix-Marseille", "Autres", "Besançon", "Créteil", "Grenoble", "Guyane", "La Réunion", "Limoges", "Martinique", "Montpellier", "Nantes", "Orléans-Tours", "Paris", "Poitiers", "Rennes", "Toulouse", "Versailles"]
  await prisma.academy.createMany({
    data: academies.map(academy => ({ name: academy })),
    skipDuplicates: true,
  })
}

const createSchoolSubjects = async () => {
  const subjects = ["Sciences de la Vie et de la Terre", "Autre"]//,"Mathématiques", "Français", "Histoire-Géographie", "Sciences", "Anglais", "Arts Plastiques", "Éducation Physique", "Musique", "Technologie", "Philosophie", "Sciences Économiques", "Langues Vivantes", "Latin-Grec", "Physique-Chimie"]

  await prisma.schoolSubject.createMany({
    data: subjects.map(subject => ({ name: subject })),
    skipDuplicates: true,
  })
}

const createSkills = async () => {
  const skills = [
    "utiliser des outils numériques (SVT cycle 4)",
    "concevoir, créer, réaliser (SVT cycle 4)",
    "pratiquer des langages (SVT cycle 4)",
    "adopter un comportement éthique et responsable (SVT cycle 4)",
    "utiliser des outils et mobiliser des méthodes pour apprendre (cycle 4)",
    "mobiliser des outils numériques (cycle 3)",
    "pratiquer des langages (sciences et technologie cycle 3)",
    "concevoir, créer, réaliser (cycle 3)",
    "adopter un comportement éthique et responsable (cycle 3)",
    "coopérer et collaborer dans le cadre de démarches de projet",
    "pratiquer des démarches scientifiques et technologiques (cycle 3)",
    "s'approprier des outils et des méthodes (cycle 3)",
    "se situer dans l'espace et dans le temps (SVT cycle 4)",
    "utiliser des outils numériques (SVT)",
    "apprendre à organiser son travail (SVT)",
    "pratiquer des démarches scientifiques (SVT cycle 4)",
    "utiliser des logiciels d'acquisition, de simulation et de traitement de données (SVT 2de GT)",
    "collecte et traitement de l'information",
    "comprendre et s'exprimer à l'oral (cycle 3)",
    "adopter un comportement responsable par rapport à soi et à autrui (EMC cycle2)",
    "collecter l'information (EMC cycle 3)",
    "communiquer dans un langage scientifiquement approprié",
    "communiquer sur ses démarches, ses résultats et ses choix, en argumentant",
    "comprendre les responsabilités individuelle et collective en matière de préservation des ressources de la planète et de santé",
    "comprendre qu'un effet peut avoir plusieurs causes",
    "concevoir, créer, réaliser ( SVT, terminale générale)",
    "développer esprit critique et raisonnement scientifique",
    "développer le discernement éthique (EMC cycle 3)",
    "exercer sa capacité à choisir de manière responsable (EMC cycle 3)",
    "fonder ses choix de comportement responsable vis-à-vis de sa santé ou de l'environnement en prenant en compte des arguments scientifiques",
    "formuler et résoudre une question ou un problème scientifique",
    "identifier et choisir des notions, des outils et des techniques, ou des modèles simples pour mettre en œuvre une démarche scientifique",
    "interpréter un résultat, en tirer une conclusion",
    "lire et comprendre (LVER cycle 3)",
    "lire et comprendre (LVER cycle 4)",
    "pratiquer des langages (SVT, terminale générale)",
    "raisonner, pratiquer une démarche scientifique, expérimenter",
    "utiliser des outils et mobiliser des méthodes pour apprendre (SVT, terminale générale)",
    "écrire (LVER cycle 4)",
    "éducation aux médias et à l'usage des technologies du numérique (EMC cycle 3)"
  ]
  await prisma.skill.createMany({
    data: skills.map(title => ({ title })),
    skipDuplicates: true,
  })
}

const createKeyIdeas = async () => {
  const keyIdeas = [
    "Mettre en relation les mouvements des plaques de lithosphère sur l’asthénosphère, également solide mais moins rigide avec séismes et éruptions volcaniques.",
    "Associer faille, séisme et mouvements de blocs rocheux et expliquer qu’ils témoignent de l’accumulation de tensions liées au mouvement des plaques lithosphériques.",
    "Associer le volcanisme, essentiellement explosif, aux zones de convergence lithosphérique (fosses océaniques) et le volcanisme, essentiellement effusif, aux zones de divergence (dorsales océaniques).",
    "Relier la tectonique des plaques à la dissipation de l’énergie thermique d’origine interne.",
    "Distinguer ce qui relève d’un phénomène météorologique et ce qui relève d’un phénomène climatique.",
    "Expliquer à l’échelle globale que les mouvements des masses d’air et des masses d’eau à l’origine des phénomènes météorologiques, et les grandes zones climatiques, sont en relation avec l’inégale distribution du rayonnement solaire à la surface de la planète.",
    "Identifier le couplage entre les mouvements des masses d’air (vents) et des masses d’eau (courants océaniques) et ses effets sur les climats.",
    "Repérer au moins un changement climatique passé (temps géologique) et ses origines possibles.",
    "Expliquer le réchauffement climatique actuel (influence des activités humaines sur le climat) et en envisager les effets à long terme.",
    "Mettre en relation un phénomène naturel (aléa) avec les enjeux présents sur une zone géographique déterminée, leur vulnérabilité et ainsi identifier et caractériser un risque.",
    "Identifier des mesures de prévention, de protection, d’adaptation ou d’atténuation en relation avec un risque.",
    "Expliquer ces mesures et argumenter des choix de comportements individuel et collectif responsables en matière de risque naturel.",
    "Expliquer ce que la Terre a de spécifique et ce qu’elle partage avec différents objets du système solaire.",
    "Expliquer le rôle majeur du Soleil sur certaines des caractéristiques des planètes telluriques et gazeuses.",
    "Articuler la notion d’ères géologiques avec différents évènements géologiques et biologiques survenus sur Terre.",
    "Caractériser quelques grands enjeux (aux niveaux régional et mondial) de l’exploitation de ressources naturelles renouvelables et non renouvelables en lien avec les besoins en nourriture et les activités humaines.",
    "Relier la formation de ressources naturelles et différentes manifestations de l’activité du globe.",
    "Relier l’exploitation des ressources naturelles (gisement- gestion-renouvellement ou pas) et ses impacts à différentes échelles.",
    "Relier la vitesse de la production de biomasse et/ou de la formation des gisements à leur exploitation raisonnée.",
    "Expliquer les conflits d’usage ou d’exploitation pour quelques exemples de ressources naturelles.",
    "Identifier et caractériser des modifications, au cours du temps, de l’organisation et du fonctionnement de quelques écosystèmes en lien avec certaines actions humaines.",
    "Mettre en relation certaines activités humaines avec la biodiversité des écosystèmes et leurs dynamiques.",
    "Évaluer quelques effets des activités humaines en termes de bénéfices-risques pour les écosystèmes et pour les êtres humains.",
    "Relier le fonctionnement des écosystèmes au cours du temps à des mesures de d’atténuation, de prévention ou de réhabilitation.",
    "Expliquer ces mesures et argumenter des choix de comportements individuel et collectif responsables en matière de protection environnementale.",
    "Expliquer la transformation des aliments en nutriments lors de la digestion, sous l’action d’enzymes et le passage des nutriments vers le milieu intérieur.",
    "Relier des systèmes digestifs à des régimes alimentaires (phytophages ; zoophages).",
    "Expliquer que les cellules animales utilisent de la matière organique et de la matière minérale pour produire leur propre matière organique.",
    "Relier le passage du dioxygène des milieux de vie au niveau des appareils respiratoires aux caractéristiques des surfaces d’échanges.",
    "Relier les systèmes de transport (appareil circulatoire endigué ou non ; milieu intérieur) aux lieux d’utilisation et de stockage des nutriments (besoins des cellules ; tissus de stockage).",
    "Relier les systèmes de transport et l’élimination des déchets produits au cours du fonctionnement cellulaire.",
    "Relier la présence de micro-organismes dans le tube digestif à certaines caractéristiques de la digestion.",
    "Expliquer l’approvisionnement des cellules chlorophylliennes en eau, en sels minéraux et en dioxyde de carbone, pour satisfaire ses besoins nutritifs, en reliant les lieux de prélèvement et les systèmes de transport dans le végétal (circulation de la sève brute dans des vaisseaux conducteurs).",
    "Relier la production de matière organique au niveau des cellules chlorophylliennes des feuilles à l’utilisation de lumière et de matière minérale (photosynthèse) et les lieux d’utilisation et de stockage (circulation de la sève élaborée dans des vaisseaux conducteurs).",
    "Relier l’énergie nécessaire au fonctionnement des cellules animale et végétale à l’utilisation de dioxygène et de glucose.",
    "Expliquer que la nutrition minérale implique la symbiose avec des micro-organismes du sol.",
    "Identifier des caractères propres à une espèce et distinguer un caractère des formes variables qu’il peut prendre chez les individus d’une même espèce : génotype et phénotype ; influence de l’environnement sur le phénotype.",
    "Expliquer que toutes les cellules d’un individu (à l’exception des gamètes) possèdent le même nombre de chromosomes par noyau à l’issue de la mitose.",
    "Relier l’ADN des chromosomes au support de l’information génétique.",
    "Relier l’apparition de nouveaux allèles à l’existence de mutations.",
    "Expliquer la diversité et l’héritabilité de caractères par le brassage de l’information génétique associé à la méiose et à la fécondation.",
    "Repérer et relier la biodiversité aux différentes échelles du vivant (écosystème, espèces et allèles).",
    "Mettre en relation les modifications de la biodiversité au cours des temps géologiques avec des faits montrant l’évolution des groupes d’êtres vivants (apparition, disparition, diversification et raréfaction).",
    "Exploiter les traces fossiles permettant d’identifier les premiers organismes sur Terre.",
    "Expliquer l’évolution des espèces par des processus de sélection naturelle en mettant en relation les caractéristiques phénotypiques d’organismes issus du hasard de la reproduction avec des conditions qui les rendent plus aptes à se reproduire.",
    "Argumenter le degré de parenté entre des organismes actuels et/ou fossiles à partir des caractères partagés.",
    "Argumenter l’histoire évolutive de grands groupes d’êtres vivants, dont Homo sapiens, en exploitant différents faits (caractères des espèces actuelles et fossiles ; liens de parenté entre espèces actuelles et/ou fossiles ; données sur les paléo milieux de vie).",
    "Relier certaines modalités de la reproduction sexuée (oviparité/viviparité ; fécondation externe/interne ; reproduction des plantes à fleurs) aux pressions exercées par les milieux.",
    "Expliquer la stabilité et la diversité des phénotypes des individus d’une population par les mécanismes de la reproduction sexuée (production de gamètes apportant la moitié du patrimoine génétique de l’espèce et fécondation).",
    "Identifier des modes de reproduction asexuée.",
    "Relier la reproduction asexuée à une stabilité des phénotypes entre générations.",
    "Relier les modes de reproduction (sexuée et asexuée), les conditions du milieu (rareté ou abondance des ressources alimentaires, des prédateurs, des conditions physicochimiques, etc.) à la dynamique des populations.",
  ]
  await prisma.keyIdea.createMany({
    data: keyIdeas.map(title => ({ title })),
    skipDuplicates: true,
  })
}

const createDocumentTag = async () => {
  const documentTags = [
    { title: "REVUE_DECOUVERTE", description: "Revue decouverte pdf" },
    { title: "INTERACTIF", description: "Contenu interactif" },
  ]
  await prisma.documentTag.createMany({
    data: documentTags,
    skipDuplicates: true,
  })
}


async function main() {
  await createThemes();
  await createEducationLevels();
  await createSkills();
  await createKeyIdeas();
  await createFileTypes();
  await createAcademies();
  await createSchoolSubjects();
  await createDocumentTag();
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })