import prisma from "@/lib/prisma";
import { createH5P } from "."

export interface CrosswordWord {
  answer: string;
  clue: string;
}

export interface MotsCroisesData {
  words: CrosswordWord[];
  documentId: string;
}

export default async (input: MotsCroisesData, h5pContentId?: string) => {
  const document = await prisma.document.findUnique({
    where: {
      id: input.documentId
    },
  });

  if (!document) {
    throw new Error(`Document not found for id: ${input.documentId}`);
  }

  // Transform words to H5P Crossword format
  const h5pWords = input.words.map(word => ({
    fixWord: false,
    orientation: Math.random() > 0.5 ? "across" : "down", // Random orientation
    clue: word.clue,
    answer: word.answer
  }));

  const data = {
    "library": "H5P.Crossword 0.5",
    "params": {
      "params": {
        "words": h5pWords,
        "overallFeedback": [
          {
            "from": 0,
            "to": 100
          }
        ],
        "theme": {
          "backgroundColor": "#173354",
          "gridColor": "#000000",
          "cellBackgroundColor": "#ffffff",
          "cellColor": "#000000",
          "clueIdColor": "#606060",
          "cellBackgroundColorHighlight": "#3e8de8",
          "cellColorHighlight": "#ffffff",
          "clueIdColorHighlight": "#e0e0e0"
        },
        "behaviour": {
          "enableInstantFeedback": false,
          "scoreWords": true,
          "applyPenalties": false,
          "enableRetry": true,
          "enableSolutionsButton": true,
          "keepCorrectAnswers": false
        },
        "l10n": {
          "across": "Horizontal",
          "down": "Vertical",
          "checkAnswer": "Vérifier",
          "submitAnswer": "Soumettre",
          "tryAgain": "Réessayer",
          "showSolution": "Afficher la solution",
          "couldNotGenerateCrossword": "Impossible de générer un jeu de mots croisés avec les mots donnés. Veuillez réessayer avec moins de mots ou des mots qui ont plus de caractères en commun.",
          "couldNotGenerateCrosswordTooFewWords": "Impossible de générer un jeu de mots croisés. Vous avez besoin d'au moins deux mots.",
          "probematicWords": "Certains mots n'ont pas pu être placés. Si vous utilisez des mots fixes, assurez-vous que leur position n'empêche pas le placement d'autres mots. Les mots avec le même alignement ne peuvent pas être placés en se touchant. Mot(s) problématique(s): @words",
          "extraClue": "Indice supplémentaire",
          "closeWindow": "Fermer la fenêtre"
        },
        "a11y": {
          "crosswordGrid": "Grille de mots croisés. Utilisez les touches fléchées pour naviguer et le clavier pour entrer des caractères. Alternativement, utilisez Tab pour naviguer vers taper les réponses dans les champs de style Remplir les blancs au lieu de la grille.",
          "column": "Colonne",
          "row": "Ligne",
          "across": "Horizontal",
          "down": "Vertical",
          "empty": "Vide",
          "resultFor": "Résultat pour : @clue",
          "correct": "Correct",
          "wrong": "Incorrect",
          "point": "point",
          "solutionFor": "Pour @clue la solution est : @solution",
          "extraClueFor": "Ouvrir l'indice supplémentaire pour @clue",
          "letterSevenOfNine": "Lettre @position de @length",
          "lettersWord": "Mot de @length lettres",
          "check": "Vérifiez les caractères. Les réponses seront marquées comme correctes, incorrectes, ou sans réponse.",
          "showSolution": "Montrez la solution. Le jeu de mots croisés sera rempli avec sa solution correcte.",
          "retry": "Réessayer la tâche. Réinitialiser toutes les réponses et recommencer la tâche.",
          "yourResult": "Vous avez obtenu @score sur @total points"
        },
        "taskDescription": ""
      },
      "metadata": {
        "defaultLanguage": "fr",
        "license": "U",
        "authors": [],
        "changes": [],
        "extraTitle": `Mots croisés : ${document.mediaName}`,
        "title": `Mots croisés : ${document.mediaName}`
      }
    }
  };

  return await createH5P(data, h5pContentId);
}