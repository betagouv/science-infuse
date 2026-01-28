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

const modal = createModal({
    id: "modal-quit-mots-croises-without-saving",
    isOpenedByDefault: false
});

//////////////////////////////
// Types                    //
//////////////////////////////

export interface CrosswordWord {
    answer: string;
    clue: string;
}

export interface CrosswordSet {
    words: CrosswordWord[];
}

//////////////////////////////
// API Functions            //
//////////////////////////////

export const generateMotsCroisesData = async (params: { documentId: string }): Promise<[Error | null, CrosswordSet | null]> => {
    try {
        const response = await apiClient.generateMotsCroises(params.documentId);
        return [null, response];
    } catch (error) {
        return [error as Error, null];
    }
};

const buildContextFromScope = async (params: { documentId: string; scope: GenerationSourceScope }): Promise<string> => {
    const doc = await apiClient.getDocument(params.documentId);
    const chunks = (doc?.chunks || []) as any[];

    if (params.scope.mode === 'chunk') {
        const scope = params.scope;
        const picked = chunks.find(c => c.id === scope.chunkId);
        return (picked?.text || '').toString();
    }

    return chunks.map(c => (c?.text || '').toString()).join("\n\n");
}

export const LLMGenerateMotsCroisesClue = async (answer: string, documentId?: string): Promise<[Error | null, string | null]> => {
    try {
        const response = await apiClient.generateMotsCroisesClue(answer, documentId);
        return [null, response];
    } catch (error) {
        return [error as Error, null];
    }
};

//////////////////////////////
// MotsCroises Editor Component //
//////////////////////////////

type MotsCroisesEditorProps = {
    initialWords: CrosswordWord[];
    onChange: (updated: CrosswordWord[]) => void;
    onSave: () => Promise<void>;
    documentId: string;
};

const MotsCroisesEditor: React.FC<MotsCroisesEditorProps> = ({ initialWords, onChange, onSave, documentId }) => {
    const [words, setWords] = useState(initialWords);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loadingClues, setLoadingClues] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        setWords(initialWords);
    }, [initialWords]);

    const updateWords = useCallback(
        (updated: CrosswordWord[]) => {
            setWords(updated);
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

    const handleAnswerChange = (index: number, newAnswer: string) => {
        const updated = words.map((word, i) =>
            i === index ? { ...word, answer: newAnswer } : word
        );
        updateWords(updated);
    };

    const handleClueChange = (index: number, newClue: string) => {
        const updated = words.map((word, i) =>
            i === index ? { ...word, clue: newClue } : word
        );
        updateWords(updated);
    };

    const addWord = () => {
        const newWord: CrosswordWord = {
            answer: "",
            clue: "",
        };
        updateWords([...words, newWord]);
    };

    const removeWord = (index: number) => {
        const updated = words.filter((_, i) => i !== index);
        updateWords(updated);
    };

    const duplicateWord = (index: number) => {
        const wordToDuplicate = { ...words[index] };
        const updated = [...words.slice(0, index + 1), wordToDuplicate, ...words.slice(index + 1)];
        updateWords(updated);
    };

    const moveWord = (fromIndex: number, toIndex: number) => {
        const updated = [...words];
        const [movedWord] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, movedWord);
        updateWords(updated);
    };

    const generateClue = async (index: number) => {
        const answer = words[index].answer;
        if (!answer.trim()) {
            toast.error('Veuillez d\'abord saisir un mot');
            return;
        }

        setLoadingClues(prev => ({ ...prev, [index]: true }));
        const [error, clue] = await LLMGenerateMotsCroisesClue(answer, documentId);
        if (error) {
            toast.error('Une erreur est survenue lors de la génération de l\'indice');
        }
        if (clue) {
            handleClueChange(index, clue);
        }
        setLoadingClues(prev => ({ ...prev, [index]: false }));
    };

    return (
        <div id="mots-croises-wrapper" className="flex flex-col items-center gap-4 relative">
            <StickyShadow className="flex w-full flex-col sm:flex-row justify-between items-center">
                <p className="m-0 mb-4 sm:mb-0 text-2xl font-bold text-left text-[#000091] self-center">Mots croisés</p>

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

            {words.length === 0 && (
                <CallOut
                    iconId="ri-information-line"
                    title="Aucun mot"
                >
                    Pour commencer, ajoutez un mot en cliquant sur
                    <Button
                        className="!my-0 !ml-2 !inline-block p-2"
                        priority="secondary"
                        onClick={addWord}
                        size='small'
                    >
                        Ajouter un mot
                    </Button>
                </CallOut>
            )}

            {words.map((word, index) => (
                <div key={index} className="relative w-full shadow-[inset_0_0_0_1px_#000091] p-8">
                    <div className="flex w-full justify-between mb-4">
                        <p className="m-0 font-medium text-lg text-[#161616]">Mot {index + 1}</p>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => moveWord(index, Math.max(0, index - 1))}
                                disabled={index === 0}
                                priority="tertiary"
                                size="small"
                                title="Déplacer vers le haut"
                                iconId="fr-icon-arrow-up-line"
                            />
                            <Button
                                onClick={() => moveWord(index, Math.min(words.length - 1, index + 1))}
                                disabled={index === words.length - 1}
                                priority="tertiary"
                                size="small"
                                title="Déplacer vers le bas"
                                iconId="fr-icon-arrow-down-line"
                            />
                            <Button
                                onClick={() => duplicateWord(index)}
                                priority="tertiary"
                                size="small"
                                title="Dupliquer le mot"
                                iconId="fr-icon-clipboard-fill"
                            />
                            <DeleteButton
                                onClick={() => removeWord(index)}
                                className="text-red-500"
                                iconId="fr-icon-delete-bin-line"
                                title="Supprimer le mot"
                                size='small'
                                priority="secondary"
                            />
                        </div>
                    </div>

                    <Input
                        label="Mot"
                        className='w-full mb-4'
                        nativeInputProps={{
                            placeholder: "Saisissez le mot...",
                            value: word.answer,
                            onChange: (e) => handleAnswerChange(index, e.target.value),
                            required: true,
                        }}
                    />

                    <Input
                        label="Définition / Indice"
                        className='w-full'
                        textArea={true}
                        addon={
                            word.clue.length === 0 && word.answer.trim().length > 0 && (
                                <Button
                                    disabled={loadingClues[index]}
                                    onClick={() => generateClue(index)}
                                    priority="tertiary"
                                    className="whitespace-nowrap gap-2"
                                >
                                    {loadingClues[index] ? <CircularProgress size={20} /> : <AutoAwesome />}
                                    Générer un indice
                                </Button>
                            )
                        }
                        nativeTextAreaProps={{
                            placeholder: "Saisissez la définition ou l'indice...",
                            value: word.clue,
                            onChange: (e) => handleClueChange(index, e.target.value),
                            required: true,
                            rows: 3,
                        }}
                    />
                </div>
            ))}

            <Button
                onClick={addWord}
                className="justify-center flex gap-2 items-center w-full sm:w-auto"
                priority="secondary"
            >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.33398 4.33301V0.333008H5.66732V4.33301H9.66732V5.66634H5.66732V9.66634H4.33398V5.66634H0.333984V4.33301H4.33398Z" fill="#000091" />
                </svg>
                Ajouter un mot
            </Button>
        </div>
    );
};

//////////////////////////////
// Main MotsCroises Manager   //
//////////////////////////////

export default function MotsCroisesManager(props: { 
    documentId: string, 
    onBackClicked?: () => void, 
    onDocumentProcessingEnd?: () => void 
}) {
    const { documentId, onDocumentProcessingEnd } = props;
    const [words, setWords] = useState<CrosswordWord[] | undefined>([]);
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

    const [generationScope, setGenerationScope] = useState<GenerationSourceScope>({ mode: 'document' });

    const updateMotsCroises = useCallback(async (documentId: string, words: CrosswordWord[]) => {
        setIsSaving(true);
        try {
            const data: ExportH5pResponse = await apiClient.exportH5p({
                h5pContentId: h5pContentId,
                type: 'mots-croises',
                data: {
                    words,
                    documentId: documentId,
                },
                documentIds: documentId ? [documentId] : [],
            });
            
            if (data) {
                setPreviewUrl(data.embedUrl);
                setDownloadH5pUrl(data.downloadH5p);
                setDownloadHTMLUrl(data.downloadHTML);
                setH5pContentId(data.h5pContentId);
                setRefreshKey(prev => prev + 1);
            }
        } finally {
            setIsSaving(false);
        }
    }, [h5pContentId]);

    const handleSaveChanges = useCallback(async () => {
        if (words && documentId) {
            await updateMotsCroises(documentId, words);
            alertToast.success("Succès", "Changements enregistrés");
        }
    }, [words, documentId, updateMotsCroises, alertToast]);

    const generateMotsCroises = useCallback(async () => {
        setProcessingDone(false);
        setIsLoading(true);
        setWords([]);
        
        // Stop parent loading indicator since we're showing our own
        onDocumentProcessingEnd && onDocumentProcessingEnd();
        
        try {
            if (!documentId) {
                console.warn("Document ID manquant");
                return;
            }

            const context = await buildContextFromScope({ documentId, scope: generationScope });
            const [error, motsCroisesData] = await (async () => {
                try {
                    const response = await apiClient.generateMotsCroisesFromText(context);
                    return [null, response] as [null, CrosswordSet];
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
                console.log("ERROR GENERATING MOTS CROISES", error);
                return;
            }
            
            if (!motsCroisesData) return;
            
            setWords(motsCroisesData.words);
            
            await updateMotsCroises(documentId, motsCroisesData.words);
        } finally {
            setIsLoading(false);
            setProcessingDone(true);
        }
    }, [documentId, updateMotsCroises, onDocumentProcessingEnd, alertToast, generationScope]);

    const handleWordsChange = useCallback(
        (updated: CrosswordWord[]) => {
            setWords(updated);
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
        if (documentId && isInitialLoad.current) {
            isInitialLoad.current = false;
            generateMotsCroises();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documentId]);

    return (
        <>
            {document.getElementById("mots-croises-back-portal") ? createPortal(
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
                document.getElementById("mots-croises-back-portal") as HTMLElement
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
            )}

            <div className="w-full relative flex flex-col gap-8">
                <modal.Component title="">
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2 items-center">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M16.5633 9.66673L9.41132 2.51473L11.2967 0.629395L21.6673 11.0001L11.2967 21.3707L9.41132 19.4854L0.333984 4.99999L4.57665 0.757324L5.51932 1.69999L2.21932 4.99999Z" fill="#161616" />
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
                        <p className="mt-4 text-lg text-gray-600">Génération des mots croisés en cours...</p>
                    </div>
                )}

                {processingDone && (
                    <p className="text-base text-left">
                        <span className="font-bold text-[#18753c]">Analyse terminée ! </span>
                        <br />
                        <span className="text-black">
                            Voici une suggestion de mots croisés pour faciliter l'apprentissage :
                        </span>
                    </p>
                )}

                {/* H5P PREVIEW */}
                {h5pContentId && <H5PRenderer key={refreshKey} h5pContentId={h5pContentId} />}

                {processingDone && (
                    <div className="w-full">
                        <DocumentChunkScopePicker
                            documentId={documentId}
                            value={generationScope}
                            onChange={setGenerationScope}
                        />
                        <div className="flex flex-wrap items-center gap-4 mt-4">
                            <Button
                                priority="secondary"
                                className="w-full sm:w-fit justify-center"
                                onClick={() => generateMotsCroises()}
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
                                Modifier les mots croisés
                            </Button>

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

                {processingDone && editContentActive && words && (
                    <>
                        <hr />
                        <p className="m-0 text-[28px] font-bold text-left text-gray-900">Modifier les mots croisés</p>
                        <p className="m-0 text-base text-left text-black">
                            Personnalisez les mots et définitions générés, ou ajoutez vos propres mots croisés. 
                            Vos modifications seront sauvegardées dans votre espace personnel.
                        </p>

                        <MotsCroisesEditor
                            initialWords={words}
                            onChange={handleWordsChange}
                            onSave={handleSaveChanges}
                            documentId={documentId}
                        />
                    </>
                )}
            </div>
        </>
    );
}
