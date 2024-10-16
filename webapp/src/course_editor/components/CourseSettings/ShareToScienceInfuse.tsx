import { apiClient } from '@/lib/api-client';
import { ChapterWithoutBlocks } from '@/types/api';
import Button from '@codegouvfr/react-dsfr/Button';
import { CircularProgress, Tooltip } from '@mui/material';
import { ChapterStatus } from '@prisma/client';
import { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';

const ShareToScienceInfuse = (props: { editor: Editor }) => {
    const [chapterStatus, setChapterStatus] = useState<ChapterStatus>(props.editor.storage.simetadata.chapterStatus);
    const [chapter, setChapter] = useState<ChapterWithoutBlocks | null>(null);
    const [loadingMessage, setLoadingMessage] = useState("");

    useEffect(() => {
        const fetchChapter = async () => {
            try {
                const fetchedChapter = await apiClient.getChapter(props.editor.storage.simetadata.chapterId);

                setChapter(fetchedChapter as ChapterWithoutBlocks);
                if (fetchedChapter)
                    setChapterStatus(fetchedChapter.status);
            } catch (error) {
                console.error("Error fetching chapter:", error);
            }
        };

        fetchChapter();
    }, [props.editor.storage.simetadata.chapterId]);
    console.log("chapterStatus", chapterStatus)
    if (!chapterStatus) return;
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
                        await apiClient.updateChapter(props.editor.storage.simetadata.chapterId, { status: expectedStatus });
                        setTimeout(() => {
                            setChapterStatus(expectedStatus);
                            setLoadingMessage("");
                        }, 1000);
                    } catch (error) {
                        setLoadingMessage("");
                    }
                }}>

                {loadingMessage && <>{loadingMessage}  <CircularProgress className='ml-2' size={16} sx={{ color: 'black' }} /></>}
                {!loadingMessage && chapterStatus == ChapterStatus.DRAFT && "Partager à Science Infuse"}
                {!loadingMessage && chapterStatus == ChapterStatus.REVIEW && "Demande envoyée"}
            </Button>
        </Tooltip >
    )
}

export default ShareToScienceInfuse;