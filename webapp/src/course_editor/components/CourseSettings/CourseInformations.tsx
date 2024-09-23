import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Editor } from '@tiptap/react';
import { useState, useEffect, useContext } from 'react';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { Collapse } from '@mui/material';
import { apiClient, ChapterWithoutBlocks } from '@/lib/api-client';
import { EducationLevel, SchoolSubject, Theme } from '@prisma/client';
import { EditorContext } from '@/course_editor/context/EditorContext';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useDebounceValue } from "usehooks-ts";

const EducationLevelPicker = (props: { editor: Editor, availablEducationLevel: EducationLevel[], chapter: ChapterWithoutBlocks, updateChapter: (chapter: Partial<ChapterWithoutBlocks>) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleCollapse = () => {
        setIsOpen(!isOpen);
    };

    const handleEducationLevelChange = async (level: EducationLevel, checked: boolean) => {
        try {
            if (!props.chapter) return;

            const updatedLevels = !checked
                ? (props.chapter?.educationLevels || []).filter(e => e.id !== level.id)
                : [...(props.chapter?.educationLevels || []), level];

            props.updateChapter({ educationLevels: updatedLevels })
        } catch (error) {
            console.error('Error updating chapter:', error);
        }
    };

    return (
        <div>
            <div onClick={toggleCollapse} className="flex cursor-pointer items-center gap-2 py-4 sticky top-0 w-full bg-white z-[1]">
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
        <div>
            <div onClick={toggleCollapse} className="flex cursor-pointer items-center gap-2 py-4 sticky top-0 w-full bg-white z-[1]">
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
        <div>
            <div onClick={toggleCollapse} className="flex cursor-pointer items-center gap-2 py-4 sticky top-0 w-full bg-white z-[1]">
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
        <div>
            <div onClick={toggleCollapse} className="flex cursor-pointer items-center gap-2 py-4 sticky top-0 w-full bg-white z-[1]">
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
                            placeholder: "A compléter...",
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
        <div>
            <div onClick={toggleCollapse} className="flex cursor-pointer items-center gap-2 py-4 sticky top-0 w-full bg-white z-[1]">
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
                            placeholder: "",
                        }}
                        textArea
                    />
                </div>
            </Collapse>
        </div>
    );
};

const CourseInformations = (props: { editor: Editor }) => {
    const context = useContext(EditorContext)

    const { data: chapter, refetch } = useQuery<ChapterWithoutBlocks>({
        queryKey: ['chapter', props.editor.storage.simetadata.chapterId],
        queryFn: () => apiClient.getChapter(props.editor.storage.simetadata.chapterId),
    });

    const updateChapter = async (params: Partial<ChapterWithoutBlocks>) => {
        const changed = Object.keys(params as object);
        const hasChanged = changed.some(key => chapter && params && params[key as keyof ChapterWithoutBlocks] !== chapter[key as keyof ChapterWithoutBlocks]);
        if (hasChanged) {
            await apiClient.updateChapter(props.editor.storage.simetadata.chapterId, params);
            refetch();
        }
    };

    return <div className="flex flex-col ">
        <p className="flex-grow-0 flex-shrink-0 text-base font-bold text-left text-black">
            INFORMATIONS SUR LE CHAPITRE
        </p>
        {chapter && <EducationLevelPicker
            editor={props.editor}
            availablEducationLevel={context.educationLevels}
            updateChapter={updateChapter}
            chapter={chapter}
        />}
        {chapter && <SchoolSubjectPicker
            editor={props.editor}
            availableSchoolSubjects={context.schoolSubjects}
            updateChapter={updateChapter}
            chapter={chapter}
        />}
        {chapter && <ThemePicker
            editor={props.editor}
            availableThemes={context.themes}
            updateChapter={updateChapter}
            chapter={chapter}
        />}

        {chapter && <SkillsAndKeyIdeasPicker
            editor={props.editor}
            updateChapter={updateChapter}
            chapter={chapter}
        />}

        {chapter && <AdditionalInformationsPicker
            editor={props.editor}
            updateChapter={updateChapter}
            chapter={chapter}
        />}
    </div>
};
export default CourseInformations;