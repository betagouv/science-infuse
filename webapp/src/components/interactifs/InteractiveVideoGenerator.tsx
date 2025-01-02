import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Document } from "@prisma/client";
import { generateInteraciveVideoData, InteractiveVideoQuestion, InteractiveVideoQuestionGroup } from "@/app/api/export/h5p/contents/interactiveVideo";
import { DocumentWithChunks, GroupedVideo, s3ToPublicUrl } from "@/types/vectordb";
import { useState } from "react";
import Button from '@codegouvfr/react-dsfr/Button';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { CircularProgress } from "@mui/material";
import { RenderGroupedVideoTranscriptCard } from "@/app/recherche/DocumentChunkFull";
import MiniatureWrapper from "@/app/media/video/[id]/MiniatureWrapper";
import { apiClient } from "@/lib/api-client";

const modal = createModal({
    id: "interactive-video",
    isOpenedByDefault: false
});


const QCMEditor = (props: { initialQuestionGroup: InteractiveVideoQuestionGroup, onChange: (updated: InteractiveVideoQuestionGroup) => void }) => {
    const [questionGroup, setQuestionGroup] = useState<InteractiveVideoQuestionGroup>(props.initialQuestionGroup);

    const handleQuestionChange = (index: number, newQuestion: string) => {
        const updatedQuestions = [...questionGroup.questions];
        updatedQuestions[index].question = newQuestion;
        const updated = { ...questionGroup, questions: updatedQuestions };
        setQuestionGroup(updated);
        props.onChange(updated);
    };

    const handleTimestampChange = (newTimestamp: number) => {
        const updated = { ...questionGroup, timestamp: newTimestamp };
        setQuestionGroup(updated);
        props.onChange(updated);
    };

    const handleAnswerChange = (qIndex: number, aIndex: number, newAnswer: string) => {
        const updatedQuestions = [...questionGroup.questions];
        updatedQuestions[qIndex].answers[aIndex].answer = newAnswer;
        const updated = { ...questionGroup, questions: updatedQuestions };
        setQuestionGroup(updated);
        props.onChange(updated);
    };

    const addQuestion = () => {
        const newQuestion: InteractiveVideoQuestion = {
            question: "Nouvelle question",
            answers: [
                { answer: "Réponse 1", correct: false },
                { answer: "Réponse 2", correct: false },
            ],
        };
        const updated = {
            ...questionGroup,
            questions: [...questionGroup.questions, newQuestion],
        };
        setQuestionGroup(updated);
        props.onChange(updated);
    };

    const addAnswer = (qIndex: number) => {
        const updatedQuestions = [...questionGroup.questions];
        updatedQuestions[qIndex].answers.push({ answer: "Nouvelle réponse", correct: false });
        const updated = { ...questionGroup, questions: updatedQuestions };
        setQuestionGroup(updated);
        props.onChange(updated);
    };

    const removeQuestion = (qIndex: number) => {
        const updatedQuestions = questionGroup.questions.filter((_, index) => index !== qIndex);
        const updated = { ...questionGroup, questions: updatedQuestions };
        setQuestionGroup(updated);
        props.onChange(updated);
    };

    const removeAnswer = (qIndex: number, aIndex: number) => {
        const updatedQuestions = [...questionGroup.questions];
        updatedQuestions[qIndex].answers = updatedQuestions[qIndex].answers.filter((_, index) => index !== aIndex);
        const updated = { ...questionGroup, questions: updatedQuestions };
        setQuestionGroup(updated);
        props.onChange(updated);
    };

    const secondsToTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return { hours: h, minutes: m, seconds: s };
    };

    const timeToSeconds = (h: number, m: number, s: number) => {
        return h * 3600 + m * 60 + s;
    };

    const time = secondsToTime(questionGroup.timestamp);

    return (
        <div className="overflow-auto p-8  flex flex-col items-center gap-4 rounded-lg shadow-lg bg-white">
            <p className="self-start">horodatage</p>
            <div className="flex gap-4 self-start justify-start ">
                <Input
                    label="Heures"
                    className="w-24"
                    nativeInputProps={{
                        type: "number",
                        min: "0",
                        value: time.hours,
                        onChange: (e) => handleTimestampChange(timeToSeconds(Number(e.target.value), time.minutes, time.seconds)),
                        required: true,
                    }}
                />
                <Input
                    label="Minutes"
                    className="w-24"
                    nativeInputProps={{
                        type: "number",
                        min: "0",
                        max: "59",
                        value: time.minutes,
                        onChange: (e) => handleTimestampChange(timeToSeconds(time.hours, Number(e.target.value), time.seconds)),
                        required: true,
                    }}
                />
                <Input
                    label="Secondes"
                    className="w-24"
                    nativeInputProps={{
                        type: "number",
                        min: "0",
                        max: "59",
                        value: time.seconds,
                        onChange: (e) => handleTimestampChange(timeToSeconds(time.hours, time.minutes, Number(e.target.value))),
                        required: true,
                    }}
                />
            </div>

            {questionGroup.questions.map((q, qIndex) => (
                <div key={qIndex} className="mb-8 bg-white rounded-lg shadow-sm relative w-full">
                    <Button
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-500 !absolute top-2 right-2"
                        iconId="fr-icon-delete-bin-line"
                        priority="tertiary no outline"
                    >{""}</Button>

                    <p className="m-0 mb-4 text-lg text-center text-black underline">Question {qIndex + 1}</p>

                    <Input
                        label="Question"
                        nativeInputProps={{
                            value: q.question,
                            onChange: (e) => handleQuestionChange(qIndex, e.target.value),
                            required: true,
                        }}
                    />

                    <div className="mt-4">
                        <Checkbox
                            legend="Réponses"
                            options={q.answers.map((a, aIndex) => ({
                                label: (
                                    <div className="flex w-full items-center">
                                        <Input
                                            label=""
                                            className="!m-0 w-full"
                                            nativeInputProps={{
                                                value: a.answer,
                                                onChange: (e) => handleAnswerChange(qIndex, aIndex, e.target.value),
                                                required: true,
                                            }}
                                        />
                                        <Button
                                            onClick={() => removeAnswer(qIndex, aIndex)}
                                            className="text-red-500 ml-2"
                                            iconId="fr-icon-delete-bin-line"
                                            priority="tertiary no outline"
                                        >
                                            {""}
                                        </Button>
                                    </div>
                                ),
                                nativeInputProps: {
                                    checked: a.correct,
                                    onChange: () => {
                                        const updatedQuestions = [...questionGroup.questions];
                                        updatedQuestions[qIndex].answers[aIndex].correct = !a.correct;
                                        const updated = { ...questionGroup, questions: updatedQuestions };
                                        setQuestionGroup(updated);
                                        props.onChange(updated);
                                    },
                                },
                            }))}
                        />
                        <Button
                            onClick={() => addAnswer(qIndex)}
                            className="mt-4 w-full justify-center"
                            priority="secondary"
                        >
                            Ajouter une réponse supplémentaire
                        </Button>
                    </div>
                </div>
            ))}

            <Button
                className="w-full flex items-center justify-center mt-4"
                priority="secondary"
                onClick={addQuestion}
            >
                Ajouter une question
            </Button>
        </div>
    );
};

export default ({ video }: { video: DocumentWithChunks }) => {
    const [ivQuestions, setIvQuestions] = useState<InteractiveVideoQuestionGroup[] | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const generateInteractiveVideo = async () => {
        if (!video) return;
        setIsLoading(true);
        try {
            const iv = await generateInteraciveVideoData(video.id);
            if (!iv) return;
            setIvQuestions(iv.questions);
            console.log(iv);
        } finally {
            setIsLoading(false);
        }
    }

    const document = video.chunks[0].document;

    const groupedVideo: GroupedVideo = {
        documentId: "",
        items: (ivQuestions || []).map(qs => qs.questions.map(q => ({ ...q, timestamp: qs.timestamp }))).flatMap(d => d).map(qg => ({
            score: 0,
            id: "-",
            text: qg.question,
            title: "",
            document: document,
            mediaType: "video_transcript",
            metadata: { start: qg.timestamp, end: qg.timestamp }
        })),
        maxScore: 1
    }

    const handleQuestionGroupChange = (timestamp: number, updated: InteractiveVideoQuestionGroup) => {
        if (!ivQuestions) return;
        const newQuestions = ivQuestions.map(qg =>
            qg.timestamp === timestamp ? updated : qg
        );
        setIvQuestions(newQuestions);
    };

    return <div className="flex flex-col gap-4 relative">

        {/* <modal.Component title="Générer une vidéo interactive" className="z-[199]"> */}

        <div className="flex self-center sticky gap-4 top-0 z-[2] bg-white w-full py-4 items-center justify-center">
            <Button
                onClick={() => { generateInteractiveVideo(); }}
                disabled={isLoading}
            >
                {isLoading ? "Génération en cours..." : ivQuestions ? "Regénérer de nouvelles questions pour la vidéo" : "Générer une vidéo interactive"}
            </Button>
            {ivQuestions && <Button
                priority="secondary"
                onClick={async () => {
                    const data = await apiClient.exportH5p({ type: 'interactive-video', data: { videoPublicUrl: s3ToPublicUrl(video.s3ObjectName), videoTitle: video.mediaName, questions: ivQuestions } })
                    window.open(data.url, '_blank')
                }}
            >
                Télécharger en h5p
            </Button>}
        </div>

        <p className="m-0  text-center text-black">
            L'intelligence artificielle de Science Infuse vous propose des questions et réponses d'après la vidéo. <br />
            Vous pouvez modifier ou supprimer les questions et réponses proposées et définir quand elles apparaissent dans la vidéo.
        </p>

        {isLoading && <CircularProgress className="self-center" />}

        {(ivQuestions || [])?.length > 0 && <MiniatureWrapper>
            <RenderGroupedVideoTranscriptCard defaultSelectedChunk={undefined} video={groupedVideo} searchWords={[]} />
        </MiniatureWrapper>}

        <div className="flex flex-col gap-4">
            {ivQuestions?.map(qs => (
                <>
                    <hr className="m-0" />
                    <QCMEditor
                        key={qs.timestamp}
                        initialQuestionGroup={qs}
                        onChange={(updated) => handleQuestionGroupChange(qs.timestamp, updated)}
                    />
                </>
            ))}
        </div>




        {/* </modal.Component> */}

    </div>
}