'use client'
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import {
    InteractiveVideoQuestion,
    InteractiveVideoQuestionGroup,
    InteractiveVideoDefinition,
    InteractiveVideoDefinitionGroup,
    generateInteraciveVideoData,
}
    from "@/app/api/export/h5p/contents/interactiveVideo";
import { s3ToPublicUrl } from "@/types/vectordb";
import Button from '@codegouvfr/react-dsfr/Button';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { CircularProgress } from "@mui/material";
import { apiClient } from "@/lib/api-client";
import { secondsToTime, TimeCode, timeToSeconds } from "@/lib/utils";
import { ExportH5pResponse } from "@/types/api";
import styled from '@emotion/styled';
import H5PRenderer from '@/app/mediaViewers/H5PRenderer';
import { LLMGenerateDefinition } from '@/lib/server/ia/external_llm';
import AutoAwesome from '@mui/icons-material/AutoAwesomeOutlined';
import Snackbar from '@/components/Snackbar';
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import EmbedVideo from '@/components/interactifs/EmbedVideo';

const modal = createModal({
    id: "foo-modal",
    isOpenedByDefault: false
});



const DeleteButton = styled(Button)`
    aspect-ratio: 1;
  --border-action-high-blue-france: red;
  display: flex;
  align-items: center;
  justify-content: center;
  &:before {
      --icon-size: 1rem !important;
      margin: 0 !important;
    /* display: none; */
  }
`
//////////////////////////////
// Reusable Timestamp Input //
//////////////////////////////

type TimestampInputProps = {
    timestamp?: number;
    onChange: (newTimestamp: number) => void;
};

const StyledInput = styled(Input)`
.fr-input-group {
    margin:0;
}
*::-webkit-datetime-edit {
  display: 24-hour;
}
`

const TimestampInput: React.FC<TimestampInputProps> = ({ timestamp, onChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempTime, setTempTime] = useState<TimeCode | null>(timestamp ? secondsToTime(timestamp) : null);

    console.log("tempTime", tempTime)

    const handleSave = () => {
        if (!tempTime) return;
        const totalSeconds = timeToSeconds(tempTime.hours, tempTime.minutes, tempTime.seconds);
        onChange(totalSeconds);
        setIsEditing(false);
    };

    return (
        <div className="flex gap-4 items-center">
            {!isEditing ? (
                <Button
                    size='small'
                    onClick={() => setIsEditing(true)}
                    iconId='fr-icon-timer-line'
                    iconPosition='left'
                    priority="secondary"
                    className='w-[18rem] text-center flex items-center justify-center'
                >
                    {!tempTime ? "Indiquer la position" : `Modifier la position (${String(tempTime.hours).padStart(2, '0')}:${String(tempTime.minutes).padStart(2, '0')}:${String(tempTime.seconds).padStart(2, '0')})`}
                </Button>
            ) : (
                <>
                    <StyledInput
                        label=""
                        className="w-40 !m-0"
                        nativeInputProps={{
                            lang: "fr-FR", // Use a locale that defaults to 24-hour time
                            type: "time",
                            step: "1",
                            value: !tempTime ? "00:00:00" : `${String(tempTime.hours).padStart(2, '0')}:${String(tempTime.minutes).padStart(2, '0')}:${String(tempTime.seconds).padStart(2, '0')}`,
                            onChange: (e) => {
                                const [hours, minutes, seconds] = e.target.value.split(':').map(Number);
                                setTempTime({ hours, minutes, seconds: seconds || 0 });
                            },
                            required: true,
                            pattern: "[0-9]{2}:[0-9]{2}:[0-9]{2}",
                        }}
                    />
                    <Button
                        onClick={handleSave}
                        className='w-30'
                        priority="primary"
                    >
                        Enregistrer
                    </Button>
                </>
            )}
        </div>
    );
};
//////////////////////////////
// QCM Editor Component     //
//////////////////////////////

// QCM Editor Component
type QCMEditorProps = {
    initialQuestionGroup: InteractiveVideoQuestionGroup;
    onChange: (updated: InteractiveVideoQuestionGroup) => void;
    onSave: () => Promise<void>;
    deleteQuiz: () => void;
    documentId: string;
};

const QCMEditor: React.FC<QCMEditorProps> = ({ initialQuestionGroup, onChange, deleteQuiz, onSave }) => {
    const [questionGroup, setQuestionGroup] = useState(initialQuestionGroup);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const updateGroup = useCallback(
        (updated: InteractiveVideoQuestionGroup) => {
            setQuestionGroup(updated);
            onChange(updated);
            setHasChanges(true);
        },
        [onChange]
    );

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave();
            setHasChanges(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleQuestionChange = (index: number, newQuestion: string) => {
        const updated = {
            ...questionGroup,
            questions: questionGroup.questions.map((q, i) =>
                i === index ? { ...q, question: newQuestion } : q
            ),
        };
        updateGroup(updated);
    };

    const handleTimestampChange = (newTimestamp: number) => {
        updateGroup({ ...questionGroup, timestamp: newTimestamp });
    };

    const handleAnswerChange = (qIndex: number, aIndex: number, newAnswer: string) => {
        const updatedQuestions = questionGroup.questions.map((q, i) => {
            if (i === qIndex) {
                return {
                    ...q,
                    answers: q.answers.map((a, j) => (j === aIndex ? { ...a, answer: newAnswer } : a)),
                };
            }
            return q;
        });
        updateGroup({ ...questionGroup, questions: updatedQuestions });
    };

    const handleCorrectChange = (qIndex: number, aIndex: number) => {
        const updatedQuestions = questionGroup.questions.map((q, i) => {
            if (i === qIndex) {
                return {
                    ...q,
                    answers: q.answers.map((a, j) => ({ ...a, correct: j === aIndex })),
                };
            }
            return q;
        });
        updateGroup({ ...questionGroup, questions: updatedQuestions });
    };

    const addQuestion = () => {
        const newQuestion: InteractiveVideoQuestion = {
            question: "",
            answers: [
                { answer: "Réponse A", correct: true },
                { answer: "Réponse B", correct: false },
            ],
        };
        updateGroup({ ...questionGroup, questions: [...questionGroup.questions, newQuestion] });
    };

    const addAnswer = (qIndex: number) => {
        const updatedQuestions = questionGroup.questions.map((q, i) =>
            i === qIndex
                ? { ...q, answers: [...q.answers, { answer: "", correct: false }] }
                : q
        );
        updateGroup({ ...questionGroup, questions: updatedQuestions });
    };

    const removeQuestion = (qIndex: number) => {
        const updated = {
            ...questionGroup,
            questions: questionGroup.questions.filter((_, i) => i !== qIndex),
        };
        updateGroup(updated);
    };

    const removeAnswer = (qIndex: number, aIndex: number) => {
        const updated = {
            ...questionGroup,
            questions: questionGroup.questions.map((q, i) =>
                i === qIndex ? { ...q, answers: q.answers.filter((_, j) => j !== aIndex) } : q
            ),
        };
        updateGroup(updated);
    };

    return (
        <div className="flex flex-col items-center gap-4 relative">
            <div className="flex w-full flex-col sm:flex-row justify-between items-center sticky top-0 bg-white z-[2] py-2 gap-4 sm:gap-2">
                <p className="m-0 text-xl font-bold text-left text-[#000091] self-center">Quiz</p>
                <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto sm:ml-auto gap-2">
                    {hasChanges && (
                        <Button
                            onClick={handleSave}
                            priority="primary"
                            disabled={isSaving}
                            className="w-full sm:w-auto"
                        >
                            {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                        </Button>
                    )}
                    <div className="flex flex-row items-center justify-between gap-2 w-full sm:w-auto">
                        <TimestampInput timestamp={questionGroup.timestamp} onChange={handleTimestampChange} />
                        <DeleteButton
                            iconId="fr-icon-delete-bin-line"
                            size='small'
                            className='text-red-500'
                            onClick={deleteQuiz}
                            priority='secondary'
                            title="Supprimer le quiz"
                        />
                    </div>
                </div>
            </div>
            {questionGroup.questions.map((q, qIndex) => (
                <div key={qIndex} className="relative w-full shadow-[inset_0_0_0_1px_#000091] p-8">
                    <DeleteButton
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-500 !absolute top-2 right-2"
                        iconId="fr-icon-delete-bin-line"
                        size='small'
                        priority="secondary"
                    >{""}</DeleteButton>
                    <Input
                        label={`Question ${qIndex + 1}`}
                        nativeInputProps={{
                            placeholder: "Saisissez votre texte...",
                            value: q.question,
                            onChange: (e) => handleQuestionChange(qIndex, e.target.value),
                            required: true,
                        }}
                    />
                    <div className="mt-4">
                        <RadioButtons
                            className="flex w-full items-center justify-center [&_.fr-radio-group]:!max-w-full"
                            legend={<div>Sélectionnez la ou les bonne(s) réponse(s).</div>}
                            options={q.answers.map((a, aIndex) => ({
                                label: (
                                    <div className="flex w-full items-center">
                                        <Input
                                            label=""
                                            className="!m-0 w-full"
                                            nativeInputProps={{
                                                placeholder: "Saisissez une réponse...",
                                                value: a.answer,
                                                onChange: (e) => handleAnswerChange(qIndex, aIndex, e.target.value),
                                                required: true,
                                            }}
                                        />
                                        <DeleteButton
                                            onClick={() => removeAnswer(qIndex, aIndex)}
                                            size='small'
                                            className="text-red-500 ml-2"
                                            iconId="fr-icon-delete-bin-line"
                                            priority="secondary"
                                        >{""}</DeleteButton>
                                    </div>
                                ),
                                nativeInputProps: {
                                    checked: a.correct,
                                    onChange: () => handleCorrectChange(qIndex, aIndex),
                                },
                            }))}
                        />
                        <div className="flex w-full justify-start">
                            <Button
                                onClick={() => addAnswer(qIndex)}
                                className="justify-center"
                                priority="secondary"
                            >
                                Ajouter une réponse
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
            <Button
                className="w-full flex gap-2 items-center justify-center mt-4"
                priority="secondary"
                onClick={addQuestion}
            >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.33398 4.33301V0.333008H5.66732V4.33301H9.66732V5.66634H5.66732V9.66634H4.33398V5.66634H0.333984V4.33301H4.33398Z" fill="#000091" />
                </svg>

                Ajouter une question au Quiz
            </Button>
        </div>
    );
};


//////////////////////////////
// Definition Editor Component //
//////////////////////////////

type DefinitionEditorProps = {
    documentId?: string;
    initialDefinitionGroup: InteractiveVideoDefinitionGroup;
    onChange: (updated: InteractiveVideoDefinitionGroup) => void;
    deleteDefinitionGroup: () => void;
    onSave: () => Promise<void>;
};

const DefinitionEditor: React.FC<DefinitionEditorProps> = ({ documentId, initialDefinitionGroup, deleteDefinitionGroup, onChange, onSave }) => {
    const [definitionGroup, setDefinitionGroup] = useState(initialDefinitionGroup);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [definitionLoading, setDefinitionLoading] = useState(false);

    const updateGroup = useCallback(
        (updated: InteractiveVideoDefinitionGroup) => {
            setDefinitionGroup(updated);
            onChange(updated);
            setHasChanges(true);
        },
        [onChange]
    );

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave();
            setHasChanges(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleNotionChange = (index: number, newNotion: string) => {
        const updated = definitionGroup.definitions.map((def, i) =>
            i === index ? { ...def, notion: newNotion } : def
        );
        updateGroup({ ...definitionGroup, definitions: updated });
    };

    const handleDefinitionChange = (index: number, newDefinition: string) => {
        const updated = definitionGroup.definitions.map((def, i) =>
            i === index ? { ...def, definition: newDefinition } : def
        );
        updateGroup({ ...definitionGroup, definitions: updated });
    };

    const handleTimestampChange = (newTimestamp: number) => {
        updateGroup({ ...definitionGroup, timestamp: newTimestamp });
    };

    const addDefinition = () => {
        const newDefinition: InteractiveVideoDefinition = {
            notion: "",
            definition: "",
        };
        updateGroup({ ...definitionGroup, definitions: [...definitionGroup.definitions, newDefinition] });
    };

    const removeDefinition = (index: number) => {
        const updated = definitionGroup.definitions.filter((_, i) => i !== index);
        updateGroup({ ...definitionGroup, definitions: updated });
    };

    return (
        <div className="flex flex-col items-center gap-4 relative">

            <div className="flex w-full flex-col sm:flex-row justify-between items-center sticky top-0 bg-white z-[2] py-2 gap-4 sm:gap-2">
                <p className="m-0 text-xl font-bold text-left text-[#000091] self-center">Définition</p>
                <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto sm:ml-auto gap-2">
                    {hasChanges && (
                        <Button
                            onClick={handleSave}
                            priority="primary"
                            disabled={isSaving}
                            className="w-full sm:w-auto"
                        >
                            {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                        </Button>
                    )}
                    <div className="flex flex-row items-center justify-between gap-2 w-full sm:w-auto">
                        <TimestampInput timestamp={definitionGroup.timestamp} onChange={handleTimestampChange} />
                        <DeleteButton
                            iconId="fr-icon-delete-bin-line"
                            size='small'
                            className='text-red-500'
                            onClick={deleteDefinitionGroup}
                            priority='secondary'
                            title="Supprimer le quiz"
                        />
                    </div>
                </div>
            </div>

            {definitionGroup.definitions.map((def, index) => (
                <div key={index} className="relative w-full shadow-[inset_0_0_0_1px_#000091] p-8">
                    <DeleteButton
                        onClick={() => removeDefinition(index)}
                        className="text-red-500 !absolute top-2 right-2"
                        iconId="fr-icon-delete-bin-line"
                        priority="tertiary no outline"
                        size='small'
                    >{""}</DeleteButton>
                    <p className="m-0 mb-4 text-lg text-black underline">Définition {index + 1}</p>
                    <div className="relative">
                        <Input
                            label="Notion"
                            className="!m-0 w-full"
                            addon={
                                def.definition.length == 0 && (
                                    <Button
                                        disabled={definitionLoading}
                                        onClick={async () => {
                                            setDefinitionLoading(true);
                                            const definition = await LLMGenerateDefinition(def.notion, documentId);
                                            if (definition)
                                                handleDefinitionChange(index, definition);
                                            setDefinitionLoading(false);
                                        }}
                                        priority="tertiary"
                                        className="whitespace-nowrap gap-2"
                                    >
                                        {definitionLoading ? <CircularProgress size={20} /> : <AutoAwesome />}
                                        Générer une définition
                                    </Button>
                                )
                            }
                            nativeInputProps={{
                                placeholder: "Saisissez la notion à définir...",
                                value: def.notion,
                                onChange: (e) => handleNotionChange(index, e.target.value),
                                required: true,
                            }}
                        />

                    </div>
                    <div className="mt-4">
                        <Input
                            label="Définition"
                            textArea={true}
                            nativeTextAreaProps={{
                                placeholder: "Saisissez la définition...",
                                value: def.definition,
                                onChange: (e) => handleDefinitionChange(index, e.target.value),
                                required: true,
                            }}
                        />
                    </div>
                </div>
            ))}
            <Button
                className="w-full justify-center"
                priority="secondary"
                onClick={addDefinition}
            >
                Ajouter une définition à la même position
            </Button>
        </div>
    );
};
//////////////////////////////
// Main Interactive Editor  //
//////////////////////////////

export default function InteractiveVideoEditor(props: { documentId: string, onBackClicked?: () => void, saveDocument?: () => void; onDocumentProcessingEnd?: () => void }) {
    const { documentId, onDocumentProcessingEnd } = props;
    const [ivQuestions, setIvQuestions] = useState<InteractiveVideoQuestionGroup[] | undefined>(undefined);
    const [ivDefinitions, setIvDefinitions] = useState<InteractiveVideoDefinitionGroup[] | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [editContentActive, setEditContentActive] = useState(false);
    const [processingDone, setProcessingDone] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [videoTitle, setVideoTitle] = useState<string | null>(null);
    const [downloadH5pUrl, setDownloadH5pUrl] = useState<string | null>(null);
    const [downloadHTMLUrl, setDownloadHTMLUrl] = useState<string | null>(null);
    const [h5pContentId, setH5pContentId] = useState<string | undefined>();
    const [questionPage, setQuestionPage] = useState(1);
    const [definitionPage, setDefinitionPage] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const updateInteractiveVideo = async (documentId: string, questions: InteractiveVideoQuestionGroup[], definitions: InteractiveVideoDefinitionGroup[]) => {
        setIsSaving(true);
        try {
            let data: ExportH5pResponse | undefined;
            const video = await apiClient.getDocument(documentId);
            data = await apiClient.exportH5p({
                h5pContentId: h5pContentId,
                type: 'interactive-video',
                data: {
                    videoPublicUrl: s3ToPublicUrl(video.s3ObjectName || ""),
                    videoTitle: video.mediaName,
                    questions,
                    definitions,
                },
                documentIds: documentId ? [documentId] : [],
            });
            if (data) {
                setPreviewUrl(data.embedUrl);
                setDownloadH5pUrl(data.downloadH5p);
                setDownloadHTMLUrl(data.downloadHTML);
                setH5pContentId(data.h5pContentId);
                console.log("PREVIEW URL SET", data.embedUrl)
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveChanges = async () => {
        if (ivQuestions && ivDefinitions && documentId) {
            await updateInteractiveVideo(documentId, ivQuestions, ivDefinitions);
            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 3000);
        }
    };

    const generateInteractiveVideo = useCallback(async () => {
        setProcessingDone(false);
        setIsLoading(true);
        setIvQuestions([]);
        setIvDefinitions([]);
        setVideoTitle("");
        try {
            if (!documentId) {
                console.warn("Document ID manquant");
                return;
            }

            const iv = await generateInteraciveVideoData({ documentId });
            console.log("IVIVIV", iv);
            if (!iv) return;
            setIvQuestions(iv.questions);
            setIvDefinitions(iv.definitions);
            setVideoTitle(iv.videoTitle);

            await updateInteractiveVideo(documentId, iv.questions, iv.definitions);

            console.log(iv);
        } finally {
            setIsLoading(false);
            setProcessingDone(true);
            onDocumentProcessingEnd && onDocumentProcessingEnd();
        }
    }, [documentId]);

    const handleQuestionGroupChange = useCallback(
        (index: number, updated: InteractiveVideoQuestionGroup) => {
            if (!ivQuestions) return;
            const newQuestions = ivQuestions.map((qg, i) => (i === index ? updated : qg));
            setIvQuestions(newQuestions);
        },
        [ivQuestions]
    );

    const handleDefinitionGroupChange = useCallback(
        (index: number, updated: InteractiveVideoDefinitionGroup) => {
            if (!ivDefinitions) return;
            const newDefinitions = ivDefinitions.map((dg, i) => (i === index ? updated : dg));
            setIvDefinitions(newDefinitions);
        },
        [ivDefinitions]
    );

    const handleSaveAndQuit = async () => {
        // Add your save logic here
        modal.close();
        await handleSaveChanges();
        props.onBackClicked && props.onBackClicked();
    }

    const handleQuitWithoutSave = () => {
        modal.close();
        props.onBackClicked && props.onBackClicked();
    }

    const hasGenerated = useRef(false);

    useEffect(() => {
        if (documentId && !hasGenerated.current) {
            hasGenerated.current = true;
            generateInteractiveVideo();
        }
    }, [documentId, generateInteractiveVideo]);


    return (
        <div className="w-full relative flex flex-col gap-8">
            <Button
                className='flex justify-center self-start items-center gap-2 xl:absolute xl:translate-x-[calc(-100%-2rem)] translate-x-0 relative'
                priority='secondary'
                onClick={() => {
                    modal.open();
                }}
            >
                <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M2.21932 4.99999L5.51932 8.29999L4.57665 9.24266L0.333984 4.99999L4.57665 0.757324L5.51932 1.69999L2.21932 4.99999Z" fill="#000091" />
                </svg>

                Retour
            </Button>

            <modal.Component title="">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2 items-center">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.5633 9.66673L9.41132 2.51473L11.2967 0.629395L21.6673 11.0001L11.2967 21.3707L9.41132 19.4854L16.5633 12.3334H0.333984V9.66673H16.5633Z" fill="#161616" />
                        </svg>
                        <p className="text-2xl m-0 font-bold text-left text-[#161616]">Quitter la page</p>
                    </div>
                    <p>Attention, certaines modifications n'ont pas été enregistrées.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button className="w-full justify-center sm:w-auto" onClick={handleSaveAndQuit}>{isSaving ? "Enregistrement en cours" : "Enregistrer et quitter"}</Button>
                        <Button className="w-full justify-center sm:w-auto" priority='secondary' onClick={handleQuitWithoutSave}>Quitter sans enregistrer</Button>
                    </div>
                </div>
            </modal.Component>
            {showSuccessAlert && (
                <Snackbar
                    open={showSuccessAlert}
                    onClose={() => setShowSuccessAlert(false)}
                    // title="Modifications enregistrées"
                    description="Modifications enregistrées"
                    severity="success"
                    position="bottom-right"
                    autoHideDuration={5000}
                    closable={true}
                />
            )}
            {processingDone ? <p className="text-base text-left">
                <span className="font-bold text-[#18753c]">Analyse terminée ! </span>
                <br />
                <span className="text-black">
                    Voici une suggestion de quiz et de définitions pour rendre votre vidéo plus engageante :
                </span>
            </p> : <></>}

            {/* H5P PREVIEW */}
            {previewUrl ? (
                <H5PRenderer h5pPublicUrl={previewUrl} />
            ) : null}

            <div className="flex flex-wrap items-center gap-4">
                {processingDone && <>
                    <Button
                        className='block w-full justify-center sm:w-fit whitespace-nowrap'
                        disabled={editContentActive}
                        onClick={() => setEditContentActive(!editContentActive)}
                    >Modifier les quiz et définitions</Button>

                    {downloadHTMLUrl && (
                        <Button
                            priority='secondary'
                            className='flex gap-2 w-full justify-center sm:w-fit'
                            onClick={() => window.open(downloadHTMLUrl, '_blank')}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M2 12.6663H14V13.9997H2V12.6663ZM8.66667 8.78101L12.714 4.73301L13.6567 5.67567L8 11.333L2.34333 5.67634L3.286 4.73301L7.33333 8.77967V1.33301H8.66667V8.78101Z" fill="#000091" />
                            </svg>

                            <p className='m-0'>Télécharger en html</p>
                        </Button>
                    )}
                    {downloadH5pUrl && (
                        <Button
                            priority='secondary'
                            className='flex gap-2 w-full justify-center sm:w-fit'
                            onClick={() => window.open(downloadH5pUrl, '_blank')}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M2 12.6663H14V13.9997H2V12.6663ZM8.66667 8.78101L12.714 4.73301L13.6567 5.67567L8 11.333L2.34333 5.67634L3.286 4.73301L7.33333 8.77967V1.33301H8.66667V8.78101Z" fill="#000091" />
                            </svg>

                            <p className='m-0'>Télécharger en h5p</p>
                        </Button>
                    )}
                    {
                        previewUrl && <EmbedVideo videoUrl={previewUrl} />
                    }
                </>}
            </div>

            {processingDone && editContentActive && <>
                <hr />

                <p className="m-0 text-[28px] font-bold text-left text-gray-900">Modifier les quiz et définitions</p>
                <p className="m-0 text-base text-left text-black">
                    Personnalisez les questions et réponses générés, sélectionnez les bonnes réponses, ou ajustez les définitions proposées par IA. Vos modifications seront sauvegardées dans votre espace personnel.
                </p>
            </>}

            <div className="flex flex-col gap-4 relative">
                {editContentActive && (
                    <>
                        {ivQuestions && (
                            <div className="mb-8 flex flex-col gap-8">
                                {/* Force remount on page change with a key */}
                                {ivQuestions.length > 0 && <QCMEditor
                                    key={`qcm-${questionPage}`}
                                    deleteQuiz={() => {
                                        const newIvQuestions = ivQuestions.filter((_, index) => index !== questionPage - 1)
                                        setIvQuestions(newIvQuestions)
                                        setQuestionPage(Math.min(questionPage, newIvQuestions.length))
                                    }}
                                    initialQuestionGroup={ivQuestions[questionPage - 1]}
                                    onChange={(updated) => handleQuestionGroupChange(questionPage - 1, updated)}
                                    onSave={handleSaveChanges}
                                    documentId={documentId}
                                />}
                                <div className="flex flex-col gap-4 sm:flex-row justify-between sticky bottom-0 bg-white pt-4">
                                    <Button
                                        className="flex gap-2 w-full sm:w-fit items-center justify-center self-start h-fit"
                                        priority="secondary"
                                        onClick={() => {
                                            const newIvQuestions = [...ivQuestions, {
                                                timestamp: ivQuestions.length ? Math.max(...ivQuestions.map(q => q.timestamp || 0)) + 1 : 0,
                                                questions: [{
                                                    question: '',
                                                    answers: [
                                                        {
                                                            answer: 'Réponse A',
                                                            correct: false
                                                        },
                                                        {
                                                            answer: 'Réponse B',
                                                            correct: false
                                                        },
                                                    ]
                                                }]
                                            }];
                                            setIvQuestions(newIvQuestions)
                                            setQuestionPage(newIvQuestions.length)
                                        }}
                                    >
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M4.33398 4.33301V0.333008H5.66732V4.33301H9.66732V5.66634H5.66732V9.66634H4.33398V5.66634H0.333984V4.33301H4.33398Z" fill="#000091" />
                                        </svg>

                                        Ajouter un quiz
                                    </Button>
                                    {ivQuestions.length > 0 && <Pagination
                                        className='self-center'
                                        count={ivQuestions.length}
                                        defaultPage={questionPage}
                                        getPageLinkProps={(page) => ({
                                            onClick: () => setQuestionPage(page),
                                            href: "#",
                                        })}
                                        showFirstLast
                                    />}
                                </div>
                            </div>
                        )}

                        {ivDefinitions && (
                            <div className="mb-8 flex flex-col gap-8">
                                {/* Force remount on page change with a key */}
                                {ivDefinitions.length > 0 && <DefinitionEditor
                                    documentId={documentId}
                                    key={`def-${definitionPage}`}
                                    deleteDefinitionGroup={() => {
                                        const newIvDefinitionGroup = ivDefinitions.filter((_, index) => index !== questionPage - 1)
                                        setIvDefinitions(newIvDefinitionGroup)
                                        setDefinitionPage(Math.min(questionPage, newIvDefinitionGroup.length))
                                    }}
                                    initialDefinitionGroup={ivDefinitions[definitionPage - 1]}
                                    onChange={(updated) => handleDefinitionGroupChange(definitionPage - 1, updated)}
                                    onSave={handleSaveChanges}
                                />}

                                <div className="flex flex-col gap-4 sm:flex-row justify-between sticky bottom-0 bg-white pt-4">
                                    <Button
                                        className="flex gap-2 w-full sm:w-fit items-center justify-center self-start h-fit"
                                        priority="secondary"
                                        onClick={() => {
                                            const newIvDefinitions: InteractiveVideoDefinitionGroup[] = [...ivDefinitions, {
                                                timestamp: ivDefinitions.length ? Math.max(...ivDefinitions.map(q => q.timestamp || 0)) + 1 : 1,
                                                definitions: [{
                                                    notion: '',
                                                    definition: ''
                                                }]
                                            }];
                                            console.log("newIvDefinitions", ivDefinitions.map(q => q.timestamp || 0), newIvDefinitions)
                                            setIvDefinitions(newIvDefinitions)
                                            setDefinitionPage(newIvDefinitions.length)
                                        }}
                                    >
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M4.33398 4.33301V0.333008H5.66732V4.33301H9.66732V5.66634H5.66732V9.66634H4.33398V5.66634H0.333984V4.33301H4.33398Z" fill="#000091" />
                                        </svg>

                                        Ajouter une définition
                                    </Button>
                                    {ivDefinitions.length > 0 && <Pagination
                                        className='self-center'
                                        count={ivDefinitions.length}
                                        defaultPage={definitionPage}
                                        getPageLinkProps={(page) => ({
                                            onClick: () => setDefinitionPage(page),
                                            href: "#",
                                        })}
                                        showFirstLast
                                    />}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}