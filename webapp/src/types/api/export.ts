import { InteractiveVideoData } from "@/app/api/export/h5p/contents/interactiveVideo";
import { Question } from "../course-editor";
import { ImageACompleterBox } from "@/app/(main)/intelligence-artificielle/image-a-completer/ImageACompleterEditor";
import { DialogcardSet } from "@/app/(main)/intelligence-artificielle/dialogcards/DialogcardEditor";
import { DialogcardsData } from "@/app/api/export/h5p/creation-requests/createDialogcards";
import { ImageACompleterData } from "@/app/api/export/h5p/creation-requests/createImageACompleter";
import { TexteATrousData } from "@/app/api/export/h5p/creation-requests/createTexteATrous";
import { MotsCroisesData } from "@/app/api/export/h5p/creation-requests/createMotsCroises";

export type ExportH5PGenericRequest = {
    type: string;
    documentIds: string[],
    h5pContentId?: string,
    data: unknown;
};

export type ExportH5PQuestionRequest = ExportH5PGenericRequest & {
    type: "question";
    data: Question[];
};

export type ExportH5PInteractiveVideoRequest = ExportH5PGenericRequest & {
    type: "interactive-video";
    data: InteractiveVideoData
};

export type ExportH5PDialogcardsRequest = ExportH5PGenericRequest & {
    type: "dialogcards",
    data: DialogcardsData,
}

export type ExportH5PImageACompleterRequest = ExportH5PGenericRequest & {
    type: "image-a-completer",
    data: ImageACompleterData
}

export type ExportH5PTexteATrousRequest = ExportH5PGenericRequest & {
    type: "texte-a-trous",
    data: TexteATrousData
}

export type ExportH5PMotsCroisesRequest = ExportH5PGenericRequest & {
    type: "mots-croises",
    data: MotsCroisesData
}

export type ExportH5PRequestBody = ExportH5PQuestionRequest | ExportH5PInteractiveVideoRequest | ExportH5PDialogcardsRequest | ExportH5PImageACompleterRequest | ExportH5PTexteATrousRequest | ExportH5PMotsCroisesRequest;

export type ExportMbzRequestBody = {
    html: string,
}