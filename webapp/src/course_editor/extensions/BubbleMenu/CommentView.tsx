
import { v4 as uuidv4 } from 'uuid';
import { BubbleMenu, Editor } from "@tiptap/react"
import { useEffect, useState } from "react";
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useTextmenuStates } from '@/course_editor/hooks/useTextmenuStates';
import { apiClient } from '@/lib/api-client';
import { useSnackbar } from '@/app/SnackBarProvider';
import { Spinner } from '@/course_editor/components/ui/Spinner';
import { FullCommentThread } from '@/types/api';

const CommentView = (props: { editor: Editor }) => {
    const { editor } = props;
    const { currentThreadId } = useTextmenuStates(editor);
    const [currentThread, setCurrentThread] = useState<FullCommentThread | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchThread = async () => {
            if (currentThreadId) {
                setLoading(true)
                const thread = await apiClient.getThread(currentThreadId);
                setLoading(false)
                setCurrentThread(thread);
            }
        };
        fetchThread();
    }, [currentThreadId])

    const [commentText, setCommentText] = useState('');
    const { data: session, status } = useSession()
    const { showSnackbar } = useSnackbar();

    const setComment = async () => {
        if (!commentText.trim().length) return;

        if (currentThreadId) {
            const newMessage = await apiClient.createMessage(currentThreadId, { message: commentText, chapterId: editor.storage.simetadata.chapterId })
            const updatedThread = await apiClient.getThread(currentThreadId);
            setCurrentThread(updatedThread);
            showSnackbar(
                <p className="m-0">Message ajouté avec succès</p>,
                'success'
            )
        }
        else {
            const thread = await apiClient.createThread({ chapterId: editor.storage.simetadata.chapterId });
            const newMessage = await apiClient.createMessage(thread.id, { message: commentText, chapterId: editor.storage.simetadata.chapterId })
            const updatedThread = await apiClient.getThread(thread.id);
            setCurrentThread(updatedThread);
            editor?.chain().setThreadId(thread.id).run();
            showSnackbar(
                <p className="m-0">Message ajouté avec succès</p>,
                'success'
            )
        }

        setTimeout(() => setCommentText(''), 50);
    };


    return <>{editor &&
        <Box className="comment-adder-section" sx={{ bgcolor: 'background.paper', boxShadow: 3, p: 2 }}>
            {loading && <div className='w-full flex items-center justify-center my-4'> <CircularProgress className=' self-center' size={24} /> </div>}
            {!loading && <div style={{ maxHeight: '300px', overflowY: 'auto', position: 'relative' }}>
                <div style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    paddingRight: '20px',
                    maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)'
                }}>
                    {((currentThread && currentThread.comments) || []).map((comment, index) => (
                        <Box key={index} sx={{ mb: 2, p: 1, borderBottom: '1px solid #e0e0e0' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#444' }}>
                                {comment.user.email}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666', mb: 0.5 }}>
                                {new Date(comment.createdAt).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#333' }}>
                                {comment.message}
                            </Typography>
                        </Box>
                    ))}
                </div>
            </div>}

            <TextField
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        e.stopPropagation()
                        setComment()
                    }
                }}
                multiline
                rows={4}
                placeholder="Ajouter un commentaire..."
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
                {/* <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setCommentText('')}
                    sx={{ flex: 1 }}
                >
                    Annuler
                </Button> */}

                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setComment()}
                    sx={{ flex: 2 }}
                >
                    Ajouter
                </Button>
            </Box>
        </Box>
    }
    </>

}

export default CommentView;
