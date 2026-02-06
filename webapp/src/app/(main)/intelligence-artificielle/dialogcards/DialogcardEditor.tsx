'use client'
import toast from 'react-hot-toast';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import Button from '@codegouvfr/react-dsfr/Button';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { CircularProgress } from "@mui/material";
import { apiClient } from "@/lib/api-client";
import { ExportH5pResponse } from "@/types/api";
import H5PRenderer from '@/app/(main)/mediaViewers/H5PRenderer';
import AutoAwesome from '@mui/icons-material/AutoAwesomeOutlined';
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { createPortal } from 'react-dom';
import CallOut from '@codegouvfr/react-dsfr/CallOut';
import StickyShadow from '@/components/StickyShadown';
import { useAlertToast } from '@/components/AlertToast';
import { DeleteButton } from '../shared/components';
import { DocumentChunkScopePicker, type GenerationSourceScope } from '../shared/components';
import { H5PManagerSource, buildParamsFromScope } from '../shared/types';

const modal = createModal({
    id: "modal-quit-dialogcards-without-saving",
    isOpenedByDefault: false
});

//////////////////////////////
// Types                    //
//////////////////////////////

export interface Dialogcard {
    question: string;
    answer: string;
}

export interface DialogcardSet {
    cards: Dialogcard[];
}

//////////////////////////////
// API Functions            //
//////////////////////////////

export const generateDialogcardsData = async (params: { documentId?: string; chunkId?: string }): Promise<[Error | null, DialogcardSet | null]> => {
    try {
        const response = await apiClient.generateDialogcards(params);
        return [null, response];
    } catch (error) {
        return [error as Error, null];
    }
};

export const LLMGenerateDialogcardAnswer = async (question: string, documentId?: string): Promise<[Error | null, string | null]> => {
    try {
        // Replace with your actual API call
        const response = await apiClient.generateDialogcardAnswer(question, documentId);
        return [null, response];
    } catch (error) {
        return [error as Error, null];
    }
};

//////////////////////////////
// Dialogcard Editor Component //
//////////////////////////////

type DialogcardEditorProps = {
    initialCards: Dialogcard[];
    onChange: (updated: Dialogcard[]) => void;
    onSave: () => Promise<void>;
    documentId?: string;
};

const DialogcardEditor: React.FC<DialogcardEditorProps> = ({ initialCards, onChange, onSave, documentId }) => {
    const [cards, setCards] = useState(initialCards);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loadingAnswers, setLoadingAnswers] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        setCards(initialCards);
    }, [initialCards]);

    const updateCards = useCallback(
        (updated: Dialogcard[]) => {
            setCards(updated);
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
        const updated = cards.map((card, i) =>
            i === index ? { ...card, question: newQuestion } : card
        );
        updateCards(updated);
    };

    const handleAnswerChange = (index: number, newAnswer: string) => {
        const updated = cards.map((card, i) =>
            i === index ? { ...card, answer: newAnswer } : card
        );
        updateCards(updated);
    };

    const addCard = () => {
        const newCard: Dialogcard = {
            question: "",
            answer: "",
        };
        updateCards([...cards, newCard]);
    };

    const removeCard = (index: number) => {
        const updated = cards.filter((_, i) => i !== index);
        updateCards(updated);
    };

    const duplicateCard = (index: number) => {
        const cardToDuplicate = { ...cards[index] };
        const updated = [...cards.slice(0, index + 1), cardToDuplicate, ...cards.slice(index + 1)];
        updateCards(updated);
    };

    const moveCard = (fromIndex: number, toIndex: number) => {
        const updated = [...cards];
        const [movedCard] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, movedCard);
        updateCards(updated);
    };

    const generateAnswer = async (index: number) => {
        const question = cards[index].question;
        if (!question.trim()) {
            toast.error('Veuillez d\'abord saisir une question');
            return;
        }

        setLoadingAnswers(prev => ({ ...prev, [index]: true }));
        const [error, answer] = await LLMGenerateDialogcardAnswer(question, documentId);
        if (error) {
            toast.error('Une erreur est survenue lors de la génération de la réponse');
        }
        if (answer) {
            handleAnswerChange(index, answer);
        }
        setLoadingAnswers(prev => ({ ...prev, [index]: false }));
    };

    return (
        <div id="dialogcard-wrapper" className="flex flex-col items-center gap-4 relative">
            <StickyShadow className="flex w-full flex-col sm:flex-row justify-between items-center">
                <p className="m-0 mb-4 sm:mb-0 text-2xl font-bold text-left text-[#000091] self-center">Dialogcards</p>

                <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto sm:ml-auto gap-2">
                    {hasChanges && (
                        <Button
                            onClick={handleSave}
                            priority="primary"
                            disabled={isSaving}
                            size='medium'
                            className="w-full justify-center sm:w-auto"
                        >
                            {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                        </Button>
                    )}
                </div>
            </StickyShadow>

            {cards.length === 0 && (
                <CallOut
                    iconId="ri-information-line"
                    title="Aucune dialogcard"
                >
                    Pour commencer, ajoutez une dialogcard en cliquant sur
                    <Button
                        className="!my-0 !ml-2 !inline-block p-2"
                        priority="secondary"
                        onClick={addCard}
                        size='small'
                    >
                        Ajouter une dialogcard
                    </Button>
                </CallOut>
            )}

            {cards.map((card, index) => (
                <div key={index} className="relative w-full shadow-[inset_0_0_0_1px_#000091] p-8">
                    <div className="flex w-full justify-between mb-4">
                        <p className="m-0 font-medium text-lg text-[#161616]">Dialogcard {index + 1}</p>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => moveCard(index, Math.max(0, index - 1))}
                                disabled={index === 0}
                                priority="tertiary"
                                size="small"
                                title="Déplacer vers le haut"
                                iconId="fr-icon-arrow-up-line"
                            />
                            <Button
                                onClick={() => moveCard(index, Math.min(cards.length - 1, index + 1))}
                                disabled={index === cards.length - 1}
                                priority="tertiary"
                                size="small"
                                title="Déplacer vers le bas"
                                iconId="fr-icon-arrow-down-line"
                            />
                            <Button
                                onClick={() => duplicateCard(index)}
                                priority="tertiary"
                                size="small"
                                title="Dupliquer la dialogcard"
                                iconId="fr-icon-clipboard-fill"
                            />
                            <DeleteButton
                                onClick={() => removeCard(index)}
                                className="text-red-500"
                                iconId="fr-icon-delete-bin-line"
                                title="Supprimer la dialogcard"
                                size='small'
                                priority="secondary"
                            />
                        </div>
                    </div>

                    <Input
                        label="Question"
                        className='w-full mb-4'
                        textArea={true}
                        nativeTextAreaProps={{
                            placeholder: "Saisissez votre question...",
                            value: card.question,
                            onChange: (e) => handleQuestionChange(index, e.target.value),
                            required: true,
                            rows: 3,
                        }}
                    />

                    <Input
                        label="Réponse"
                        className='w-full'
                        textArea={true}
                        addon={
                            card.answer.length === 0 && card.question.trim().length > 0 && (
                                <Button
                                    disabled={loadingAnswers[index]}
                                    onClick={() => generateAnswer(index)}
                                    priority="tertiary"
                                    className="whitespace-nowrap gap-2"
                                >
                                    {loadingAnswers[index] ? <CircularProgress size={20} /> : <AutoAwesome />}
                                    Générer une réponse
                                </Button>
                            )
                        }
                        nativeTextAreaProps={{
                            placeholder: "Saisissez la réponse...",
                            value: card.answer,
                            onChange: (e) => handleAnswerChange(index, e.target.value),
                            required: true,
                            rows: 4,
                        }}
                    />
                </div>
            ))}

            <Button
                onClick={addCard}
                className="justify-center flex gap-2 items-center w-full sm:w-auto"
                priority="secondary"
            >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.33398 4.33301V0.333008H5.66732V4.33301H9.66732V5.66634H5.66732V9.66634H4.33398V5.66634H0.333984V4.33301H4.33398Z" fill="#000091" />
                </svg>
                Ajouter une dialogcard
            </Button>
        </div>
    );
};

//////////////////////////////
// Main Dialogcard Manager   //
//////////////////////////////

export default function DialogcardManager(props: {
    source: H5PManagerSource;
    onBackClicked?: () => void;
    onDocumentProcessingEnd?: () => void;
    hideBackButton?: boolean;
    onH5PGenerated?: (h5pId: string) => void;
}) {
    const { source, onDocumentProcessingEnd, hideBackButton = false, onH5PGenerated } = props;
    const [dialogcards, setDialogcards] = useState<Dialogcard[] | undefined>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editContentActive, setEditContentActive] = useState(false);
    const [processingDone, setProcessingDone] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [downloadH5pUrl, setDownloadH5pUrl] = useState<string | null>(null);
    const [downloadHTMLUrl, setDownloadHTMLUrl] = useState<string | null>(null);
    const [h5pContentId, setH5pContentId] = useState<string | undefined>();
    const [isSaving, setIsSaving] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const alertToast = useAlertToast();
    const isInitialLoad = useRef(true);

    // Local state for document scope (only used when source.type === 'document')
    const [generationScope, setGenerationScope] = useState<GenerationSourceScope>(
        source.type === 'document' && source.scope
            ? source.scope
            : { mode: 'document' }
    );

    // Helper to determine if we're in document mode
    const isDocumentMode = source.type === 'document';
    const documentId = isDocumentMode ? source.documentId : undefined;

    const updateDialogcards = useCallback(async (docId: string, cards: Dialogcard[]) => {
        setIsSaving(true);
        try {
            const data: ExportH5pResponse = await apiClient.exportH5p({
                h5pContentId: h5pContentId,
                type: 'dialogcards',
                data: {
                    cards,
                    documentId: docId,
                } as any,
                documentIds: docId ? [docId] : [],
            });
            
            if (data) {
                setPreviewUrl(data.embedUrl);
                setDownloadH5pUrl(data.downloadH5p);
                setDownloadHTMLUrl(data.downloadHTML);
                setH5pContentId(data.h5pContentId);
                setRefreshKey(prev => prev + 1);
                onH5PGenerated?.(data.h5pContentId);
            }
        } finally {
            setIsSaving(false);
        }
    }, [h5pContentId, onH5PGenerated]);

    const handleSaveChanges = useCallback(async () => {
        if (!dialogcards) return;
        
        if (isDocumentMode && documentId) {
            // Document mode: save to document
            await updateDialogcards(documentId, dialogcards);
            alertToast.success("Succès", "Changements enregistrés");
        } else {
            // AdditionalContext mode: export H5P without a document
            setIsSaving(true);
            try {
                const data: ExportH5pResponse = await apiClient.exportH5p({
                    h5pContentId: h5pContentId,
                    type: 'dialogcards',
                    data: {
                        cards: dialogcards,
                        documentId: '',
                    } as any,
                    documentIds: [],
                });
                
                if (data) {
                    setPreviewUrl(data.embedUrl);
                    setDownloadH5pUrl(data.downloadH5p);
                    setDownloadHTMLUrl(data.downloadHTML);
                    setH5pContentId(data.h5pContentId);
                    setRefreshKey(prev => prev + 1);
                    onH5PGenerated?.(data.h5pContentId);
                }
                alertToast.success("Succès", "Dialogcards mises à jour avec succès");
            } finally {
                setIsSaving(false);
            }
        }
    }, [dialogcards, isDocumentMode, documentId, updateDialogcards, alertToast, h5pContentId, onH5PGenerated]);

    const generateDialogcards = useCallback(async () => {
        setProcessingDone(false);
        setIsLoading(true);
        setDialogcards([]);
        
        // Stop parent loading indicator since we're showing our own
        onDocumentProcessingEnd && onDocumentProcessingEnd();
        
        try {
            let apiParams: { documentId?: string; chunkId?: string; additionalContext?: string } = {};
            
            if (source.type === 'additionalContext') {
                // Use additionalContext when provided (from H5PSourcePicker)
                apiParams = { additionalContext: source.context };
            } else if (source.type === 'document') {
                // Use documentId/chunkId when available
                apiParams = buildParamsFromScope({
                    documentId: source.documentId,
                    scope: generationScope
                });
            } else {
                console.warn("Source manquant");
                return;
            }

            const [error, dialogcardData] = await (async () => {
                try {
                    const response = await apiClient.generateDialogcards(apiParams);
                    return [null, response] as [null, DialogcardSet];
                } catch (e) {
                    return [e as Error, null] as [Error, null];
                }
            })();
            
            if (error) {
                alertToast.error(
                    "Erreur",
                    `Le traitement a échoué`
                );
                handleQuitWithoutSave();
                console.log("ERROR GENERATING DIALOGCARDS", error);
                return;
            }
            
            if (!dialogcardData) return;
            
            setDialogcards(dialogcardData.cards);
            
            if (source.type === 'document') {
                // Document mode: save and export
                await updateDialogcards(source.documentId, dialogcardData.cards);
            } else {
                // AdditionalContext mode: just export without saving
                const exportData = {
                    cards: dialogcardData.cards,
                    documentId: '',
                };
                const data: ExportH5pResponse = await apiClient.exportH5p({
                    h5pContentId: h5pContentId,
                    type: 'dialogcards',
                    data: exportData as any,
                    documentIds: [],
                });
                
                if (data) {
                    setPreviewUrl(data.embedUrl);
                    setDownloadH5pUrl(data.downloadH5p);
                    setDownloadHTMLUrl(data.downloadHTML);
                    setH5pContentId(data.h5pContentId);
                    setRefreshKey(prev => prev + 1);
                    onH5PGenerated?.(data.h5pContentId);
                }
            }
        } finally {
            setIsLoading(false);
            setProcessingDone(true);
        }
    }, [source, updateDialogcards, onDocumentProcessingEnd, alertToast, generationScope, h5pContentId]);

    const handleDialogcardsChange = useCallback(
        (updated: Dialogcard[]) => {
            setDialogcards(updated);
        },
        []
    );

    const handleSaveAndQuit = async () => {
        modal.close();
        await handleSaveChanges();
        props.onBackClicked && props.onBackClicked();
    };

    const handleQuitWithoutSave = () => {
        modal.close();
        props.onBackClicked && props.onBackClicked();
    };

    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            generateDialogcards();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {!hideBackButton && (
                document.getElementById("dialogcard-back-portal") ? createPortal(
                    <Button
                        className='flex justify-center self-start items-center gap-2 md:absolute relative mb-4'
                        priority='secondary'
                        onClick={() => modal.open()}
                    >
                        <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M2.21932 4.99999L5.51932 8.29999L4.57665 9.24266L0.333984 4.99999L4.57665 0.757324L5.51932 1.69999L2.21932 4.99999Z" fill="#000091" />
                        </svg>
                        Retour
                    </Button>,
                    document.getElementById("dialogcard-back-portal") as HTMLElement
                ) : (
                    <Button
                        className='flex justify-center self-start items-center gap-2 xl:absolute xl:translate-x-[calc(-100%-2rem)] translate-x-0 relative'
                        priority='secondary'
                        onClick={() => modal.open()}
                    >
                        <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M2.21932 4.99999L5.51932 8.29999L4.57665 9.24266L0.333984 4.99999L4.57665 0.757324L5.51932 1.69999L2.21932 4.99999Z" fill="#000091" />
                        </svg>
                        Retour
                    </Button>
                )
            )}

            <div className="w-full relative flex flex-col gap-8">
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
                            <Button className="w-full justify-center sm:w-auto" onClick={handleSaveAndQuit}>
                                {isSaving ? "Enregistrement en cours" : "Enregistrer et quitter"}
                            </Button>
                            <Button className="w-full justify-center sm:w-auto" priority='secondary' onClick={handleQuitWithoutSave}>
                                Quitter sans enregistrer
                            </Button>
                        </div>
                    </div>
                </modal.Component>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <CircularProgress size={60} />
                        <p className="mt-4 text-lg text-gray-600">Génération des dialogcards en cours...</p>
                    </div>
                )}

                {processingDone && (
                    <p className="text-base text-left">
                        <span className="font-bold text-[#18753c]">Analyse terminée ! </span>
                        <br />
                        <span className="text-black">
                            Voici une suggestion de dialogcards pour faciliter l'apprentissage :
                        </span>
                    </p>
                )}

                {/* H5P PREVIEW */}
                {h5pContentId && <H5PRenderer key={refreshKey} h5pContentId={h5pContentId} />}

                {/* Source picker - only shown in document mode */}
                {processingDone && isDocumentMode && (
                    <div className="w-full">
                        <DocumentChunkScopePicker
                            documentId={documentId || ''}
                            value={generationScope}
                            onChange={setGenerationScope}
                        />
                        <div className="flex flex-wrap items-center gap-4 mt-4">
                            <Button
                                priority="secondary"
                                className="w-full sm:w-fit justify-center"
                                onClick={() => generateDialogcards()}
                            >
                                Régénérer avec cette source
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-4">
                    {processingDone && (
                        <>
                            <Button
                                className='block w-full justify-center sm:w-fit whitespace-nowrap'
                                disabled={editContentActive}
                                onClick={() => setEditContentActive(!editContentActive)}
                            >
                                Modifier les dialogcards
                            </Button>
                            {/* TODO: checkbox pour activer : {"randomCards": false,} */}

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
                        </>
                    )}
                </div>

                {processingDone && editContentActive && dialogcards && (
                    <>
                        <hr />
                        <p className="m-0 text-[28px] font-bold text-left text-gray-900">Modifier les dialogcards</p>
                        <p className="m-0 text-base text-left text-black">
                            Personnalisez les questions et réponses générées, ou ajoutez vos propres dialogcards. 
                            Vos modifications seront sauvegardées dans votre espace personnel.
                        </p>

                        <DialogcardEditor
                            initialCards={dialogcards}
                            onChange={handleDialogcardsChange}
                            onSave={handleSaveChanges}
                            documentId={documentId}
                        />
                    </>
                )}
            </div>
        </>
    );
}
