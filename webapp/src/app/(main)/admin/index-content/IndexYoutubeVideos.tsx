'use client'

import React, { useState } from 'react';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { apiClient } from '@/lib/api-client';
import { useSnackbar } from '@/app/SnackBarProvider';
import { useSession } from 'next-auth/react';
import Input from '@codegouvfr/react-dsfr/Input';
import { IndexingContentType } from '@/types/queueing';
import { DocumentTag } from '@prisma/client';
import DocumentTagPicker from './DocumentTagPicker';
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";

const IndexYoutubeVideos = () => {
    const { data: session } = useSession();
    const user = session?.user;

    const { showSnackbar } = useSnackbar();

    const [source, setSource] = useState(user ? `${user.firstName} ${user.lastName}` : '');
    const [isExternal, setIsExternal] = useState(true);
    const [urls, setUrls] = useState('');
    const [isGlobalIndexing, setIsGlobalIndexing] = useState(false);
    const [selectedDocumentTags, setSelectedDocumentTags] = useState<DocumentTag[]>([]);

    const getCleanedUrls = (urls: string) => {
        return urls.split('\n')
            .map(url => url.trim())
            .filter(url => url.match(/^(http|https):\/\/[^ "]+$/))
    }

    const indexVideos = async () => {
        setIsGlobalIndexing(true);
        const urlsToIndedx = getCleanedUrls(urls);

        const indexPromises = urlsToIndedx.map(async (url): Promise<true | false | { conflict: true; id?: string }> => {
            try {
                await apiClient.indexContent({
                    content: url,
                    type: IndexingContentType.youtube,
                    author: url,
                    documentTags: selectedDocumentTags,
                    isExternal
                });
                return true;
            } catch (error: any) {
                console.error(`Error indexing ${url}:`, error);
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

        if (successCount > 0) {
            showSnackbar(
                <p className="m-0">
                    {successCount} fichier(s) ajouté(s) à la liste d'indexation, {failureCount} échec(s).
                    <a href="/admin/tasks-list" target='_blank'>Voir la liste</a>
                </p>,
                'success'
            );
        } else if (conflictResults.length > 0) {
            const existingId = conflictResults[0]?.id;
            showSnackbar(
                <p className="m-0">
                    Cette vidéo YouTube existe déjà dans l'index{existingId ? ` avec l'id : ${existingId}` : ''}.
                </p>,
                'error'
            );
        } else {
            showSnackbar(
                <p className="m-0">
                    {successCount} fichier(s) ajouté(s) à la liste d'indexation, {failureCount} échec(s).
                    <a href="/admin/tasks-list" target='_blank'>Voir la liste</a>
                </p>,
                'error'
            );
        }

        // setUrls("");
        setIsGlobalIndexing(false);
    }

    return (

        <div className="flex flex-col items-center">
            <div className="flex flex-col w-full items-center gap-2 p-4 sm:p-6 rounded-lg"            >
                <Input
                    className='w-full'
                    label="Urls des vidéos youtube à indexer"
                    nativeTextAreaProps={{
                        value: urls,
                        rows: 10,
                        onChange: (e) => setUrls(e.target.value),
                        placeholder: "Une url par ligne",
                    }}
                    textArea
                />
                <Checkbox
                    className='w-full p-0 [&_.fr-fieldset__content]:m-0'
                    // legend="test"
                    options={[
                        {
                            nativeInputProps: {
                                checked: !isExternal,
                                onChange: () => setIsExternal(!isExternal)
                            },
                            label: <p>Ces vidéos appartiennent à Universcience. <br />
                                <span className='text-gray-500'>
                                    Les vidéos seront affichées avec le lecteur {isExternal ? "YouTube" : "par défaut"}.
                                </span>
                            </p>,
                        }
                    ]}
                />
                <Input
                    label="Source"
                    nativeInputProps={{
                        type: "text",
                        value: source,
                        onChange: (e) => setSource(e.target.value),
                        placeholder: "Source",
                    }}
                    className="w-full"
                />
                <DocumentTagPicker selectedDocumentTags={selectedDocumentTags} setSelectedDocumentTags={setSelectedDocumentTags} />

            </div>

            {
                urls.length > 0 && (
                    <Button
                        className="bg-black"
                        onClick={indexVideos}
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
                )
            }
        </div >
    )
}
export default IndexYoutubeVideos;