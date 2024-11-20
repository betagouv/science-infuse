import { ExportUrlResponse } from '@/types/api';
import { ExportH5PQuestionRequest, ExportH5PRequestBody } from '@/types/api/export';
import { Question } from '@/types/course-editor';
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic'


const createH5P = async (data: any) => {
    const response = await fetch(`${process.env.H5P_URL}/h5p/new`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
            "content-type": "application/json",
            "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Linux\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "cookie": "next-auth.csrf-token=625f8523c316835570dfd2590e60b8ef36b62537e05f851529d8a98c64747720%7C57e454cb334b4b6b5dfbda6edf3243691dba59542e1e526bc37405f29f943fa5; token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQxZDk1MGMxLTUxMTUtNDc5Yy04ZWQzLWQ4YTJkMmUyZThlNSJ9.3_RFthNOAewvWJ4bBiMAmosXZYatW00sEIV_yrG4kk8; __stripe_mid=7b0394fd-b6c1-4a3f-91f3-841c79aed4daebbee3; _pk_id.145.1fff=1a46da9cd2dae0a0.1727283837.; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000%2F; MoodleSession=a656cf8186snopqnbkhc66eo6c; MOODLEID1_=sodium%3APk09HAO8VwL9IJ1TyAdxAeTrMumXhPU4Lr%2BEJvjMuV6Y12w%2FjOQgOT0BQNk%3D; next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..s6I4mhg_6MiF-28N.SmQVxc_8RFWEBBdV9RgUgn9leBm3W6mttZepE57wYng9w_tb9YtLEydcMTfcO0RoAK_O3zzZdlr7ux6RzINcUGeZ9rptp4nt-4BbAtzvFaW5ekJXFoFtNFhhcAJbLLA2sEv9lZED3hFr3NNW2JBQXoH7qz5SYXsfStcmHU6DbXKtlik3S8ti1CeXaaCR7KGiJ5kEK1S_Sn0ArIpsToXQ8JqdbKiJfS_Yi7pPn73SsY7Pwobsc1vJiA-sk7aiZDRMoGhfBK0vXc8GL0eYAnspJi0m1IlzRtnb9mrW7dJK7pdWtGgOgSR_7NbokKIqoS9gRdGUmCrQbA.OJ1QsA4uQwhCXkpppYhVaw",
            "Referer": `${process.env.H5P_URL}/h5p/new`,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": JSON.stringify(data),
        "method": "POST"
    });
    return await response.json();
}

const createInteractiveVideo = async () => {
    const data = {
        "library": "H5P.InteractiveVideo 1.27",
        "params": {
            "params": {
                "interactiveVideo": {
                    "video": {
                        "startScreenOptions": {
                            "title": "Ma Vidéo interactive",
                            "hideStartTitle": false
                        },
                        "textTracks": {},
                        "files": [
                            {
                                "path": "https://www.youtube.com/watch?v=MjugnMZ17XQ",
                                "mime": "video/YouTube",
                                "copyright": {
                                    "license": "U"
                                },
                                "aspectRatio": "16:9"
                            }
                        ]
                    },
                    "assets": {
                        "interactions": [
                            {
                                "x": 46.899608660939826,
                                "y": 46.52921162067061,
                                "width": 10,
                                "height": 10,
                                "duration": {
                                    "from": 97.259,
                                    "to": 107.259
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
                                        "answers": [
                                            {
                                                "correct": false,
                                                "tipsAndFeedback": {
                                                    "tip": "",
                                                    "chosenFeedback": "",
                                                    "notChosenFeedback": ""
                                                },
                                                "text": "<div>reponse A</div>\n"
                                            },
                                            {
                                                "correct": true,
                                                "tipsAndFeedback": {
                                                    "tip": "",
                                                    "chosenFeedback": "",
                                                    "notChosenFeedback": ""
                                                },
                                                "text": "<div>Reponse B</div>\n"
                                            }
                                        ],
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
                                        "question": "<p>Quelle est la taille de la video?</p>\n"
                                    },
                                    "subContentId": "31d8a6d7-b826-4760-b892-5ae10c28f6f0",
                                    "metadata": {
                                        "contentType": "Choix multiple (Multiple Choice)",
                                        "license": "U",
                                        "title": "Sans titre Choix multiple (Multiple Choice)",
                                        "authors": [],
                                        "changes": [],
                                        "extraTitle": "Sans titre Choix multiple (Multiple Choice)"
                                    }
                                },
                                "pause": false,
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
                            },
                            {
                                "x": 45.8089200874296,
                                "y": 48.46792877153188,
                                "width": 10,
                                "height": 10,
                                "duration": {
                                    "from": 182.629,
                                    "to": 192.629
                                },
                                "libraryTitle": "Question Vrai / Faux (True/False Question)",
                                "action": {
                                    "library": "H5P.TrueFalse 1.8",
                                    "params": {
                                        "media": {
                                            "type": {
                                                "params": {}
                                            },
                                            "disableImageZooming": false
                                        },
                                        "correct": "false",
                                        "behaviour": {
                                            "enableRetry": true,
                                            "enableSolutionsButton": true,
                                            "enableCheckButton": true,
                                            "confirmCheckDialog": false,
                                            "confirmRetryDialog": false,
                                            "autoCheck": false
                                        },
                                        "l10n": {
                                            "trueText": "Vrai",
                                            "falseText": "Faux",
                                            "score": "Vous avez obtenu @score points sur un total de @total",
                                            "checkAnswer": "Vérifier",
                                            "submitAnswer": "Vérifier",
                                            "showSolutionButton": "Voir la solution",
                                            "tryAgain": "Recommencer",
                                            "wrongAnswerMessage": "Réponse incorrecte",
                                            "correctAnswerMessage": "Bonne réponse",
                                            "scoreBarLabel": "Vous avez obtenu @score points sur un total de @total",
                                            "a11yCheck": "Vérifiez les réponses.  Les réponses seront marquées comme correcte, incorrecte ou sans réponse.",
                                            "a11yShowSolution": "Montrer la solution. L'exercice s'affichera avec la solution correcte.",
                                            "a11yRetry": "Réessayer l'exercice. Réinitialisez toutes les réponses et recommencer l'exercice depuis le début."
                                        },
                                        "confirmCheck": {
                                            "header": "Terminer ?",
                                            "body": "Voulez-vous vraiment terminer ?",
                                            "cancelLabel": "Annuler",
                                            "confirmLabel": "Confirmer"
                                        },
                                        "confirmRetry": {
                                            "header": "Recommencer ?",
                                            "body": "Voulez-vous vraiment recommencer ?",
                                            "cancelLabel": "Annuler",
                                            "confirmLabel": "Confirmer"
                                        },
                                        "question": "<p>Est-ce que la terre est plate?</p>\n"
                                    },
                                    "subContentId": "06eb17e2-78e9-47b6-9d31-289fc70aed0c",
                                    "metadata": {
                                        "contentType": "Question Vrai / Faux (True/False Question)",
                                        "license": "U",
                                        "title": "Sans titre Question Vrai / Faux (True/False Question)",
                                        "authors": [],
                                        "changes": [],
                                        "extraTitle": "Sans titre Question Vrai / Faux (True/False Question)"
                                    }
                                },
                                "pause": false,
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
                                "label": "<p>Vrai/Faux</p>\n"
                            }
                        ],
                        "bookmarks": [],
                        "endscreens": [
                            {
                                "time": 393,
                                "label": "6:33 Écran de soumission"
                            }
                        ]
                    },
                    "summary": {
                        "task": {
                            "library": "H5P.Summary 1.10",
                            "params": {
                                "intro": "Choisissez l'affirmation exacte.",
                                "summaries": [
                                    {
                                        "subContentId": "f9e7c52a-797a-44aa-953b-ac6de6b58790",
                                        "summary": [
                                            "<p>A retenir : affirmation 1</p>\n",
                                            "<p>A retenir : affirmation 2</p>\n"
                                        ],
                                        "tip": ""
                                    }
                                ],
                                "overallFeedback": [
                                    {
                                        "from": 0,
                                        "to": 100
                                    }
                                ],
                                "solvedLabel": "Progression :",
                                "scoreLabel": "Erreurs :",
                                "resultLabel": "Votre résultat :",
                                "labelCorrect": "Correct.",
                                "labelIncorrect": "Incorrect! Please try again.",
                                "alternativeIncorrectLabel": "Incorrect",
                                "labelCorrectAnswers": "Réponses correctes.",
                                "tipButtonLabel": "Montrer l'indice",
                                "scoreBarLabel": "Vous avez :num points sur un total de :total",
                                "progressText": "Progression de :num sur :total"
                            },
                            "subContentId": "ead98d95-61f1-4230-9e9d-558b90b480a2",
                            "metadata": {
                                "contentType": "Résumé (Summary)",
                                "license": "U",
                                "title": "Sans titre Résumé (Summary)",
                                "authors": [],
                                "changes": [],
                                "extraTitle": "Sans titre Résumé (Summary)"
                            }
                        },
                        "displayAt": 3
                    }
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
}

const createQuestionSet = async (questions: Question[]) => {
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
    return await createH5P(data)
}

function isQuestionRequest(body: ExportH5PRequestBody): body is ExportH5PQuestionRequest {
    return body.type === 'question';
}

// create h5p content using h5p docker micro-service
// returns the download url
export async function POST(request: NextRequest) {
    const body: ExportH5PRequestBody = await request.json();

    if (isQuestionRequest(body)) {
        const game = await createQuestionSet(body.data);
        const downloadUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/export/h5p?id=${game.contentId}&name=qcm-science-infuse`;
        return NextResponse.json({ url: downloadUrl } as ExportUrlResponse);
    } else {
        throw new Error(`Unsupported type: ${body.type}`);
    }
}

// route to download the h5p by id
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    
    if (!id) {
        throw new Error('id is required');
    }

    const downloadUrl = `${process.env.H5P_URL}/h5p/download/${id}`;
    const response = await fetch(downloadUrl);
    
    return new NextResponse(response.body, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${name}-${id}.h5p"`
        }
    });
}