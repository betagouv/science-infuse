import { Question } from "../course-editor";

export type ExportH5PQuestionRequest = {
    type: "question";
    data: Question[];
};

export type ExportH5PInteractiveVideoRequest = {
    type: "interactive-video";
    data: {
        documentId: string
    };
};

export type ExportH5PGenericRequest = {
    type: string;
    data: unknown;
};

export type ExportH5PRequestBody = ExportH5PQuestionRequest | ExportH5PInteractiveVideoRequest | ExportH5PGenericRequest;

export type ExportMbzRequestBody = {
    html: string,
}