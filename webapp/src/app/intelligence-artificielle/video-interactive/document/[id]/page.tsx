'use client'
import React, { useState, useCallback, useEffect } from 'react';
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import { useParams, useRouter } from 'next/navigation';
import {
    InteractiveVideoQuestion,
    InteractiveVideoQuestionGroup,
    InteractiveVideoDefinition,
    InteractiveVideoDefinitionGroup,
    generateInteraciveVideoData,
} from "@/app/api/export/h5p/contents/interactiveVideo";
import { s3ToPublicUrl } from "@/types/vectordb";
import Button from '@codegouvfr/react-dsfr/Button';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { CircularProgress } from "@mui/material";
import { apiClient } from "@/lib/api-client";
import { secondsToTime, TimeCode, timeToSeconds } from "@/lib/utils";
import Download from "@codegouvfr/react-dsfr/Download";
import { ExportH5pResponse } from "@/types/api";
import EmbedVideo from '@/components/interactifs/EmbedVideo';
import styled from '@emotion/styled';
import InteractiveVideoEditor from '../../InteractiveVideoEditor';





export default function () {
    const { id: documentId } = useParams() as { id: string };
    const router = useRouter()
    return (
        <div className="w-full fr-grid-row fr-grid-row--gutters fr-grid-row--center">
            <div className="flex flex-col fr-container main-content-item my-8 gap-8">
                <Breadcrumb
                    currentPageLabel={documentId}
                    segments={[
                        { label: 'intelligence artificielle', linkProps: { href: '/intelligence-artificielle' } },
                        { label: 'Création de vidéo interactive', linkProps: { href: '/intelligence-artificielle/video-interactive' } },
                    ]}
                />
                <Button
                    className='flex justify-center items-center gap-2'
                    priority='secondary'
                    onClick={() => { router.push('/intelligence-artificielle/video-interactive/') }}
                >
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M2.21932 4.99999L5.51932 8.29999L4.57665 9.24266L0.333984 4.99999L4.57665 0.757324L5.51932 1.69999L2.21932 4.99999Z" fill="#000091" />
                    </svg>

                    Retour
                </Button>

                {documentId && <InteractiveVideoEditor documentId={documentId} />}
            </div>
        </div>
    );
}
