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
import * as exifr from 'exifr';

// IPTC fields we care about
const IPTC_FIELDS = [
    'ObjectName',
    'Caption',
    'Headline', 
    'Keywords',
    'Byline',
    'BylineTitle',
    'Writer',
    'Source',
    'Copyright',
    'CopyrightNotice',
    'City',
    'Country',
    'DateCreated',
    'TimeCreated',
];

const decodeHtmlEntities = (value: string): string => {
    if (typeof document === 'undefined') {
        return value;
    }
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    return textarea.value;
};

const decodeIptcText = (value?: string): string | undefined => {
    if (!value) {
        return value;
    }
    try {
        const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0));
        const decoded = new TextDecoder('utf-8').decode(bytes);
        const text = decoded.includes('\uFFFD') ? value : decoded;
        return decodeHtmlEntities(text);
    } catch {
        return decodeHtmlEntities(value);
    }
};

const normalizeMetadataText = (value: unknown): string | undefined => {
    if (!value) {
        return undefined;
    }
    if (typeof value === 'string') {
        const decoded = decodeIptcText(value)?.trim();
        if (!decoded) {
            return undefined;
        }
        return decoded.toLowerCase() === 'x-default' ? undefined : decoded;
    }
    if (Array.isArray(value)) {
        for (const item of value) {
            const normalized = normalizeMetadataText(item);
            if (normalized) {
                return normalized;
            }
        }
        return undefined;
    }
    if (typeof value === 'object') {
        const record = value as Record<string, unknown>;
        const xDefault = record['x-default'] ?? record['default'];
        if (xDefault) {
            return normalizeMetadataText(xDefault);
        }
        for (const key of Object.keys(record)) {
            const normalized = normalizeMetadataText(record[key]);
            if (normalized) {
                return normalized;
            }
        }
    }
    return undefined;
};

const pickMetadataText = (...values: unknown[]): string | undefined => {
    for (const value of values) {
        const normalized = normalizeMetadataText(value);
        if (normalized) {
            return normalized;
        }
    }
    return undefined;
};

const preferLongerText = (iptcValue?: string, xmpValue?: string): string | undefined => {
    if (iptcValue && xmpValue) {
        return xmpValue.length > iptcValue.length ? xmpValue : iptcValue;
    }
    return iptcValue ?? xmpValue;
};

const normalizeKeywords = (value: unknown): string[] | undefined => {
    if (!value) {
        return undefined;
    }
    if (Array.isArray(value)) {
        const normalized = value
            .map((keyword) => normalizeMetadataText(keyword))
            .filter((keyword): keyword is string => Boolean(keyword));
        return normalized.length > 0 ? normalized : undefined;
    }
    const normalized = normalizeMetadataText(value);
    return normalized ? [normalized] : undefined;
};

interface ParsedIptcData {
    filename: string;
    title?: string;
    caption?: string;
    headline?: string;
    keywords?: string[];
    author?: string;
    authorTitle?: string;
    editor?: string;
    source?: string;
    copyright?: string;
    city?: string;
    country?: string;
    dateCreated?: string;
}

interface StoredIptcData {
    title?: string;
    caption?: string;
    headline?: string;
    keywords?: string[];
    author?: string;
    authorTitle?: string;
    editor?: string;
    source?: string;
    copyright?: string;
    city?: string;
    country?: string;
    dateCreated?: string;
}

const toStoredIptcData = (parsed?: ParsedIptcData): StoredIptcData | undefined => {
    if (!parsed) {
        return undefined;
    }
    const { filename, ...rest } = parsed;
    const cleaned = Object.fromEntries(
        Object.entries(rest).filter(([_, value]) => value !== undefined)
    ) as StoredIptcData;
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
};

// Extract and log IPTC data from an image file
const extractIptcData = async (file: File): Promise<ParsedIptcData | null> => {
    if (!file.type.startsWith('image/')) {
        return null;
    }

    try {
        // Parse IPTC data using exifr
        const rawData = await exifr.parse(file, {
            iptc: true,
            xmp: true,
            exif: false,
            gps: false,
            icc: false,
            jfif: false,
        });

        if (rawData && Object.keys(rawData).length > 0) {
            // Parse date from IPTC format (YYYYMMDD + HHMMSS)
            let dateCreated: string | undefined;
            if (rawData.DateCreated) {
                const dateStr = String(rawData.DateCreated);
                const timeStr = rawData.TimeCreated ? String(rawData.TimeCreated).padStart(6, '0') : '000000';
                if (dateStr.length === 8) {
                    const year = dateStr.slice(0, 4);
                    const month = dateStr.slice(4, 6);
                    const day = dateStr.slice(6, 8);
                    const hour = timeStr.slice(0, 2);
                    const min = timeStr.slice(2, 4);
                    const sec = timeStr.slice(4, 6);
                    dateCreated = `${year}-${month}-${day}T${hour}:${min}:${sec}`;
                }
            }

            // Build clean parsed object
            const iptcTitle = pickMetadataText(rawData.Headline, rawData.ObjectName);
            const xmpTitle = pickMetadataText(
                rawData.title,
                rawData.Title,
                rawData['dc:title'],
                rawData['XMP:Title']
            );
            const iptcCaption = pickMetadataText(rawData.Caption, rawData.ImageDescription);
            const xmpCaption = pickMetadataText(
                rawData.description,
                rawData.Description,
                rawData['dc:description'],
                rawData['XMP:Description']
            );
            const iptcAuthor = pickMetadataText(rawData.Byline, rawData.Artist);
            const xmpAuthor = pickMetadataText(rawData.creator, rawData.Creator);
            const iptcCopyright = pickMetadataText(rawData.CopyrightNotice, rawData.Copyright);
            const xmpRights = pickMetadataText(rawData.rights);
            const iptcSource = pickMetadataText(rawData.Source);
            const xmpSource = pickMetadataText(rawData.source);

            const parsed: ParsedIptcData = {
                filename: file.name,
                title: preferLongerText(iptcTitle, xmpTitle),
                caption: preferLongerText(iptcCaption, xmpCaption),
                headline: pickMetadataText(rawData.Headline),
                keywords: normalizeKeywords(rawData.Keywords ?? rawData.Subject ?? rawData.subject),
                author: preferLongerText(iptcAuthor, xmpAuthor),
                authorTitle: pickMetadataText(rawData.BylineTitle),
                editor: pickMetadataText(rawData.Writer),
                source: preferLongerText(iptcSource, xmpSource),
                copyright: preferLongerText(iptcCopyright, xmpRights),
                city: pickMetadataText(rawData.City),
                country: pickMetadataText(rawData.Country),
                dateCreated: dateCreated,
            };

            // Remove undefined fields
            const cleanParsed = Object.fromEntries(
                Object.entries(parsed).filter(([_, v]) => v !== undefined)
            );

            console.log(`\n=== IPTC Data for ${file.name} ===`);
            console.log(JSON.stringify(cleanParsed, null, 2));
            console.log(`=== End IPTC Data ===\n`);
            
            return parsed;
        } else {
            console.log(`No IPTC data found for ${file.name}`);
            return null;
        }
    } catch (error) {
        console.warn(`Error extracting IPTC data from ${file.name}:`, error);
        return null;
    }
};

interface FileInfo {
    id: string;
    file: File;
    isUploading: boolean;
    isIndexing: boolean;
    isDisabled: boolean;
    isFromDraft?: boolean;
    draftFileId?: string;
    iptcData?: StoredIptcData;
}

const IndexImages = () => {
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
    const [iptcInfoMessage, setIptcInfoMessage] = useState('');

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
                
                // Create mock File objects for draft files (only images)
                const draftFiles: FileInfo[] = response.draft.files
                    .filter((draftFile: any) => draftFile.mimeType.startsWith('image/'))
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
                            draftFileId: draftFile.id,
                            iptcData: draftFile.iptcData || undefined
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
            const fileIptcData = newFiles.map(fi => ({ iptcData: fi.iptcData }));
            
            await apiClient.saveDraft({
                title,
                credit,
                source,
                isDownloadable,
                identifier,
                description,
                documentTagIds: selectedDocumentTags.map(tag => tag.id),
                files: fileList,
                fileIptcData,
                draftId: draftId || undefined,
                contentType: 'images'
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
        const parsedFiles = await Promise.all(
            acceptedFiles.map(async file => {
                const iptcData = file.type.startsWith('image/') ? await extractIptcData(file) : null;
                return { file, iptcData: toStoredIptcData(iptcData || undefined) };
            })
        );

        // Extract IPTC data from the first image file to prefill fields
        const firstImage = parsedFiles.find(({ file }) => file.type.startsWith('image/'));
        if (firstImage?.iptcData) {
            if (!title.trim() && firstImage.iptcData.title) {
                setTitle(firstImage.iptcData.title);
            }
            if (!credit.trim() && (firstImage.iptcData.copyright || firstImage.iptcData.author)) {
                setCredit(firstImage.iptcData.copyright || firstImage.iptcData.author || '');
            }
            if (firstImage.iptcData.source) {
                setSource(firstImage.iptcData.source);
            }
            if (!description.trim() && firstImage.iptcData.caption) {
                setDescription(firstImage.iptcData.caption);
            }
            if (!identifier.trim()) {
                setIdentifier(firstImage.file.name.replace(/\.[^/.]+$/, ''));
            }
        }

        if (acceptedFiles.length > 1) {
            setIptcInfoMessage(
                "Plusieurs images ont été importées : les champs ont été pré-remplis à partir des métadonnées IPTC de la première image."
            );
        } else {
            setIptcInfoMessage('');
        }

        const newFiles = parsedFiles.map(({ file, iptcData }) => ({
            id: `${file.name}-${Date.now()}`,
            file,
            isUploading: false,
            isIndexing: false,
            isDisabled: false,
            iptcData
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
                                {addedCount} image{addedCount > 1 ? 's' : ''} ajoutée{addedCount > 1 ? 's' : ''}. 
                                {duplicateCount} fichier{duplicateCount > 1 ? 's' : ''} déjà présent{duplicateCount > 1 ? 's' : ''}.
                            </p>,
                            'success'
                        );
                    } else {
                        showSnackbar(
                            <p className="m-0">
                                {addedCount} image{addedCount > 1 ? 's' : ''} ajoutée{addedCount > 1 ? 's' : ''} avec succès.
                            </p>,
                            'success'
                        );
                    }
                } else {
                    showSnackbar(
                        <p className="m-0">
                            Toutes les images sont déjà présentes dans la liste.
                        </p>,
                        'info'
                    );
                }
            }, 0);
            
            return [...prevFiles, ...uniqueFilesToAdd];
        });
    }, [showSnackbar, title, credit, source, description, identifier]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
        },
        multiple: true
    });

    const indexFiles = async () => {
        const getBaseFileName = (fileName: string) => fileName.replace(/\.[^/.]+$/, '');
        const getIdentifierForFile = (fileName: string) => {
            const baseName = getBaseFileName(fileName);
            const trimmedIdentifier = identifier.trim();
            if (trimmedIdentifier && files.length === 1) {
                return trimmedIdentifier;
            }
            return baseName;
        };

        const resolveImageFields = (iptcData?: StoredIptcData) => {
            const resolvedTitle = iptcData?.title || title.trim() || undefined;
            const resolvedCredit = iptcData?.copyright || iptcData?.author || credit.trim() || undefined;
            const resolvedSource = iptcData?.source || source.trim() || undefined;
            const resolvedDescription = iptcData?.caption || description.trim() || undefined;

            return {
                title: resolvedTitle,
                credit: resolvedCredit,
                source: resolvedSource,
                description: resolvedDescription
            };
        };

        const missingRequiredFields = files.some(fileInfo => {
            const resolved = resolveImageFields(fileInfo.iptcData);
            return !resolved.title || !resolved.credit || !resolved.source;
        });

        if (missingRequiredFields) {
            showSnackbar(
                <p className="m-0">Veuillez remplir tous les champs obligatoires (Titre, Crédit, Source) ou fournir ces informations via l'IPTC.</p>,
                'error'
            );
            return;
        }

        if (files.length === 0) {
            showSnackbar(
                <p className="m-0">Veuillez ajouter des images à indexer.</p>,
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
                name: fileInfo.file.name,
                iptcData: fileInfo.iptcData
            });
        }
        
        const draftFiles = files.filter(fi => fi.isFromDraft);
        for (const draftFileInfo of draftFiles) {
            if (draftFileInfo.draftFileId) {
                allFilesToIndex.push({
                    file: draftFileInfo.file,
                    name: draftFileInfo.file.name,
                    isDraftFile: true,
                    draftFileId: draftFileInfo.draftFileId,
                    iptcData: draftFileInfo.iptcData
                });
            }
        }

        const indexPromises = allFilesToIndex.map(async (fileData): Promise<true | false | { conflict: true; id?: string }> => {
            try {
                const resolved = resolveImageFields(fileData.iptcData);

                await apiClient.indexContent({
                    content: fileData.file,
                    type: IndexingContentType.file,
                    author: resolved.source || '',
                    documentTags: selectedDocumentTags,
                    isExternal: false,
                    title: resolved.title,
                    credit: resolved.credit,
                    isDownloadable: isDownloadable,
                    identifier: getIdentifierForFile(fileData.name),
                    description: resolved.description,
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
            setIptcInfoMessage('');
        };

        if (successCount > 0 && draftId) {
            try {
                await apiClient.deleteDraftById(draftId);
                showSnackbar(
                    <p className="m-0">
                        {successCount} image(s) ajoutée(s) à la liste d'indexation, {failureCount} échec(s). Brouillon supprimé.
                    </p>,
                    'success'
                );
            } catch (error) {
                console.error('Error deleting draft after indexing:', error);
                showSnackbar(
                    <p className="m-0">
                        {successCount} image(s) ajoutée(s) à la liste d'indexation, {failureCount} échec(s). Erreur lors de la suppression du brouillon.
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
                    {successCount} image(s) ajoutée(s) à la liste d'indexation, {failureCount} échec(s).
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
                        Cette image existe déjà dans l'index{existingId ? ` avec l'id : ${existingId}` : ''}.
                    </p>,
                    'error'
                );
            } else {
                showSnackbar(
                    <p className="m-0">
                        {successCount} image(s) ajoutée(s) à la liste d'indexation, {failureCount} échec(s).
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
                        <g clipPath="url(#clip0_1380_35417)">
                            <path fillRule="evenodd" clipRule="evenodd" d="M21.9997 18V20H23.9997V21.3333H21.9997V23.3333H20.6663V21.3333H18.6663V20H20.6663V18H21.9997ZM22.005 10C22.3703 10 22.6663 10.2967 22.6663 10.662V16.8947C22.2381 16.7434 21.7872 16.6663 21.333 16.6667V11.3333H10.6663L10.667 20.6667L16.8617 14.4713C17.0989 14.2333 17.4762 14.2093 17.7417 14.4153L17.8037 14.472L20.1677 16.8387C19.1232 17.157 18.254 17.8882 17.7618 18.8629C17.2696 19.8376 17.1971 20.9712 17.561 22.0007L9.99434 22C9.62899 21.9996 9.33301 21.7034 9.33301 21.338V10.662C9.33555 10.2977 9.63005 10.0029 9.99434 10H22.005ZM13.333 12.6667C14.0694 12.6667 14.6663 13.2636 14.6663 14C14.6663 14.7364 14.0694 15.3333 13.333 15.3333C12.5966 15.3333 11.9997 14.7364 11.9997 14C11.9997 13.2636 12.5966 12.6667 13.333 12.6667Z" fill="white" />
                        </g>
                        <defs>
                            <clipPath id="clip0_1380_35417">
                                <rect width={16} height={16} fill="white" transform="translate(8 8)" />
                            </clipPath>
                        </defs>
                    </svg>

                    <p className="m-0 text-lg font-medium text-center text-black">
                        {!isDragActive ? "Glissez et déposez une ou plusieurs images ici" : "Déposez vos images ici"}
                    </p>
                    <p className="m-0 text-sm text-center text-[#757575]">
                        Formats possibles : jpg, png
                    </p>
                </div>
            </div>

            <div className="w-full space-y-4">
                {iptcInfoMessage && (
                    <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                        {iptcInfoMessage}
                    </div>
                )}
                <Input
                    label="Titre *"
                    nativeInputProps={{
                        type: "text",
                        value: title,
                        onChange: (e) => setTitle(e.target.value),
                        placeholder: "Texte court de présentation",
                        required: true
                    }}
                    className="w-full"
                />

                <Input
                    label="Crédit *"
                    nativeInputProps={{
                        type: "text",
                        value: credit,
                        onChange: (e) => setCredit(e.target.value),
                        placeholder: "Mentions légales de propriété intellectuelle",
                        required: true
                    }}
                    className="w-full"
                />

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

            <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                        <p className="text-sm text-blue-800 font-medium mb-1">Contribution en lots</p>
                        <p className="text-sm text-blue-700 m-0">
                            Vous pouvez sélectionner plusieurs images à la fois. Les informations saisies (hors IPTC) s'appliqueront à toutes les images importées.
                        </p>
                    </div>
                </div>
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

export default IndexImages;
