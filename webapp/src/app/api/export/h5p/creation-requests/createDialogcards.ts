import prisma from "@/lib/prisma";
import { createH5P } from "."
import { Dialogcard } from "@/app/(main)/intelligence-artificielle/dialogcards/DialogcardEditor";

export interface DialogcardsData {
  cards: Dialogcard[];
  documentId: string;
}

export default async (input: DialogcardsData, h5pContentId?: string) => {
  const document = await prisma.document.findUnique({
    where: {
      id: input.documentId
    },
  });

  if (!document) {
    throw new Error(`Document not found for id: ${input.documentId}`);
  }

  const h5pDialogs = input.cards.map(card => ({
    text: `<p style="text-align:center;">${card.question}</p>`,
    answer: `<p style="text-align:center;">${card.answer}</p>`,
    tips: {}
  }));

  const data = {
    "library": "H5P.Dialogcards 1.9",
    "params": {
      "params": {
        "mode": "normal",
        "dialogs": h5pDialogs,
        "behaviour": {
          "enableRetry": true,
          "disableBackwardsNavigation": false,
          "scaleTextNotCard": false,
          "randomCards": false,
          "maxProficiency": 5,
          "quickProgression": false
        },
        "answer": "Afficher la réponse",
        "next": "Suivant",
        "prev": "Précédent",
        "retry": "Réessayer",
        "correctAnswer": "Je l'ai bien fait !",
        "incorrectAnswer": "Je me suis trompé",
        "round": "Tour @round",
        "cardsLeft": "Cartes restantes : @number",
        "nextRound": "Passer au tour @round",
        "startOver": "Recommencer",
        "showSummary": "Suivant",
        "summary": "Résumé",
        "summaryCardsRight": "Cartes correctes :",
        "summaryCardsWrong": "Cartes incorrectes :",
        "summaryCardsNotShown": "Cartes non affichées :",
        "summaryOverallScore": "Score global",
        "summaryCardsCompleted": "Cartes maîtrisées :",
        "summaryCompletedRounds": "Tours complétés :",
        "summaryAllDone": "Bravo ! Vous avez maîtrisé les @cards cartes en les réussissant @max fois !",
        "progressText": "Carte @card sur @total",
        "cardFrontLabel": "Recto de la carte",
        "cardBackLabel": "Verso de la carte",
        "tipButtonLabel": "Afficher l'indice",
        "audioNotSupported": "Votre navigateur ne prend pas en charge cet audio",
        "confirmStartingOver": {
          "header": "Recommencer ?",
          "body": "Toute la progression sera perdue. Êtes-vous sûr de vouloir recommencer ?",
          "cancelLabel": "Annuler",
          "confirmLabel": "Recommencer"
        },
        // "title": `<p>${document.mediaName || "Dialogcards"}</p>`,
        // "description": `<p>Dialogcards sur ${document.mediaName || "le document"}</p>`
      },
      "metadata": {
        "defaultLanguage": "fr",
        "license": "U",
        "authors": [],
        "changes": [],
        "extraTitle": `Dialogcards : ${document.mediaName}`,
        "title": `Dialogcards : ${document.mediaName}`
      }
    }
  };

  return await createH5P(data, h5pContentId);
}