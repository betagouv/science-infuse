'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import AdminWrapper from '../AdminWrapper';
import { useState } from '@preact-signals/safe-react/react';
import Input from '@codegouvfr/react-dsfr/Input';
import { ChunkWithScoreUnion, DocumentWithChunks, s3ToPublicUrl } from '@/types/vectordb';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { debounce } from 'lodash';
import { ChunkResults, RenderSearchResult } from '@/app/recherche/RenderSearch';
import { Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import Button from '@codegouvfr/react-dsfr/Button';
import Badge from '@codegouvfr/react-dsfr/Badge';

const InspectDocument = () => {
    const searchParams = useSearchParams();
    const [documentId, setDocumentId] = useState(searchParams.get('documentId') || "");
    const [debouncedDocumentId, setDebouncedDocumentId] = useState(documentId);

    const { data, isLoading, isError, error, refetch } = useQuery<DocumentWithChunks>({
        queryKey: ['documentId', debouncedDocumentId],
        queryFn: () => apiClient.getDocument(debouncedDocumentId),
        enabled: !!debouncedDocumentId,
    });

    useEffect(() => {
        const debouncedSetDocumentId = debounce((value) => {
            setDebouncedDocumentId(value);
        }, 300);

        debouncedSetDocumentId(documentId);

        return () => {
            debouncedSetDocumentId.cancel();
        };
    }, [documentId]);

    console.log("DATA RES", data)
    return (
        <AdminWrapper>
            <div className='flex flex-col gap-8'>
                <h1 className='m-0'>Inspecter un document</h1>
                <Input
                    label="Document Id"
                    nativeInputProps={{
                        type: "text",
                        value: documentId,
                        onChange: (e) => setDocumentId(e.target.value),
                        required: true,
                        placeholder: "37cb86fc-51e4-4a55-9bdb-a53a012932d2",
                    }}
                />


                {isLoading && <p>Chargement...</p>}
                {isError && <p>
                    Une erreur s'est produite lors du chargement du document <br />
                    <i>{error.message}</i>
                </p>}
                {data && (
                    <div className='flex flex-col gap-8' >



                        <h2 className='m-0'>Actions</h2>
                        {data.deleted && <Badge severity="error">Document supprimé (désindexé)</Badge>}
                        {
                            !data.deleted && <Button
                                onClick={() => {
                                    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
                                        apiClient.deleteDocument(data.id)
                                            .then(() => {
                                                alert("Document supprimé avec succès");
                                                refetch();
                                            })
                                            .catch((error) => {
                                                alert(`Erreur lors de la suppression du document: ${error.message}`);
                                            });
                                    }
                                }}
                            >
                                Supprimer le document
                            </Button> 

                        }


                        <h2 className='m-0'>Informations générales</h2>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="document info table">
                                <TableBody>
                                    <TableRow>
                                        <TableCell component="th" scope="row"><strong>ID</strong></TableCell>
                                        <TableCell>{data.id}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row"><strong>Nom du média</strong></TableCell>
                                        <TableCell>{data.mediaName}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row"><strong>Chemin d'origine</strong></TableCell>
                                        <TableCell>{data.originalPath}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row"><strong>Source</strong></TableCell>
                                        <TableCell>{data.source}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row"><strong>Hash du fichier</strong></TableCell>
                                        <TableCell>{data.fileHash}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row"><strong>Lien public</strong></TableCell>
                                        <TableCell>
                                            <a target="_blank" href={s3ToPublicUrl(data.s3ObjectName)} download>
                                                {data.s3ObjectName}
                                            </a>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <h2 className='m-0'>Portions du document ({data.chunks.length})</h2>
                        <ChunkResults chunks={data.chunks as ChunkWithScoreUnion[]} searchWords={[]} />
                    </div>
                )}



            </div>
        </AdminWrapper>
    )
};

export default InspectDocument;