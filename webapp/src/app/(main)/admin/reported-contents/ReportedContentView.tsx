'use client';

import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import AdminWrapper from '../AdminWrapper';
import { DocumentChunk, Document, ReportedDocumentChunk, User, DocumentChunkMeta, ReportedDocumentChunkStatus } from '@prisma/client';
import ChunkRenderer from '@/app/(main)/recherche/DocumentChunkFull';
import { useState } from 'react';
import Button from "@codegouvfr/react-dsfr/Button";
import { DeleteButton } from "@/app/(main)/intelligence-artificielle/video-interactive/InteractiveVideoEditor";
import { ChunkWithScoreUnion } from "@/types/vectordb";
import { desindexDocumentChunk, desindexDocuments, setReportedDocumentChunkStatus } from "@/lib/utils/db";
import CallOut from "@codegouvfr/react-dsfr/CallOut";

export type ReportedDocumentWithChunk = (ReportedDocumentChunk & { documentChunk: DocumentChunk & { metadata: DocumentChunkMeta, document: Document }, user: User })

const ReportedContentView = (props: { reportedContents: ReportedDocumentWithChunk[] }) => {
    const [page, setPage] = useState(1);
    const itemsPerPage = 1;
    const [_reportedContents, setReportedContents] = useState(props.reportedContents);
    const currentItem = _reportedContents[page - 1];

    return (
        <div className="max-w-4xl w-full mx-auto space-y-6 p-0">
            {_reportedContents.length == 0 && (
                <CallOut
                    iconId="ri-information-line"
                    title="Aucun contenu signalé à traiter."
                >
                    Le contenu signalé par les utilisateurs s'affichera ici.

                </CallOut>

            )}
            {currentItem && (
                <div className="flex flex-col w-full gap-6 items-center">
                    <div className="flex flex-col lg:flex-row gap-6 w-full items-start lg:items-center">
                        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden w-full">
                            <div className="p-4 lg:p-6 space-y-6">
                                <div className="border-b pb-4">
                                    <h2 className="text-lg lg:text-xl font-semibold mb-1">
                                        {currentItem.documentChunk.title || currentItem.documentChunk.document.mediaName}
                                    </h2>
                                    <div className="text-xs lg:text-sm text-gray-600 flex items-center">
                                        Chunk: {currentItem.documentChunk.id}
                                        <button
                                            onClick={() => navigator.clipboard.writeText(currentItem.documentChunk.id)}
                                            className="ml-0 text-blue-600 hover:text-blue-800 items-center flex justify-center"
                                            title="Copier l'ID"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="text-xs lg:text-sm text-gray-600 flex items-center">
                                        Document: <a href={`/admin/inspect-document?documentId=${currentItem.documentChunk.document.id}`} target="_blank" className="text-blue-600 hover:text-blue-800 hover:underline">{currentItem.documentChunk.document.id}</a>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(currentItem.documentChunk.document.id)}
                                            className="ml-0 text-blue-600 hover:text-blue-800 items-center flex justify-center"
                                            title="Copier l'ID"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>

                                </div>

                                <div className="space-y-2">
                                    <div className="text-xs lg:text-sm text-gray-600">Signalé par:</div>
                                    <a
                                        target='_blank'
                                        href={`/admin/utilisateurs?q=${currentItem.user.id}`}
                                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm lg:text-base"
                                    >
                                        {currentItem.user.email}
                                    </a>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-xs lg:text-sm text-gray-600">Motif du signalement:</div>
                                    <pre className="p-2 lg:p-3 bg-gray-50 rounded-lg w-full overflow-x-auto text-sm">
                                        {currentItem.reason}
                                    </pre>
                                </div>

                            </div>
                        </div>

                        <div className="w-full lg:w-96 h-fit">
                            <ChunkRenderer chunk={{ ...currentItem.documentChunk, score: 0 } as ChunkWithScoreUnion} searchWords={[]} />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:ml-auto">
                        <DeleteButton
                            size='medium'
                            className='text-white bg-red-500 !aspect-auto w-full sm:w-auto'
                            priority='primary'
                            title="Signaler"
                            onClick={async () => {
                                await desindexDocumentChunk(currentItem.documentChunk.id);
                                await setReportedDocumentChunkStatus(currentItem.id, ReportedDocumentChunkStatus.CLOSED);
                                setReportedContents(prev => prev.filter(item => item.id !== currentItem.id));
                            }}
                        >
                            Désindexer le résultat
                        </DeleteButton>
                        <DeleteButton
                            size='medium'
                            className='text-red-500 !aspect-auto w-full sm:w-auto'
                            priority='secondary'
                            title="Signaler"
                            onClick={async () => {
                                await desindexDocuments([currentItem.documentChunk.document.id]);
                                await setReportedDocumentChunkStatus(currentItem.id, ReportedDocumentChunkStatus.CLOSED);
                                setReportedContents(prev => prev.filter(item => item.documentChunk.document.id !== currentItem.documentChunk.document.id));
                            }}
                        >
                            Désindexer tout le document
                        </DeleteButton>
                        <Button priority="tertiary" size="medium" className="w-full sm:w-auto"
                            onClick={async () => {
                                await setReportedDocumentChunkStatus(currentItem.id, ReportedDocumentChunkStatus.CLOSED);
                                setReportedContents(prev => prev.filter(item => item.id !== currentItem.id));
                            }}
                        >
                            Ignorer / Fermer
                        </Button>
                    </div>

                </div>
            )}

            {_reportedContents.length > 0 && <div className="flex justify-center pt-4 sticky bottom-0 bg-white">
                <Pagination
                    className="w-fit"
                    count={Math.ceil(_reportedContents.length / itemsPerPage)}
                    defaultPage={page}
                    getPageLinkProps={(page) => ({
                        onClick: () => setPage(page),
                        href: "#",
                    })}
                    showFirstLast
                />
            </div>}
        </div>
    )
}

export default ReportedContentView;