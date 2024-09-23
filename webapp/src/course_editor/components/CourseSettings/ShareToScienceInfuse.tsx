import { useState, useEffect } from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { ChapterStatus } from '@prisma/client';
import { Editor } from '@tiptap/react';
import { apiClient, ChapterWithoutBlocks } from '@/lib/api-client';
import { CircularProgress } from '@mui/material';

const ShareToScienceInfuse = (props: { editor: Editor }) => {
    const [chapterStatus, setChapterStatus] = useState<ChapterStatus>(props.editor.storage.simetadata.chapterStatus);
    const [chapter, setChapter] = useState<ChapterWithoutBlocks | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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


    return (
        <Button
            iconId="fr-icon-group-fill"
            iconPosition="right"
            className='bg-black w-full flex justify-center h-fit'
            disabled={chapterStatus == ChapterStatus.REVIEW || isLoading}
            onClick={async () => {
                try {
                    setIsLoading(true);
                    await apiClient.updateChapter(props.editor.storage.simetadata.chapterId, { status: ChapterStatus.REVIEW });
                    setTimeout(() => {
                        setChapterStatus(ChapterStatus.REVIEW);
                        setIsLoading(false);
                    }, 2000);
                } catch (error) {
                    setIsLoading(false);
                }
            }}>

            {chapterStatus == ChapterStatus.REVIEW ? "Demande envoyée" : isLoading ? <>Mise à jour  <CircularProgress className='ml-2' size={16} sx={{ color: 'black' }} /></> : "Partager à Science Infuse"}
        </Button>
    )
}

export default ShareToScienceInfuse;