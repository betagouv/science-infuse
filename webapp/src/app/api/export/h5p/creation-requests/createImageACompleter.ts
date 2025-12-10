import prisma from "@/lib/prisma";
import { createH5P } from "."
import { Dialogcard } from "@/app/(main)/intelligence-artificielle/dialogcards/DialogcardEditor";
import { ImageACompleterBox } from "@/app/(main)/intelligence-artificielle/image-a-completer/ImageACompleterEditor";

export interface ImageACompleterData {
  boxes: ImageACompleterBox[]
  documentId: string;
  chunkId: string;
}

export default async (input: ImageACompleterData, h5pContentId?: string) => {
  const document = await prisma.document.findUnique({
    where: {
      id: input.documentId
    },
  });

  const chunk = await prisma.documentChunk.findUnique({
    where: {
      id: input.chunkId
    }
  })

  console.log("DCMT CHUNK", chunk)

  if (!document) {
    throw new Error(`Document not found for id: ${input.documentId}`);
  }


  const data = {
    "library": "H5P.DragQuestion 1.14",
    "params": {
      "params": {
        "scoreShow": "Check",
        "submit": "Submit",
        "tryAgain": "Retry",
        "scoreExplanation": "Correct answers give +1 point. Incorrect answers give -1 point. The lowest possible score is 0.",
        "question": {
          "settings": {
            "size": {
              "width": 620,
              "height": 310
            },
            "background": {
              "path": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Structure_volcan.png/1200px-Structure_volcan.png",
              "mime": "image/png",
              "copyright": {
                "license": "U"
              },
              "width": 52,
              "height": 52
            }
          },
          "task": {
            "elements": [
              {
                "x": 1.6129032258064515,
                "y": 83.87096774193549,
                "width": 6.7125,
                "height": 2.3124999999999996,
                "dropZones": [
                  "0",
                  "1"
                ],
                "type": {
                  "library": "H5P.AdvancedText 1.1",
                  "params": {
                    "text": "<p>{label_zone_1}</p>"
                  },
                  "subContentId": "7c3164c2-8e9b-4629-a863-b0c6e42bd8db",
                  "metadata": {
                    "contentType": "Text",
                    "license": "U",
                    "title": "Untitled Text",
                    "authors": [],
                    "changes": []
                  }
                },
                "backgroundOpacity": 50,
                "multiple": false
              },
              {
                "x": 24.193548387096772,
                "y": 83.86844758064515,
                "width": 8.5869375,
                "height": 2.3375,
                "dropZones": [
                  "1",
                  "0"
                ],
                "type": {
                  "library": "H5P.AdvancedText 1.1",
                  "params": {
                    "text": "<p>{label_zone_2}</p>"
                  },
                  "subContentId": "f708b7bd-364c-4684-9a1a-01961b7f6605",
                  "metadata": {
                    "contentType": "Text",
                    "license": "U",
                    "title": "Untitled Text",
                    "authors": [],
                    "changes": []
                  }
                },
                "backgroundOpacity": 50,
                "multiple": false
              }
            ],
            "dropZones": [
              {
                "x": 19.35483870967742,
                "y": 12.903225806451612,
                "width": 10,
                "height": 3.125,
                "correctElements": [
                  "0"
                ],
                "showLabel": false,
                "backgroundOpacity": 0,
                "tipsAndFeedback": {
                  "tip": ""
                },
                "single": false,
                "autoAlign": false,
                "type": {
                  "library": "H5P.DragQuestionDropzone 0.1"
                },
                "label": "<div>{zone_1}</div>"
              },
              {
                "x": 77.41935483870968,
                "y": 0,
                "width": 8.75,
                "height": 6.875,
                "correctElements": [
                  "1"
                ],
                "showLabel": false,
                "backgroundOpacity": 0,
                "tipsAndFeedback": {
                  "tip": ""
                },
                "single": false,
                "autoAlign": false,
                "type": {
                  "library": "H5P.DragQuestionDropzone 0.1"
                },
                "label": "<div>{zone_2}</div>"
              }
            ]
          }
        },
        "overallFeedback": [
          {
            "from": 0,
            "to": 100,
            "feedback": "good"
          }
        ],
        "behaviour": {
          "enableRetry": true,
          "enableCheckButton": true,
          "singlePoint": false,
          "applyPenalties": true,
          "enableScoreExplanation": true,
          "dropZoneHighlighting": "dragging",
          "autoAlignSpacing": 2,
          "enableFullScreen": false,
          "showScorePoints": true,
          "showTitle": true
        },
        "grabbablePrefix": "Grabbable {num} of {total}.",
        "grabbableSuffix": "Placed in dropzone {num}.",
        "dropzonePrefix": "Dropzone {num} of {total}.",
        "noDropzone": "No dropzone.",
        "tipLabel": "Show tip.",
        "tipAvailable": "Tip available",
        "correctAnswer": "Correct answer",
        "wrongAnswer": "Wrong answer",
        "feedbackHeader": "Feedback",
        "scoreBarLabel": "You got :num out of :total points",
        "scoreExplanationButtonLabel": "Show score explanation",
        "a11yCheck": "Check the answers. The responses will be marked as correct, incorrect, or unanswered.",
        "a11yRetry": "Retry the task. Reset all responses and start the task over again.",
        "localize": {
          "fullscreen": "Fullscreen",
          "exitFullscreen": "Exit fullscreen"
        }
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