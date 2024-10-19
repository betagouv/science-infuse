import { apiClient } from '@/lib/api-client';
import { ChapterWithoutBlocks } from '@/types/api';
import Button from '@codegouvfr/react-dsfr/Button';
import { CircularProgress, Tooltip } from '@mui/material';
import { ChapterStatus } from '@prisma/client';
import { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';

const ShareToScienceInfuse = (props: { chapter: ChapterWithoutBlocks }) => {
    const [chapterStatus, setChapterStatus] = useState<ChapterStatus | undefined>(props.chapter?.status);
    const [loadingMessage, setLoadingMessage] = useState("");
    const chapter = props.chapter;

    if (!chapter || !chapterStatus) return;
    return (
        <Tooltip title={chapterStatus === ChapterStatus.REVIEW && <span>Votre cours est en attente de revue.<br />Cliquez pour annuler la demande.</span>}>
            <Button
                iconId="fr-icon-group-fill"
                iconPosition="right"
                className='w-full flex justify-center h-fit'
                style={{
                    background: "white",
                    color: "black",
                }}
                disabled={!!loadingMessage}
                priority="secondary"
                // priority={!loadingMessage || chapterStatus == ChapterStatus.REVIEW ? "secondary" : "primary"}
                onClick={async () => {
                    try {
                        const expectedStatus = chapterStatus == ChapterStatus.REVIEW ? ChapterStatus.DRAFT : ChapterStatus.REVIEW;
                        expectedStatus == ChapterStatus.REVIEW && setLoadingMessage("Envoie de la demande");
                        expectedStatus == ChapterStatus.DRAFT && setLoadingMessage("Annulation de la demande");
                        console.log("expectedStatus", expectedStatus)
                        await apiClient.updateChapter(chapter.id, { status: expectedStatus });
                        setTimeout(() => {
                            setChapterStatus(expectedStatus);
                            setLoadingMessage("");
                        }, 1000);
                    } catch (error) {
                        setLoadingMessage("");
                    }
                }}>

                {loadingMessage && <>{loadingMessage}  <CircularProgress className='ml-2' size={16} sx={{ color: 'black' }} /></>}
                {!loadingMessage && (
                    chapterStatus == ChapterStatus.REVIEW ? "Demande envoyée" : "Partager à Science Infuse"
                )}
            </Button>
        </Tooltip >
    )
}

export default ShareToScienceInfuse;