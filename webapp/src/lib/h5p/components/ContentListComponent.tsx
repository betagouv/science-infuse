import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

// The .js references are necessary for requireJs to work in the browser.
import { IContentService, IContentListEntry } from '../services/ContentService';
import ContentListEntryComponent from './ContentListEntryComponent';

interface ContentListProps {
    contentService: IContentService;
}

const ContentList: React.FC<ContentListProps> = ({ contentService }) => {
    const [contentList, setContentList] = useState<IContentListEntry[]>([]);
    const [newCounter, setNewCounter] = useState(0);

    const updateList = async (): Promise<void> => {
        const fetchedContentList = await contentService.list();
        console.log('ContentList', fetchedContentList);
        setContentList(fetchedContentList);
    };

    useEffect(() => {
        updateList();
    }, []);

    const handleNew = () => {
        setContentList([
            {
                contentId: 'new',
                mainLibrary: '',
                title: 'New H5P',
                originalNewKey: `new-${newCounter}`
            },
            ...contentList
        ]);
        setNewCounter(prev => prev + 1);
    };

    const handleDiscard = (content: IContentListEntry) => {
        setContentList(contentList.filter((c) => c !== content));
    };

    const handleDelete = async (content: IContentListEntry) => {
        if (!content.contentId) {
            return;
        }
        try {
            await contentService.delete(content.contentId);
            setContentList(contentList.filter((c) => c !== content));
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            }
        }
    };

    const handleSaved = async (
        oldData: IContentListEntry,
        newData: IContentListEntry
    ) => {
        setContentList(contentList.map((c) =>
            c === oldData ? newData : c
        ));
    };

    return (
        <div>
            <Button
                variant="primary"
                onClick={handleNew}
                className="my-2"
            >
                <FontAwesomeIcon icon={faPlusCircle} className="me-2" />
                Create new content
            </Button>
            <ListGroup>
                {contentList.map((content) => (
                    <ContentListEntryComponent
                        contentService={contentService}
                        data={content}
                        key={content.originalNewKey ?? content.contentId}
                        onDiscard={() => handleDiscard(content)}
                        onDelete={() => handleDelete(content)}
                        onSaved={(newData) =>
                            handleSaved(content, newData)
                        }
                        generateDownloadLink={
                            contentService.generateDownloadLink
                        }
                    />
                ))}
            </ListGroup>
        </div>
    );
};

export default ContentList;