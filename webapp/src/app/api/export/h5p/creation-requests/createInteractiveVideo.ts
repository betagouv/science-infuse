import { createH5P } from "."
import { InteractiveVideoData } from "../contents/interactiveVideo"

export default async (input: InteractiveVideoData) => {

    const data = {
        "library": "H5P.InteractiveVideo 1.27",
        "params": {
            "params": {
                "interactiveVideo": {
                    "video": {
                        "startScreenOptions": {
                            "title": input.videoTitle,
                            "hideStartTitle": false
                        },
                        "textTracks": {},
                        "files": [
                            {
                                "path": input.videoPublicUrl,
                                "mime": "video/unknown",
                                "copyright": {
                                    "license": "U"
                                },
                                "aspectRatio": "16:9"
                            }
                        ]
                    },
                    "assets": {
                        "interactions": input.questions.flatMap(q => q).map(question => {
                            // ------------
                            return {
                                "x": 46.899608660939826,
                                "y": 46.52921162067061,
                                "width": 10,
                                "height": 10,
                                "duration": {
                                    "from": question.timestamp,
                                    "to": question.timestamp + 5
                                },
                                "libraryTitle": "Choix multiple (Multiple Choice)",
                                "action": {
                                    "library": "H5P.MultiChoice 1.16",
                                    "params": {
                                        "media": {
                                            "type": {
                                                "params": {}
                                            },
                                            "disableImageZooming": false
                                        },
                                        "answers": question.questions[0].answers.map(answer => ({
                                            "correct": answer.correct,
                                            "tipsAndFeedback": {
                                                "tip": "",
                                                "chosenFeedback": "",
                                                "notChosenFeedback": ""
                                            },
                                            "text": `<div>${answer.answer}</div>\n`

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
                                            "scoreBarLabel": "You got :num out of :total points",
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
                                        "question": `<p>${question.questions[0].question}</p>\n`
                                    },
                                    "subContentId": "31d8a6d7-b826-4760-b892-5ae10c28f6f0",
                                    "metadata": {
                                        "contentType": "Choix multiple (Multiple Choice)",
                                        "license": "U",
                                        "title": question.questions[0].question,
                                        "authors": [],
                                        "changes": [],
                                        "extraTitle": question.questions[0].question
                                    }
                                },
                                "pause": true,
                                "displayType": "button",
                                "buttonOnMobile": false,
                                "adaptivity": {
                                    "correct": {
                                        "allowOptOut": false,
                                        "message": ""
                                    },
                                    "wrong": {
                                        "allowOptOut": false,
                                        "message": ""
                                    },
                                    "requireCompletion": false
                                },
                                "label": ""
                            }
                            // ------------
                        }),


                        "bookmarks": [],
                        // "endscreens": [
                        //     {
                        //         "time": 393,
                        //         "label": "6:33 Écran de soumission"
                        //     }
                        // ]
                    },
                    // "summary": {
                    //     "task": {
                    //         "library": "H5P.Summary 1.10",
                    //         "params": {
                    //             "intro": "Choisissez l'affirmation exacte.",
                    //             "summaries": [
                    //                 {
                    //                     "subContentId": "f9e7c52a-797a-44aa-953b-ac6de6b58790",
                    //                     "summary": [
                    //                         "<p>A retenir : affirmation 1</p>\n",
                    //                         "<p>A retenir : affirmation 2</p>\n"
                    //                     ],
                    //                     "tip": ""
                    //                 }
                    //             ],
                    //             "overallFeedback": [
                    //                 {
                    //                     "from": 0,
                    //                     "to": 100
                    //                 }
                    //             ],
                    //             "solvedLabel": "Progression :",
                    //             "scoreLabel": "Erreurs :",
                    //             "resultLabel": "Votre résultat :",
                    //             "labelCorrect": "Correct.",
                    //             "labelIncorrect": "Incorrect! Please try again.",
                    //             "alternativeIncorrectLabel": "Incorrect",
                    //             "labelCorrectAnswers": "Réponses correctes.",
                    //             "tipButtonLabel": "Montrer l'indice",
                    //             "scoreBarLabel": "Vous avez :num points sur un total de :total",
                    //             "progressText": "Progression de :num sur :total"
                    //         },
                    //         "subContentId": "ead98d95-61f1-4230-9e9d-558b90b480a2",
                    //         "metadata": {
                    //             "contentType": "Résumé (Summary)",
                    //             "license": "U",
                    //             "title": "Sans titre Résumé (Summary)",
                    //             "authors": [],
                    //             "changes": [],
                    //             "extraTitle": "Sans titre Résumé (Summary)"
                    //         }
                    //     },
                    //     "displayAt": 3
                    // }
                },
                "override": {
                    "autoplay": false,
                    "loop": false,
                    "showBookmarksmenuOnLoad": false,
                    "showRewind10": false,
                    "preventSkippingMode": "none",
                    "deactivateSound": false
                },
                "l10n": {
                    "interaction": "Activité",
                    "play": "Jouer",
                    "pause": "Pause",
                    "mute": "Sourdine, présentement le son est activé.",
                    "unmute": "Activer le son, présentement en sourdine.",
                    "quality": "Qualité de la vidéo",
                    "captions": "Sous-titres",
                    "close": "Fermer",
                    "fullscreen": "Plein écran",
                    "exitFullscreen": "Sortir du plein écran",
                    "summary": "Résumé",
                    "bookmarks": "Signets",
                    "endscreen": "Continuer",
                    "defaultAdaptivitySeekLabel": "Continue",
                    "continueWithVideo": "Reprendre la lecture",
                    "more": "More player options",
                    "playbackRate": "Vitesse de lecture",
                    "rewind10": "Revenir en arrière de 10 secondes",
                    "navDisabled": "La navigation est désactivée",
                    "navForwardDisabled": "Navigating forward is disabled",
                    "sndDisabled": "Le son est désactivé",
                    "requiresCompletionWarning": "Vous devez répondre correctement à toutes les questions avant de continuer.",
                    "back": "Retour",
                    "hours": "Heures",
                    "minutes": "Minutes",
                    "seconds": "Secondes",
                    "currentTime": "Durée actuelle :",
                    "totalTime": "Temps total :",
                    "singleInteractionAnnouncement": "Une interaction est apparue.",
                    "multipleInteractionsAnnouncement": "De multiples interactions sont apparues.",
                    "videoPausedAnnouncement": "La vidéo est en pause.",
                    "content": "Contenu",
                    "answered": "@answered réponses données",
                    "endcardTitle": "@answered question(s) auxquelles vous avez répondu",
                    "endcardInformation": "Vous avez répondu à @answered questions.",
                    "endcardInformationOnSubmitButtonDisabled": "Vous avez répondu à @answered questions. Cliquez ci-dessous pour les remettre.",
                    "endcardInformationNoAnswers": "Vous n'avez répondu à aucune question.",
                    "endcardInformationMustHaveAnswer": "Vous devez répondre à au moins une question avant de pouvoir soumettre vos réponses.",
                    "endcardSubmitButton": "Remettre vos réponses",
                    "endcardSubmitMessage": "Vos réponses ont été remises !",
                    "endcardTableRowAnswered": "Questions auxquelles vous avez répondu",
                    "endcardTableRowScore": "Score",
                    "endcardAnsweredScore": "Réponses",
                    "endCardTableRowSummaryWithScore": "Vous avez obtenu de @score sur un total de @points pour la question @question qui apparaissait à @minutes minutes et @secondes secondes.",
                    "endCardTableRowSummaryWithoutScore": "Vous avez répondu aux @question qui sont apparues après @minutes minutes et @seconds secondes.",
                    "videoProgressBar": "Video progress",
                    "howToCreateInteractions": "Play the video to start creating interactions"
                }
            },
            "metadata": {
                "defaultLanguage": "fr-FR",
                "license": "U",
                "authors": [],
                "changes": [],
                "extraTitle": input.videoTitle,
                "title": input.videoTitle
            }
        }
    }
    return await createH5P(data)

}
