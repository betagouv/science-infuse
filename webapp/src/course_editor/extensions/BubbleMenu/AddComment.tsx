import { v4 as uuidv4 } from 'uuid';
import { BubbleMenu, Editor } from "@tiptap/react"
import { useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';

export interface CommentInstance {
    uuid?: string
    comments?: any[]
}

const BubbleAddComment = (props: { editor: Editor }) => {
    const { editor } = props;
    let activeCommentsInstance: CommentInstance = {};
    const [commentText, setCommentText] = useState('');

    const pos = editor.view.state.selection.$from.pos + 1;
    let marks = editor.view.state.doc.resolve(pos).marks().filter(mark => mark.type.name == 'comment');
    if (marks.length > 0) {
        activeCommentsInstance = JSON.parse(marks[0].attrs.comment)
        console.log("activeCommentsInstance", marks, activeCommentsInstance)
    }
    const { data: session, status } = useSession()

    const setComment = () => {
        if (!commentText.trim().length) return;

        const activeCommentInstance: CommentInstance = JSON.parse(JSON.stringify(activeCommentsInstance));

        const commentsArray = typeof activeCommentInstance.comments === 'string' ? JSON.parse(activeCommentInstance.comments) : activeCommentInstance.comments;

        if (commentsArray) {
            commentsArray.push({
                userName: session?.user.email,
                time: Date.now(),
                content: commentText,
            });

            const commentWithUuid = JSON.stringify({
                uuid: activeCommentsInstance.uuid || uuidv4(),
                comments: commentsArray,
            });

            // eslint-disable-next-line no-unused-expressions
            editor?.chain().setComment(commentWithUuid).run();
        } else {
            const commentWithUuid = JSON.stringify({
                uuid: uuidv4(),
                comments: [{
                    userName: session?.user.email,
                    time: Date.now(),
                    content: commentText,
                }],
            });

            // eslint-disable-next-line no-unused-expressions
            editor?.chain().setComment(commentWithUuid).run();
            // setTimeout(() => setCurrentComment(editor), 1000)
        }

        setTimeout(() => setCommentText(''), 50);
    };


    return <>{editor && <BubbleMenu
        tippy-options={{ duration: 100, placement: 'bottom' }}
        editor={editor}
        className="bubble-menu"
        shouldShow={() => (editor.isActive('comment') && !activeCommentsInstance.uuid)}
    >
        <Box className="comment-adder-section" sx={{ bgcolor: 'background.paper', boxShadow: 3, p: 2 }}>
            <div style={{ maxHeight: '300px', overflowY: 'auto', position: 'relative' }}>
                <div style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    paddingRight: '20px',
                    maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
                }}>
                    {(activeCommentsInstance.comments || []).map((comment, index) => (
                        <Box key={index} sx={{ mb: 2, p: 1, borderBottom: '1px solid #e0e0e0' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#444' }}>
                                {comment.userName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666', mb: 0.5 }}>
                                {new Date(comment.time).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#333' }}>
                                {comment.content}
                            </Typography>
                        </Box>
                    ))}
                </div>
            </div>

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
                <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setCommentText('')}
                    sx={{ flex: 1 }}
                >
                    Annuler
                </Button>

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
    </BubbleMenu>}
    </>

}

export default BubbleAddComment;