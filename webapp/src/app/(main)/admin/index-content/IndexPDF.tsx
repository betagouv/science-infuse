'use client'

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import RenderImportedFile from '@/course_editor/components/CourseSettings/components/RenderImportedFile';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { apiClient } from '@/lib/api-client';
import { useSnackbar } from '@/app/SnackBarProvider';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Input from '@codegouvfr/react-dsfr/Input';
import { Checkbox } from '@codegouvfr/react-dsfr/Checkbox';
import { IndexingContentType } from '@/types/queueing';
import DocumentTagPicker from './DocumentTagPicker';
import { DocumentTag } from '@prisma/client';

interface FileInfo {
    id: string;
    file: File;
    isUploading: boolean;
    isIndexing: boolean;
    isDisabled: boolean;
    isFromDraft?: boolean;
    draftFileId?: string;
}

const IndexPDF = () => {
    const { data: session } = useSession();
    const user = session?.user;
    const searchParams = useSearchParams();
    const router = useRouter();
    const draftId = searchParams.get('draftId');

    const { showSnackbar } = useSnackbar();

    const [files, setFiles] = useState<FileInfo[]>([]);
    const [title, setTitle] = useState('');
    const [credit, setCredit] = useState('');
    const [source, setSource] = useState('Universcience');
    const [isDownloadable, setIsDownloadable] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [description, setDescription] = useState('');
    const [isGlobalIndexing, setIsGlobalIndexing] = useState(false);
    const [selectedDocumentTags, setSelectedDocumentTags] = useState<DocumentTag[]>([]);
    const [isLoadingDraft, setIsLoadingDraft] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);

    // Load draft only if draftId is provided in URL
    useEffect(() => {
        if (user?.id && draftId) {
            loadDraft(draftId);
        }
    }, [user?.id, draftId]);

    const loadDraft = async (draftIdToLoad: string) => {
        try {
            setIsLoadingDraft(true);
            const response = await apiClient.getDraft(draftIdToLoad);
            
            if (response.draft) {
                setTitle(response.draft.title || '');
                setCredit(response.draft.credit || '');
                setSource(response.draft.source || 'Universcience');
                setIsDownloadable(response.draft.isDownloadable || false);
                setIdentifier(response.draft.identifier || '');
                setDescription(response.draft.description || '');
                setSelectedDocumentTags(response.draft.documentTags || []);
                
                // Create mock File objects for draft files (only PDFs)
                const draftFiles: FileInfo[] = response.draft.files
                    .filter((draftFile: any) => draftFile.mimeType === 'application/pdf')
                    .map((draftFile: any) => {
                        const mockFile = new File([''], draftFile.originalName, {
                            type: draftFile.mimeType,
                        });
                        
                        return {
                            id: `draft-${draftFile.id}`,
                            file: mockFile,
                            isUploading: false,
                            isIndexing: false,
                            isDisabled: false,
                            isFromDraft: true,
                            draftFileId: draftFile.id
                        };
                    });
                
                setFiles(draftFiles);
                
                showSnackbar(
                    <p className="m-0">
                        Brouillon "{response.draft.title || 'Sans titre'}" chargé avec succès.
                    </p>,
                    'success'
                );
            }
        } catch (error) {
            console.error('Error loading draft:', error);
            showSnackbar(
                <p className="m-0">Erreur lors du chargement du brouillon.</p>,
                'error'
            );
        } finally {
            setIsLoadingDraft(false);
        }
    };

    const saveDraft = async () => {
        try {
            setIsSavingDraft(true);
            const newFiles = files.filter(fi => !fi.isFromDraft);
            const fileList = newFiles.map(fi => fi.file);
            
            await apiClient.saveDraft({
                title,
                credit,
                source,
                isDownloadable,
                identifier,
                description,
                documentTagIds: selectedDocumentTags.map(tag => tag.id),
                files: fileList,
                draftId: draftId || undefined,
                contentType: 'pdf'
            });
            
            showSnackbar(
                <p className="m-0">
                    {draftId ? 'Brouillon mis à jour avec succès.' : 'Brouillon sauvegardé avec succès.'}
                </p>,
                'success'
            );
        } catch (error) {
            console.error('Error saving draft:', error);
            showSnackbar(
                <p className="m-0">Erreur lors de la sauvegarde du brouillon.</p>,
                'error'
            );
        } finally {
            setIsSavingDraft(false);
        }
    };

    const hasFormValues = () => {
        return (
            title.trim() !== '' ||
            credit.trim() !== '' ||
            source.trim() !== '' ||
            identifier.trim() !== '' ||
            description.trim() !== '' ||
            selectedDocumentTags.length > 0
        );
    }

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map(file => ({
            id: `${file.name}-${Date.now()}`,
            file,
            isUploading: false,
            isIndexing: false,
            isDisabled: false
        }));

        setFiles(prevFiles => {
            const uniqueFilesToAdd = newFiles.filter(newFile =>
                !prevFiles.some(prevFile => prevFile.file.name === newFile.file.name)
            );
            
            const addedCount = uniqueFilesToAdd.length;
            const duplicateCount = acceptedFiles.length - addedCount;
            
            // Schedule notification with correct values captured in closure
            setTimeout(() => {
                if (addedCount > 0) {
                    if (duplicateCount > 0) {
                        showSnackbar(
                            <p className="m-0">
                                {addedCount} PDF ajouté{addedCount > 1 ? 's' : ''}. 
                                {duplicateCount} fichier{duplicateCount > 1 ? 's' : ''} déjà présent{duplicateCount > 1 ? 's' : ''}.
                            </p>,
                            'success'
                        );
                    } else {
                        showSnackbar(
                            <p className="m-0">
                                {addedCount} PDF ajouté{addedCount > 1 ? 's' : ''} avec succès.
                            </p>,
                            'success'
                        );
                    }
                } else {
                    showSnackbar(
                        <p className="m-0">
                            Tous les PDF sont déjà présents dans la liste.
                        </p>,
                        'info'
                    );
                }
            }, 0);
            
            return [...prevFiles, ...uniqueFilesToAdd];
        });
    }, [showSnackbar]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
        },
        multiple: true
    });

    const indexFiles = async () => {
        // For PDFs: only Source is required
        if (!source.trim()) {
            showSnackbar(
                <p className="m-0">Veuillez remplir le champ obligatoire (Source).</p>,
                'error'
            );
            return;
        }

        if (files.length === 0) {
            showSnackbar(
                <p className="m-0">Veuillez ajouter des PDF à indexer.</p>,
                'error'
            );
            return;
        }

        setIsGlobalIndexing(true);
        
        const allFilesToIndex = [];
        
        const newFiles = files.filter(fi => !fi.isFromDraft);
        for (const fileInfo of newFiles) {
            allFilesToIndex.push({
                file: fileInfo.file,
                name: fileInfo.file.name
            });
        }
        
        const draftFilesArray = files.filter(fi => fi.isFromDraft);
        for (const draftFileInfo of draftFilesArray) {
            if (draftFileInfo.draftFileId) {
                allFilesToIndex.push({
                    file: draftFileInfo.file,
                    name: draftFileInfo.file.name,
                    isDraftFile: true,
                    draftFileId: draftFileInfo.draftFileId
                });
            }
        }

        const indexPromises = allFilesToIndex.map(async (fileData): Promise<true | false | { conflict: true; id?: string }> => {
            try {
                await apiClient.indexContent({
                    content: fileData.file,
                    type: IndexingContentType.file,
                    author: source.trim(),
                    documentTags: selectedDocumentTags,
                    isExternal: false,
                    title: title.trim() || undefined,
                    credit: credit.trim() || undefined,
                    isDownloadable: isDownloadable,
                    identifier: identifier.trim(),
                    description: description.trim(),
                    draftFileId: fileData.draftFileId
                });
                return true;
            } catch (error: any) {
                console.error(`Error indexing ${fileData.name}:`, error);
                if (error?.response?.status === 409) {
                    return { conflict: true, id: error?.response?.data?.id };
                }
                return false;
            }
        });

        const results = await Promise.all(indexPromises);

        const successCount = results.filter((r): r is true => r === true).length;
        const failureCount = results.filter(r => r !== true).length;
        const conflictResults = results.filter((r): r is { conflict: true; id?: string } => typeof r === 'object' && r !== null && 'conflict' in r && r.conflict === true);

        const resetForm = () => {
            setFiles([]);
            setTitle('');
            setCredit('');
            setSource('Universcience');
            setIsDownloadable(false);
            setIdentifier('');
            setDescription('');
            setSelectedDocumentTags([]);
            setIsGlobalIndexing(false);
        };

        if (successCount > 0 && draftId) {
            try {
                await apiClient.deleteDraftById(draftId);
                showSnackbar(
                    <p className="m-0">
                        {successCount} PDF ajouté(s) à la liste d'indexation, {failureCount} échec(s). Brouillon supprimé.
                    </p>,
                    'success'
                );
            } catch (error) {
                console.error('Error deleting draft after indexing:', error);
                showSnackbar(
                    <p className="m-0">
                        {successCount} PDF ajouté(s) à la liste d'indexation, {failureCount} échec(s). Erreur lors de la suppression du brouillon.
                    </p>,
                    'success'
                );
            }
            setTimeout(() => {
                resetForm();
                router.push('/admin/tasks-list');
            }, 2000);
        } else if (successCount > 0) {
            showSnackbar(
                <p className="m-0">
                    {successCount} PDF ajouté(s) à la liste d'indexation, {failureCount} échec(s).
                </p>,
                'success'
            );
            setTimeout(() => {
                resetForm();
                router.push('/admin/tasks-list');
            }, 2000);
        } else {
            if (conflictResults.length > 0) {
                const existingId = conflictResults[0]?.id;
                showSnackbar(
                    <p className="m-0">
                        Ce PDF existe déjà dans l'index{existingId ? ` avec l'id : ${existingId}` : ''}.
                    </p>,
                    'error'
                );
            } else {
                showSnackbar(
                    <p className="m-0">
                        {successCount} PDF ajouté(s) à la liste d'indexation, {failureCount} échec(s).
                    </p>,
                    'error'
                );
            }
            setIsGlobalIndexing(false);
        }
    }

    const removeFile = (fileId: string) => {
        setFiles(prevFiles => prevFiles.filter(fi => fi.id !== fileId));
    }

    return (
        <div className="flex flex-col items-center">
            <div
                {...getRootProps()}
                className="flex flex-col w-full items-center gap-2 p-4 sm:p-6 rounded-lg"
                style={{
                    ...(isDragActive ? { outline: '2px dashed #000091', outlineOffset: '-2px' } : {})
                }}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center gap-4">
                    <svg width={32} height={32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-grow-0 flex-shrink-0 w-8 h-8" preserveAspectRatio="none">
                        <circle cx={16} cy={16} r={16} fill="#000091" />
                        <path d="M12 10h5l3 3v9c0 .5-.5 1-1 1h-7c-.5 0-1-.5-1-1V11c0-.5.5-1 1-1z" stroke="white" strokeWidth="1.5" fill="none" />
                        <path d="M13 15h6M13 17h6M13 19h4" stroke="white" strokeWidth="1" />
                    </svg>

                    <p className="m-0 text-lg font-medium text-center text-black">
                        {!isDragActive ? "Glissez et déposez un ou plusieurs PDF ici" : "Déposez vos PDF ici"}
                    </p>
                    <p className="m-0 text-sm text-center text-[#757575]">
                        Format accepté : PDF
                    </p>
                </div>
            </div>

            <div className="w-full space-y-4">
                <Input
                    label="Source *"
                    nativeInputProps={{
                        type: "text",
                        value: source,
                        onChange: (e) => setSource(e.target.value),
                        placeholder: "Entité contributrice",
                        required: true
                    }}
                    className="w-full"
                />

                <Input
                    label="Titre"
                    hintText="Optionnel"
                    nativeInputProps={{
                        type: "text",
                        value: title,
                        onChange: (e) => setTitle(e.target.value),
                        placeholder: "Texte court de présentation",
                    }}
                    className="w-full"
                />

                <Input
                    label="Crédit"
                    hintText="Optionnel"
                    nativeInputProps={{
                        type: "text",
                        value: credit,
                        onChange: (e) => setCredit(e.target.value),
                        placeholder: "Mentions légales de propriété intellectuelle",
                    }}
                    className="w-full"
                />

                <Input
                    label="Identifiant"
                    nativeInputProps={{
                        type: "text",
                        value: identifier,
                        onChange: (e) => setIdentifier(e.target.value),
                        placeholder: "Pour faciliter l'intégration future du connecteur de DAM"
                    }}
                    className="w-full"
                />

                <Input
                    label="Description"
                    textArea={true}
                    nativeTextAreaProps={{
                        value: description,
                        onChange: (e) => setDescription(e.target.value),
                        placeholder: "Description détaillée du contenu",
                        rows: 4
                    }}
                    className="w-full"
                />

                <DocumentTagPicker selectedDocumentTags={selectedDocumentTags} setSelectedDocumentTags={setSelectedDocumentTags} />

                <Checkbox
                    options={[{
                        label: "Téléchargeable",
                        nativeInputProps: {
                            name: "downloadable",
                            value: "downloadable",
                            checked: isDownloadable,
                            onChange: (e) => setIsDownloadable(e.target.checked)
                        }
                    }]}
                    hintText="(Permet de contrôler si l'utilisateur final peut télécharger le fichier original)"
                />
            </div>
            {draftId && (
                <div className="w-full text-xs text-blue-600 text-center">
                    Brouillon chargé
                </div>
            )}

            {files.map((fileInfo) => (
                <div key={fileInfo.id} className="flex flex-col gap-4 w-full items-center">
                    <RenderImportedFile
                        isUploading={fileInfo.isUploading}
                        file={fileInfo.file}
                        onRemove={() => removeFile(fileInfo.id)}
                    />
                </div>
            ))}

            {hasFormValues() && (
                <div className="w-full flex flex-col sm:flex-row gap-2 justify-center items-center">
                    <Button
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-white"
                        onClick={saveDraft}
                        disabled={isGlobalIndexing || isSavingDraft}
                    >
                        {isSavingDraft ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                {draftId ? 'Mise à jour...' : 'Sauvegarde...'}
                            </>
                        ) : (
                            draftId ? "Mettre à jour le brouillon" : "Enregistrer comme brouillon"
                        )}
                    </Button>
                    
                    {files.length > 0 && (
                        <Button
                            className="bg-black"
                            onClick={indexFiles}
                            disabled={isGlobalIndexing}
                        >
                            {isGlobalIndexing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Indexation en cours...
                                </>
                            ) : (
                                "Commencer l'indexation"
                            )}
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}

export default IndexPDF;
