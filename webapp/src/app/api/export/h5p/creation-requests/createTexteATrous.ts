import prisma from "@/lib/prisma";
import { createH5P } from "."

export interface TexteATrousQuestion {
  text: string;
  tip?: string;
}

export interface TexteATrousData {
  questions: TexteATrousQuestion[];
  documentId?: string;
}

export default async (input: TexteATrousData, h5pContentId?: string) => {
  let title = ""
  if (input?.documentId) {
    const document = await prisma.document.findUnique({
      where: {
        id: input.documentId
      },
    });
    title = document?.mediaName || "";
  }

  // Transform questions to H5P Blanks format
  // H5P.Blanks expects text with *word* for blanks and optional tips after colon
  const h5pQuestions = input.questions.map(question => {
    let text = question.text;
    if (question.tip) {
      // Extract the first word that was blanked out to add tip
      const blankMatch = text.match(/\*([^*]+)\*/);
      if (blankMatch) {
        const word = blankMatch[1];
        text = text.replace(`*${word}*`, `*${word}:${question.tip}*`);
      }
    }
    return text;
  });

  const data = {
    "library": "H5P.Blanks 1.14",
    "params": {
      "params": {
        "media": {
          "disableImageZooming": false
        },
        "text": `<p>Complétez les phrases suivantes :</p>`,
        "overallFeedback": [
          {
            "from": 0,
            "to": 100
          }
        ],
        "showSolutions": "Afficher la solution",
        "tryAgain": "Réessayer",
        "checkAnswer": "Vérifier",
        "submitAnswer": "Soumettre",
        "notFilledOut": "Veuillez remplir tous les trous pour voir la solution",
        "answerIsCorrect": "':ans' est correct",
        "answerIsWrong": "':ans' est incorrect",
        "answeredCorrectly": "Répondu correctement",
        "answeredIncorrectly": "Répondu incorrectement",
        "solutionLabel": "Réponse correcte :",
        "inputLabel": "Champ de saisie @num sur @total",
        "inputHasTipLabel": "Indice disponible",
        "tipLabel": "Indice",
        "behaviour": {
          "enableRetry": true,
          "enableSolutionsButton": true,
          "enableCheckButton": true,
          "autoCheck": false,
          "caseSensitive": true,
          "showSolutionsRequiresInput": true,
          "separateLines": false,
          "confirmCheckDialog": false,
          "confirmRetryDialog": false,
          "acceptSpellingErrors": false
        },
        "scoreBarLabel": "Vous avez obtenu :num sur :total points",
        "a11yCheck": "Vérifiez les réponses. Les réponses seront marquées comme correctes, incorrectes, ou sans réponse.",
        "a11yShowSolution": "Montrez la solution. La tâche sera marquée avec sa solution correcte.",
        "a11yRetry": "Réessayer la tâche. Réinitialiser toutes les réponses et recommencer la tâche.",
        "a11yCheckingModeHeader": "Mode de vérification",
        "confirmCheck": {
          "header": "Terminer ?",
          "body": "Êtes-vous certain de vouloir terminer ?",
          "cancelLabel": "Annuler",
          "confirmLabel": "Terminer"
        },
        "confirmRetry": {
          "header": "Réessayer ?",
          "body": "Êtes-vous certain de vouloir réessayer ?",
          "cancelLabel": "Annuler",
          "confirmLabel": "Confirmer"
        },
        "questions": h5pQuestions
      },
      "metadata": {
        "defaultLanguage": "fr",
        "license": "U",
        "authors": [],
        "changes": [],
        "extraTitle": `Texte à trous : ${title}`,
        "title": `Texte à trous : ${title}`
      }
    }
  };

  return await createH5P(data, h5pContentId);
}