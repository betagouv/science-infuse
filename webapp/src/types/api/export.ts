import { Question } from "../course-editor";

export type ExportH5PQuestionRequest = {
    type: "question";
    data: Question[];
};
export type ExportH5PGenericRequest = {
    type: string;
    data: unknown;
};

export type ExportH5PRequestBody = ExportH5PQuestionRequest | ExportH5PGenericRequest;

export type ExportMbzRequestBody = {
    html: string,
}