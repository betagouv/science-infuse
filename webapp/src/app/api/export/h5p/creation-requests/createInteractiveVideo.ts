import prisma from "@/lib/prisma";
import { createH5P } from "."
import { InteractiveVideoData } from "../contents/interactiveVideo"
import { v4 as uuidv4 } from 'uuid';

export default async (input: InteractiveVideoData, h5pContentId?: string) => {
    const definitions = input.definitions;
    console.log("definitions", definitions);
    // const document = await prisma.document.findUnique({
    //     where: {
    //         id: input.documentId
    //     },
    // });
    // if (!document) {
    //     throw new Error(`Document not found for id: ${input.documentId}`);
    // }

    // if (document.duration && input.addDefinitionRecap) {
    //     const allDefinitions = input.definitions.map(d => d.definitions).flat();
    //     if (allDefinitions.length > 0) {
    //         // Remove duplicate definitions by using a Map with JSON stringified objects as keys
    //         const uniqueDefinitionsMap = new Map();
    //         allDefinitions.forEach(def => {
    //             // Create a key that represents this definition
    //             const key = JSON.stringify({
    //                 notion: def.notion.trim().toLowerCase(),
    //                 definition: def.definition.trim().toLowerCase()
    //             });
    //             uniqueDefinitionsMap.set(key, def);
    //         });
    //         const uniqueDefinitions = Array.from(uniqueDefinitionsMap.values());

    //         definitions.push({
    //             timestamp: document.duration,
    //             definitions: uniqueDefinitions
    //         });
    //     }

    // }

    const data = {
        "library": "H5P.InteractiveVideo 1.27",
        "params": {
            "params": {
                "interactiveVideo": {
                    "video": {
                        "startScreenOptions": {
                            "title": `Vidéo interactive${input.videoTitle ? ` : ${input.videoTitle}` : ""}`,
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
                        "interactions": [
                            // TODO: issue in this definition: malformed, compare with right thing
                            ...definitions.map((groupedDefinitions) => {
                                const { timestamp, definitions } = groupedDefinitions;
                                return definitions.map((definition, i) => ({
                                    "x": 5.453442867551143 + Math.floor(i / 10) * 35,
                                    "y": 7.756086588950678 + (i % 10) * 10,
                                    "width": 10,
                                    "height": 10,
                                    "duration": {
                                        "from": timestamp,
                                        "to": timestamp + 4
                                    },
                                    "libraryTitle": "Text",
                                    "action": {
                                        "library": "H5P.Text 1.1",
                                        "params": {
                                            "text": `<p>${definition.definition}</p>\n`
                                        },
                                        "subContentId": "99707e8d-bfd1-459f-a49f-756ba1082bc5",
                                        "metadata": {
                                            "contentType": "Text",
                                            "license": "U",
                                            "title": "Sans titre Texte",
                                            "authors": [],
                                            "changes": []
                                        }
                                    },
                                    "pause": false,
                                    "displayType": "button",
                                    "buttonOnMobile": false,
                                    "visuals": {
                                        "backgroundColor": "rgb(255, 255, 255)",
                                        "boxShadow": true
                                    },
                                    "goto": {
                                        "url": {
                                            "protocol": "http://"
                                        },
                                        "visualize": false,
                                        "type": ""
                                    },
                                    "label": `<p>${definition.notion}</p>\n`
                                }))

                            }).flatMap(d => d),

                            ...input.questions.map((groupedQuestions, groupedQuestionsIndex) => {
                                const { timestamp, questions } = groupedQuestions;
                                return {
                                    "x": 17.451017176163656,
                                    "y": 17.451194825139027,
                                    "width": 22.14437793702515,
                                    "height": 16.44819753104577,
                                    "duration": {
                                        "from": timestamp + 5,
                                        "to": timestamp + 7
                                    },
                                    "libraryTitle": "Testez vos connaissances",
                                    "action": {
                                        "library": "H5P.SingleChoiceSet 1.11",
                                        "params": {
                                            "choices": [
                                                ...questions.map((question) => {
                                                    return {
                                                        "subContentId": uuidv4(),
                                                        "question": `<p>${question.question}</p>\n`,
                                                        "answers": question.answers
                                                            .sort((a, b) => Number(b.correct) - Number(a.correct))
                                                            .map(answer => `<p>${answer.answer}</p>`)
                                                    };
                                                }),
                                            ],
                                            "overallFeedback": [
                                                {
                                                    "from": 0,
                                                    "to": 100
                                                }
                                            ],
                                            "behaviour": {
                                                "autoContinue": true,
                                                "timeoutCorrect": 2000,
                                                "timeoutWrong": 3000,
                                                "soundEffectsEnabled": true,
                                                "enableRetry": true,
                                                "enableSolutionsButton": true,
                                                "passPercentage": 100
                                            },
                                            "l10n": {
                                                "nextButtonLabel": "Question suivante",
                                                "showSolutionButtonLabel": "Voir la solution",
                                                "retryButtonLabel": "Correction",
                                                "solutionViewTitle": "Recommencer",
                                                "correctText": "Correct !",
                                                "incorrectText": "Incorrect !",
                                                "shouldSelect": "Should have been selected",
                                                "shouldNotSelect": "Should not have been selected",
                                                "muteButtonLabel": "Couper les retours sons",
                                                "closeButtonLabel": "Fermer",
                                                "slideOfTotal": "Diapositive :num sur :total",
                                                "scoreBarLabel": "Vous avez :num points sur un total de :total",
                                                "solutionListQuestionNumber": "Question :num",
                                                "a11yShowSolution": "Show the solution. The task will be marked with its correct solution.",
                                                "a11yRetry": "Retry the task. Reset all responses and start the task over again."
                                            }
                                        },
                                        "subContentId": "3975ebbf-baeb-4f14-acd9-d04a3b3d2824",
                                        "metadata": {
                                            "contentType": "Testez vos connaissances",
                                            "license": "U",
                                            "title": `Quiz ${groupedQuestionsIndex + 1}`,
                                            "authors": [],
                                            "changes": [],
                                            "extraTitle": `Quiz ${groupedQuestionsIndex + 1}`
                                        }
                                    },
                                    "pause": true,
                                    "displayType": "poster",
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

                            }),
                        ],
                        "bookmarks": [],
                        // "endscreens": [
                        //     {
                        //         "time": 10000,
                        //         "label": "Écran de soumission"
                        //     }
                        // ]
                    },
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
                "extraTitle": "VIDEO INTERACTIVE",
                "title": "VIDEO INTERACTIVE"
            }
        }
    }


    return await createH5P(data, h5pContentId)

}
