import { BuildCardEnd, StyledImageCard } from "@/app/recherche/DocumentChunkFull";
import { fetchSIContent } from "@/app/recherche/fetchSIContent";
import { MasonaryItem } from "@/components/MasonaryItem";
import SearchBar from "@/components/search/SearchBar";
import { WEBAPP_URL } from "@/config";
import { EditorContext } from '@/course_editor/context/EditorContext';
import { apiClient } from '@/lib/api-client';
import { ChunkWithScore, MediaTypes, s3ToPublicUrl } from "@/types/vectordb";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import styled from "@emotion/styled";
import Masonry from "@mui/lab/Masonry";
import { Collapse, Modal } from '@mui/material';
import { EducationLevel, SchoolSubject, Theme } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { Editor } from '@tiptap/react';
import { useSession } from "next-auth/react";
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDebounceValue } from "usehooks-ts";
import ChapterTableOfContents from "./ChapterTableOfContents";
import ImportedFileSource from "./components/ImportedFileSource";
import RenderImportedFile from "./components/RenderImportedFile";
import { ChapterWithoutBlocks } from "@/types/api";

const EducationLevelPicker = (props: { editor: Editor, availablEducationLevel: EducationLevel[], chapter: ChapterWithoutBlocks, updateChapter: (chapter: Partial<ChapterWithoutBlocks>) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleCollapse = () => {
        setIsOpen(!isOpen);
    };

    const handleEducationLevelChange = async (level: EducationLevel, checked: boolean) => {
        try {

            const updatedLevels = !checked
                ? (props.chapter?.educationLevels || []).filter(e => e.id !== level.id)
                : [...(props.chapter?.educationLevels || []), level];

            props.updateChapter({ educationLevels: updatedLevels })
        } catch (error) {
            console.error('Error updating chapter:', error);
        }
    };

    if (!props.chapter || !props.chapter?.educationLevels) return <></>;

    return (
        <div className="optionContainer">
            <div onClick={toggleCollapse} className={`${isOpen ? "open" : "closed"} button flex cursor-pointer items-center gap-2 p-4 sticky top-0 w-full bg-white z-[1]`}>
                <p className="m-0 text-sm text-black">Niveau scolaire</p>
                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" >
                    <path fillRule="evenodd" clipRule="evenodd" d="M8.00048 8.78132L11.3005 5.48132L12.2431 6.42399L8.00048 10.6667L3.75781 6.42399L4.70048 5.48132L8.00048 8.78132Z" fill="#161616" />
                </svg>
            </div>
            <Collapse in={isOpen}>
                <div>
                    {props.availablEducationLevel.sort((a, b) => a.name.localeCompare(b.name)).map((level, index) => (
                        <Checkbox
                            key={index}
                            options={[
                                {
                                    nativeInputProps: {
                                        checked: props.chapter?.educationLevels.map(e => e.id).includes(level.id),
                                        onChange: (e) => handleEducationLevelChange(level, e.target.checked)
                                    },
                                    label: level.name,
                                }
                            ]}
                        />
                    ))}
                </div>
            </Collapse>
        </div>
    );
}

const SchoolSubjectPicker = (props: { editor: Editor, availableSchoolSubjects: SchoolSubject[], chapter: ChapterWithoutBlocks, updateChapter: (chapter: Partial<ChapterWithoutBlocks>) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleCollapse = () => {
        setIsOpen(!isOpen);
    };

    const handleSubjectChange = (subject: SchoolSubject) => {
        props.updateChapter({ schoolSubjectId: subject.id });
    };

    return (
        <div className="optionContainer">
            <div onClick={toggleCollapse} className={`${isOpen ? "open" : "closed"} button flex cursor-pointer items-center gap-2 p-4 sticky top-0 w-full bg-white z-[1]`}>
                <p className="m-0 text-sm text-black">Matière</p>
                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" >
                    <path fillRule="evenodd" clipRule="evenodd" d="M8.00048 8.78132L11.3005 5.48132L12.2431 6.42399L8.00048 10.6667L3.75781 6.42399L4.70048 5.48132L8.00048 8.78132Z" fill="#161616" />
                </svg>
            </div>
            <Collapse in={isOpen}>
                <div>
                    {props.availableSchoolSubjects.map((subject, index) => (
                        <RadioButtons
                            key={index}
                            options={[
                                {
                                    nativeInputProps: {
                                        checked: props.chapter?.schoolSubjectId === subject.id,
                                        onChange: () => handleSubjectChange(subject)
                                    },
                                    label: subject.name,
                                }
                            ]}
                        />
                    ))}
                </div>
            </Collapse>
        </div>
    );
}

const ThemePicker = (props: { editor: Editor, chapter: ChapterWithoutBlocks, availableThemes: Theme[], updateChapter: (chapter: Partial<ChapterWithoutBlocks>) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleCollapse = () => {
        setIsOpen(!isOpen);
    };

    const handleThemeChange = (theme: Theme) => {
        props.updateChapter({ themeId: theme.id });
    };

    return (
        <div className="optionContainer">
            <div onClick={toggleCollapse} className={`${isOpen ? "open" : "closed"} button flex cursor-pointer items-center gap-2 p-4 sticky top-0 w-full bg-white z-[1]`}>
                <p className="m-0 text-sm text-black">Thème</p>
                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                    <path fillRule="evenodd" clipRule="evenodd" d="M8.00048 8.78132L11.3005 5.48132L12.2431 6.42399L8.00048 10.6667L3.75781 6.42399L4.70048 5.48132L8.00048 8.78132Z" fill="#161616" />
                </svg>
            </div>
            <Collapse in={isOpen}>
                <div>
                    {props.availableThemes.map((theme, index) => (
                        <RadioButtons
                            key={index}
                            options={[
                                {
                                    nativeInputProps: {
                                        checked: props.chapter?.themeId === theme.id,
                                        onChange: () => handleThemeChange(theme)
                                    },
                                    label: theme.title,
                                }
                            ]}
                        />
                    ))}
                </div>
            </Collapse>
        </div>
    );
};

const SkillsAndKeyIdeasPicker = (props: { editor: Editor, chapter: ChapterWithoutBlocks, updateChapter: (chapter: Partial<ChapterWithoutBlocks>) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState(props.chapter?.skillsAndKeyIdeas || "")
    const [debouncedValue] = useDebounceValue(value, 500);


    useEffect(() => {
        props.updateChapter({ skillsAndKeyIdeas: value });
    }, [debouncedValue])


    const toggleCollapse = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="optionContainer">
            <div onClick={toggleCollapse} className={`${isOpen ? "open" : "closed"} button flex cursor-pointer items-center gap-2 p-4 sticky top-0 w-full bg-white z-[1]`}>
                <p className="m-0 text-sm text-black">Compétences et notions clés</p>
                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                    <path fillRule="evenodd" clipRule="evenodd" d="M8.00048 8.78132L11.3005 5.48132L12.2431 6.42399L8.00048 10.6667L3.75781 6.42399L4.70048 5.48132L8.00048 8.78132Z" fill="#161616" />
                </svg>
            </div>
            <Collapse in={isOpen}>
                <div>
                    <Input
                        label=" "
                        nativeTextAreaProps={{
                            value: value,
                            onChange: (e) => setValue(e.target.value),
                            required: true,
                            placeholder: "À compléter...",
                        }}
                        textArea
                    />
                </div>
            </Collapse>
        </div>
    );
};

const AdditionalInformationsPicker = (props: { editor: Editor, chapter: ChapterWithoutBlocks, updateChapter: (chapter: Partial<ChapterWithoutBlocks>) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState(props.chapter?.additionalInformations || "")
    const [debouncedValue] = useDebounceValue(value, 500);


    useEffect(() => {
        props.updateChapter({ additionalInformations: value });
    }, [debouncedValue])


    const toggleCollapse = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="optionContainer">
            <div onClick={toggleCollapse} className={`${isOpen ? "open" : "closed"} button flex cursor-pointer items-center gap-2 p-4 sticky top-0 w-full bg-white z-[1]`}>
                <p className="m-0 text-sm text-black">Autres informations</p>
                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                    <path fillRule="evenodd" clipRule="evenodd" d="M8.00048 8.78132L11.3005 5.48132L12.2431 6.42399L8.00048 10.6667L3.75781 6.42399L4.70048 5.48132L8.00048 8.78132Z" fill="#161616" />
                </svg>
            </div>
            <Collapse in={isOpen}>
                <div>
                    <Input
                        label=" "
                        nativeTextAreaProps={{
                            value: value,
                            onChange: (e) => setValue(e.target.value),
                            required: true,
                            placeholder: "À compléter...",
                        }}
                        textArea
                    />
                </div>
            </Collapse>
        </div>
    );
};


const StyledPickerImage = styled.div`
    outline: 2px solid black;
    padding: 4px 6px 4px 0px;
    position: relative;
    left: 0;
    bottom: 0;
    &:after {
        content: "";
        position: absolute;
        width: calc(100% - 4px);
        border-bottom: 4px solid black;
        bottom: -4px;
        left: 0;
    }
`
const StyledModal = styled(Modal)`
.activeCard {
    position: relative;
    &:before {
        content: "";
        position: absolute;
        left: 0;
        z-index: 9;
        height: 100%;
        border-left: 6px solid #000091;
    }

}
`

const CoverPicker = (props: { editor: Editor, chapter: ChapterWithoutBlocks, updateChapter: (chapter: Partial<ChapterWithoutBlocks>) => void }) => {
    const { data: session } = useSession();
    const user = session?.user;

    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [source, setSource] = useState('');
    const [selectedChunk, setSelectedChunk] = useState<ChunkWithScore<"pdf_image"> | null>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [droppedFile, setDroppedFile] = useState<File | null>(null)

    useEffect(() => {
        if (user) {
            setSource(`${user.firstName} ${user.lastName}`)
        }
    }, [user])



    const toggleCollapse = () => setIsOpen(!isOpen);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);


    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setQuery("");
            setDroppedFile(file);
        }
    }, [props]);

    const uploadFileAndSetAsCover = async (file: File) => {
        setIsUploading(true);
        try {
            const response = await apiClient.uploadFile(file);
            await props.updateChapter({ coverPath: s3ToPublicUrl(response.s3ObjectName) })
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setIsUploading(false);
            closeModal();
        }

    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        },
        multiple: false
    });

    const { data: results, isLoading, isError } = useQuery({
        queryKey: [query, [MediaTypes.PdfImage], 10] as const,
        queryFn: fetchSIContent,
        enabled: !!query,
    });

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                closeModal();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="optionContainer">
            <div
                onClick={toggleCollapse}
                className={`${isOpen ? "open" : "closed"} button flex cursor-pointer items-center gap-2 p-4 sticky top-0 w-full bg-white z-[1]`}
            >
                <p className="m-0 text-sm text-black">Image de couverture</p>
                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                    <path fillRule="evenodd" clipRule="evenodd" d="M8.00048 8.78132L11.3005 5.48132L12.2431 6.42399L8.00048 10.6667L3.75781 6.42399L4.70048 5.48132L8.00048 8.78132Z" fill="#161616" />
                </svg>
            </div>
            <Collapse in={isOpen}>
                <div className="flex w-full justify-center cursor-pointer py-4">
                    <div onClick={openModal} className="w-full h-auto aspect-[10/14] relative">
                        {
                            props.chapter?.coverPath ?
                                <img src={props.chapter.coverPath} className="w-full" />
                                :
                                <div className="w-full h-full bg-white border-solid border-[3px] border-black">
                                    <div className="flex flex-col justify-center items-center h-full p-4">
                                        <StyledPickerImage className="flex flex-row justify-center items-center gap-2 whitespace-nowrap cursor-pointer">
                                            <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" preserveAspectRatio="xMidYMid meet">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M8.66667 8H10.6667L8 10.6667L5.33333 8H7.33333V5.33333H8.66667V8ZM10 2.66666H3.33333V13.3333H12.6667V5.33333H10V2.66666ZM2 1.99466C2 1.62933 2.298 1.33333 2.666 1.33333H10.6667L14 4.66666V13.9953C14.0012 14.1721 13.9322 14.3422 13.808 14.4681C13.6839 14.594 13.5148 14.6654 13.338 14.6667H2.662C2.2977 14.6641 2.00291 14.3696 2 14.0053V1.99466Z" fill="black" />
                                            </svg>
                                            <p className="m-0 text-sm font-medium text-center text-black">
                                                Choisir l'image
                                            </p>
                                        </StyledPickerImage>
                                    </div>
                                </div>
                        }
                    </div>
                </div>
            </Collapse>

            <StyledModal
                open={isModalOpen}
                onClose={closeModal}
                aria-labelledby="cover-picker-modal"
                aria-describedby="cover-picker-description"
            >
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16161686] transition-opacity duration-300">
                    <div ref={modalRef} className="flex flex-col items-center gap-8 bg-[#f6f6f6] rounded-lg shadow-lg p-16 w-[80vw] h-[90vh] max-w-[1200px] max-h-[90vh] relative">
                        <div className="flex flex-col items-center gap-8 w-full overflow-x-hidden overflow-y-auto">
                            <svg width={32} height={32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-grow-0 flex-shrink-0 w-8 h-8" preserveAspectRatio="none">
                                <circle cx={16} cy={16} r={16} fill="#000091" />
                                <g clip-path="url(#clip0_1468_24482)">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M22.0007 18V20H24.0007V21.3333H22.0007V23.3333H20.6673V21.3333H18.6673V20H20.6673V18H22.0007ZM22.006 10C22.3713 10 22.6673 10.2967 22.6673 10.662V16.8947C22.2391 16.7434 21.7882 16.6663 21.334 16.6667V11.3333H10.6673L10.668 20.6667L16.8627 14.4713C17.0999 14.2333 17.4772 14.2093 17.7427 14.4153L17.8047 14.472L20.1687 16.8387C19.1241 17.157 18.255 17.8882 17.7628 18.8629C17.2706 19.8376 17.1981 20.9712 17.562 22.0007L9.99532 22C9.62997 21.9996 9.33398 21.7034 9.33398 21.338V10.662C9.33652 10.2977 9.63102 10.0029 9.99532 10H22.006ZM13.334 12.6667C14.0704 12.6667 14.6673 13.2636 14.6673 14C14.6673 14.7364 14.0704 15.3333 13.334 15.3333C12.5976 15.3333 12.0007 14.7364 12.0007 14C12.0007 13.2636 12.5976 12.6667 13.334 12.6667Z" fill="white" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_1468_24482">
                                        <rect width={16} height={16} fill="white" transform="translate(8 8)" />
                                    </clipPath>
                                </defs>
                            </svg>
                            <p className="flex-grow-0 flex-shrink-0 text-lg font-medium text-center text-black">
                                chercher une image de couverture
                            </p>
                            <div className="sticky w-full top-0 z-[9] ">
                                <SearchBar className="w-full" onSearchBarEmpty={() => { setQuery("") }} handleSearch={(newQuery) => setQuery(newQuery)} />
                            </div>
                            <div className="w-full">
                                {!isLoading && !isError && results && (
                                    <Masonry columns={2} spacing={2}>
                                        {(results.chunks as ChunkWithScore<"pdf_image">[])
                                            .sort((a, b) => b.score - a.score)
                                            .map((chunk, index) => {

                                                const selected = chunk.id == selectedChunk?.id;
                                                const imageUrl = `${WEBAPP_URL}/api/s3/presigned_url/object_name/${chunk.metadata.s3ObjectName}`;

                                                return (<MasonaryItem key={index} onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedChunk(chunk);
                                                }}
                                                    className='relative cursor-pointer'
                                                >
                                                    {selected &&
                                                        <div className="absolute w-full h-full z-[1] bg-opacity-50 bg-white">
                                                            <div className="flex w-full h-full items-center justify-center">
                                                                <Button onClick={async (e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    await props.updateChapter({ coverPath: imageUrl })
                                                                    closeModal();
                                                                }}>Définir comme image de couverture</Button>
                                                            </div>
                                                        </div>
                                                    }
                                                    <StyledImageCard
                                                        background
                                                        border
                                                        imageAlt={chunk.text}
                                                        imageUrl={imageUrl}
                                                        end={<BuildCardEnd
                                                            chunk={chunk}
                                                            starred={!!chunk?.user_starred}
                                                            downloadLink={imageUrl}
                                                        />}
                                                        size="medium"
                                                        title=""
                                                        titleAs="h3"
                                                    />
                                                </MasonaryItem>
                                                )
                                            })
                                        }
                                    </Masonry>
                                )}
                            </div>

                            {/* DropZone */}

                            <div {...getRootProps()} className="flex flex-col w-full items-center gap-2 p-4 sm:p-6 rounded-lg"
                                style={{
                                    ...(isDragActive ? { outline: '2px dashed #000091', outlineOffset: '-2px' } : {})
                                }}>
                                <input {...getInputProps()} />

                                <div className="flex flex-col items-center gap-4">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                                        <circle cx="16" cy="16" r="16" fill="#000091" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M15.334 15.3333V11.3333H16.6673V15.3333H20.6673V16.6667H16.6673V20.6667H15.334V16.6667H11.334V15.3333H15.334Z" fill="white" />
                                    </svg>
                                    <p className="m-0 text-lg font-medium text-center text-black">
                                        {!isDragActive ? "ou glissez et déposez en une ici" : "Déposez le fichier ici"}
                                    </p>
                                    <p className="m-0 text-sm text-center text-[#757575]">
                                        Formats possibles : jpg, png
                                    </p>
                                </div>
                                {droppedFile && (
                                    <div className="flex flex-col gap-4 w-full items-center">
                                        <RenderImportedFile isUploading={isUploading} file={droppedFile} onRemove={() => setDroppedFile(null)} />
                                        <ImportedFileSource source={source} setSource={setSource} />
                                        <Button onClick={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            await uploadFileAndSetAsCover(droppedFile);
                                        }}>Importer</Button>
                                    </div>

                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </StyledModal>
        </div>
    );
};

const activeColor = '#e3e3fd';
const StyledCourseInformation = styled.div`
.open {
    background: ${activeColor};
}
.optionContainer {
}

.MuiCollapse-root > div {
    padding: 1rem;
}
`
const CourseInformations = (props: { editor: Editor }) => {
    const context = useContext(EditorContext)

    const { data: chapter, refetch } = useQuery<ChapterWithoutBlocks>({
        queryKey: ['chapter', props.editor.storage.simetadata.chapterId],
        queryFn: () => apiClient.getChapter(props.editor.storage.simetadata.chapterId),
    });

    const updateChapter = async (params: Partial<ChapterWithoutBlocks>) => {
        const chapterId = props.editor.storage.simetadata.chapterId;
        if (!chapterId) return;
        const changed = Object.keys(params as object);
        const hasChanged = changed.some(key => chapter && params && params[key as keyof ChapterWithoutBlocks] !== chapter[key as keyof ChapterWithoutBlocks]);
        if (hasChanged) {
            await apiClient.updateChapter(chapterId, params);
            refetch();
        }
    };

    return <StyledCourseInformation className="flex flex-col">
        <p className="mt-0 sticky top-0 z-[10] bg-white pt-4 flex-grow-0 flex-shrink-0 text-base font-bold text-left text-black">
            SOMMAIRE
        </p>
        <ChapterTableOfContents content={props.editor.getJSON().content || []} editor={props.editor} />

        {chapter && props.editor.isEditable && <>
            <p className="mt-0 sticky top-0 z-[10] bg-white py-4 flex-grow-0 flex-shrink-0 text-base font-bold text-left text-black">
                INFORMATIONS SUR LE CHAPITRE
            </p>
            <EducationLevelPicker
                editor={props.editor}
                availablEducationLevel={context.educationLevels}
                updateChapter={updateChapter}
                chapter={chapter}
            />
            <SchoolSubjectPicker
                editor={props.editor}
                availableSchoolSubjects={context.schoolSubjects}
                updateChapter={updateChapter}
                chapter={chapter}
            />
            <ThemePicker
                editor={props.editor}
                availableThemes={context.themes}
                updateChapter={updateChapter}
                chapter={chapter}
            />
            <SkillsAndKeyIdeasPicker
                editor={props.editor}
                updateChapter={updateChapter}
                chapter={chapter}
            />
            <AdditionalInformationsPicker
                editor={props.editor}
                updateChapter={updateChapter}
                chapter={chapter}
            />
            <CoverPicker
                editor={props.editor}
                updateChapter={updateChapter}
                chapter={chapter}
            />
        </>}

    </StyledCourseInformation>
};
export default CourseInformations;