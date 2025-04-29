import React, { useState, useRef, useEffect } from "react";
import { H5PEditorUI, H5PPlayerUI } from "@lumieducation/h5p-react";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/SelectNext";

export interface IContentListEntry {
    contentId: string;
    originalNewKey?: string;
    mainLibrary: string;
    title: string;
}

const contextModal = createModal({
    id: "context-modal",
    isOpenedByDefault: false
});

const userModal = createModal({
    id: "user-modal",
    isOpenedByDefault: false
});

export interface IContentService {
    getEdit: (id: string) => Promise<any>;
    save: (data: any) => Promise<any>;
    getPlay: (id: string) => Promise<any>;
}

interface Props {
    contentService: IContentService;
    data: IContentListEntry;
    onDelete: (content: IContentListEntry) => void;
    onDiscard: (content: IContentListEntry) => void;
    onSaved: (data: IContentListEntry) => void;
    generateDownloadLink: (contentId: string) => string;
}

const ContentListEntry: React.FC<Props> = ({
    contentService,
    data,
    onDelete,
    onDiscard,
    onSaved,
    generateDownloadLink,
}) => {
    const isNew = data.contentId === "new";
    const [editing, setEditing] = useState(isNew);
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [contextId, setContextId] = useState<string | undefined>();
    const [asUserId, setAsUserId] = useState<string | undefined>();
    const [readOnly, setReadOnly] = useState(false);
    const isUserModalOpen = useIsModalOpen(userModal);
    const isContextModalOpen = useIsModalOpen(contextModal);


    const editorRef = useRef<H5PEditorUI>(null);
    const playerRef = useRef<H5PPlayerUI>(null);
    const contextRef = useRef<HTMLInputElement>(null);
    const userRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        setLoading(false);
    }, [editing, playing]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await editorRef.current?.save();
            if (result) {
                onSaved({
                    contentId: result.contentId,
                    mainLibrary: result.metadata.mainLibrary,
                    title: result.metadata.title,
                    originalNewKey: data.originalNewKey,
                });
            }
        } catch { }
        setSaving(false);
    };

    return (
        <div className="border rounded-2xl shadow p-4 mb-4">
            <div className="flex flex-wrap justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-semibold">{data.title}</h2>
                    <p className="text-sm text-gray-600">
                        {data.mainLibrary} · ID: {data.contentId}
                    </p>
                </div>
                <div className="flex space-x-2">
                    {!playing && !editing && (
                        <>
                            <Button onClick={() => setPlaying(true)}>Play</Button>
                            <Button priority="tertiary" onClick={() => setEditing(true)}>
                                Edit
                            </Button>
                            <a href={generateDownloadLink(data.contentId)}>
                                <Button priority="secondary">Download</Button>
                            </a>
                            <Button priority="secondary" onClick={() => onDelete(data)}>
                                Delete
                            </Button>
                        </>
                    )}
                    {editing && (
                        <>
                            <Button disabled={saving} onClick={handleSave}>
                                {saving ? "Saving..." : "Save"}
                            </Button>
                            {!isNew && (
                                <Button priority="tertiary" onClick={() => setEditing(false)}>
                                    Close
                                </Button>
                            )}
                            {isNew && (
                                <Button priority="tertiary" onClick={() => onDiscard(data)}>
                                    Discard
                                </Button>
                            )}
                        </>
                    )}
                    {playing && (
                        <Button priority="secondary" onClick={() => setPlaying(false)}>
                            Close Player
                        </Button>
                    )}
                </div>
            </div>

            {editing && (
                <div className={loading ? "opacity-50" : ""}>
                    <H5PEditorUI
                        ref={editorRef}
                        contentId={data.contentId}
                        loadContentCallback={contentService.getEdit}
                        saveContentCallback={contentService.save}
                        onSaved={() => { }}
                        onLoaded={() => setLoading(false)}
                    />
                </div>
            )}

            {playing && (
                <div className={loading ? "opacity-50" : ""}>
                    <H5PPlayerUI
                        ref={playerRef}
                        contentId={data.contentId}
                        contextId={contextId}
                        asUserId={asUserId}
                        readOnlyState={readOnly}
                        loadContentCallback={contentService.getPlay}
                        onInitialized={() => setLoading(false)}
                    />
                    <div className="mt-2 flex space-x-2">
                        <Button size="small" onClick={() => contextModal.open()}>
                            Set Context
                        </Button>
                        <Button size="small" onClick={() => userModal.open()}>
                            Impersonate
                        </Button>
                        <Checkbox
                            options={[
                                {
                                    label: 'Read-only state',
                                    nativeInputProps: {
                                        name: 'read-only-state',
                                        value: 'readonly',
                                        checked: readOnly,
                                        onChange: () => setReadOnly(!readOnly)
                                    }
                                }
                            ]}
                        />
                    </div>
                </div>
            )}

            <contextModal.Component
                title="Change Context ID"
            >
                <Input
                    ref={contextRef}
                    label="Context ID"
                    nativeInputProps={{
                        defaultValue: contextId
                    }}
                />
                <Button onClick={() => {
                    setContextId(contextRef.current?.value);
                    contextModal.close();
                }}>
                    Save
                </Button>
            </contextModal.Component>

            <userModal.Component
                title="Impersonate User"
            >
                <Select
                    label="User"
                    placeholder="Select a user"
                    nativeSelectProps={{
                        value: userRef.current?.value || '',
                        onChange: event => setAsUserId(event.target.value)
                    }}
                    options={[
                        { value: '', label: 'None' },
                        { value: 'teacher1', label: 'Teacher 1' },
                        { value: 'student1', label: 'Student 1' }
                    ]}
                />
                <Button onClick={() => {
                    userModal.close();
                }}>
                    Save
                </Button>
            </userModal.Component>
        </div>
    );
};

export default ContentListEntry;
