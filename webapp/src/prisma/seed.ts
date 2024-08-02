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
  const educationLevels = ["6e", "5e", "4e", "3e", "2nde", "1ere", "Terminale"]
  await prisma.educationalLevel.createMany({
    data: educationLevels.map(name => ({ name })),
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

async function main() {
  await createThemes();
  await createEducationLevels();
  await createSkills();
  await createFileTypes();
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })