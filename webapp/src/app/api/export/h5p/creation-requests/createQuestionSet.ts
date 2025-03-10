import { Question } from "@/types/course-editor"
import { createH5P } from "."

export default async (questions: Question[], h5pContentId?: string) => {
    const data = {
        "library": "H5P.QuestionSet 1.20",
        "params": {
            "params": {
                "introPage": {
                    "showIntroPage": false,
                    "startButtonText": "Commencer",
                    "introduction": ""
                },
                "progressType": "dots",
                "passPercentage": 50,
                "questions": questions.map(q => ({
                    "params": {
                        "media": {
                            "type": {
                                "params": {}
                            },
                            "disableImageZooming": false
                        },
                        "answers": q.options.map(option => ({
                            "correct": option.correct,
                            "tipsAndFeedback": {
                                "tip": "",
                                "chosenFeedback": "",
                                "notChosenFeedback": ""
                            },
                            "text": `<div>${option.answer}</div>\n`
                        })),
                        "overallFeedback": [
                            {
                                "from": 0,
                                "to": 100
                            }
                        ],
                        "behaviour": {
                            "enableRetry": true,
                            "enableSolutionsButton": true,
                            "enableCheckButton": true,
                            "type": "auto",
                            "singlePoint": false,
                            "randomAnswers": true,
                            "showSolutionsRequiresInput": true,
                            "confirmCheckDialog": false,
                            "confirmRetryDialog": false,
                            "autoCheck": false,
                            "passPercentage": 100,
                            "showScorePoints": true
                        },
                        "UI": {
                            "checkAnswerButton": "Vérifier",
                            "submitAnswerButton": "Envoyer",
                            "showSolutionButton": "Afficher la solution",
                            "tryAgainButton": "Recommencer",
                            "tipsLabel": "Afficher les indices",
                            "scoreBarLabel": "Vous avez obtenu :num sur :total points",
                            "tipAvailable": "Indice disponible",
                            "feedbackAvailable": "Retour disponible",
                            "readFeedback": "Lire le commentaire",
                            "wrongAnswer": "Mauvaise réponse",
                            "correctAnswer": "Bonne réponse",
                            "shouldCheck": "Il fallait cocher ici",
                            "shouldNotCheck": "Il ne fallait pas cocher ici !",
                            "noInput": "Veuillez répondre avant de consulter la solution",
                            "a11yCheck": "Vérifiez les réponses. Les réponses seront marquées comme correctes, incorrectes ou sans réponse.",
                            "a11yShowSolution": "Montrez la solution. La tâche sera marquée avec sa solution correcte.",
                            "a11yRetry": "Réessayer la tâche. Réinitialiser toutes les réponses et recommencer la tâche."
                        },
                        "confirmCheck": {
                            "header": "Terminer ?",
                            "body": "Êtes-vous certain de vouloir terminer ?",
                            "cancelLabel": "Annuler",
                            "confirmLabel": "Terminer"
                        },
                        "confirmRetry": {
                            "header": "Recommencer ?",
                            "body": "Êtes-vous certain de vouloir recommencer ?",
                            "cancelLabel": "Annuler",
                            "confirmLabel": "Confirmer"
                        },
                        "question": `<p>${q.question}</p>\n`
                    },
                    "library": "H5P.MultiChoice 1.16",
                    "metadata": {
                        "contentType": "Choix multiple (Multiple Choice)",
                        "license": "U",
                        "title": "Quiz",
                        "authors": [],
                        "changes": [],
                        "extraTitle": "Quiz"
                    },
                    "subContentId": "803a500c-928a-46c7-acd5-e0d257919400"
                }
                )),
                "disableBackwardsNavigation": false,
                "randomQuestions": false,
                "endGame": {
                    "showResultPage": true,
                    "showSolutionButton": true,
                    "showRetryButton": true,
                    "noResultMessage": "Terminé",
                    "message": "Vos résultats :",
                    "scoreBarLabel": "Vous avez obtenu @finals sur @totals points",
                    "overallFeedback": [
                        {
                            "from": 0,
                            "to": 100
                        }
                    ],
                    "solutionButtonText": "Voir la solution",
                    "retryButtonText": "Recommencer",
                    "finishButtonText": "Terminer",
                    "submitButtonText": "Soumettre",
                    "showAnimations": false,
                    "skippable": false,
                    "skipButtonText": "Passer la vidéo"
                },
                "override": {
                    "checkButton": true
                },
                "texts": {
                    "prevButton": "Retour",
                    "nextButton": "Suivant",
                    "finishButton": "Terminer",
                    "submitButton": "Vérifier",
                    "textualProgress": "Question @current sur @total",
                    "jumpToQuestion": "Question %d sur %total",
                    "questionLabel": "Question",
                    "readSpeakerProgress": "Question @current sur @total",
                    "unansweredText": "Pas de réponse donnée",
                    "answeredText": "Réponse donnée",
                    "currentQuestionText": "Question en cours",
                    "navigationLabel": "Questions"
                }
            },
            "metadata": {
                "defaultLanguage": "fr-FR",
                "license": "U",
                "authors": [],
                "changes": [],
                "extraTitle": "titre qcm",
                "title": "titre qcm"
            }
        }
    }
    return await createH5P(data, h5pContentId)
}
