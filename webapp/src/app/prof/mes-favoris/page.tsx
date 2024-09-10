'use client';

import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import ChunkRenderer from '@/app/recherche/DocumentChunkFull';
import { getSearchWords } from '@/app/recherche/text-highlighter';
import Masonry from '@mui/lab/Masonry';
import styled from "@emotion/styled";
import { CircularProgress } from "@mui/material";
import { MasonaryItem } from "@/components/MasonaryItem";


const StyledAccordion = styled(Accordion)`
.fr-accordion__btn {
    background-color: #ffe34e;
}
`

export default function StarredDocumentChunks() {

    const { data: starredDocumentChunks, isLoading, error } = useQuery({
        queryKey: ['starredDocumentChunks'],
        queryFn: () => apiClient.getStarDocumentChunk()
    });

    return (
        <div>
            <div className="md:p-16 p-8 w-full">
                <div className='flex w-full flex-col gap-4'>

                    {isLoading ? (
                        <div className="w-full flex items-center justify-center">
                            <CircularProgress />
                        </div>
                    ) : error ? (
                        <p>Error: {error.message}</p>
                    ) : (
                        Object.entries(starredDocumentChunks || {}).map(([keyword, chunks]) => (
                            <div key={keyword} className="mb-6">
                                <StyledAccordion
                                    defaultExpanded={false}
                                    label={<span className="text-2xl font-bold text-left text-black">Mot clé “{keyword}” : {chunks.length} élément{chunks.length > 1 ? 's' : ''}</span>}
                                >

                                    <Masonry columns={3} spacing={2}>
                                        {chunks
                                            .sort((a, b) => b.score - a.score)
                                            .map((result, index) => (
                                                <MasonaryItem key={index}>
                                                    <ChunkRenderer chunk={result} searchWords={getSearchWords(keyword)} />
                                                </MasonaryItem>
                                            ))}
                                    </Masonry>

                                </StyledAccordion>

                            </div>
                        ))
                    )}


                </div>
            </div>
        </div>
    );
}