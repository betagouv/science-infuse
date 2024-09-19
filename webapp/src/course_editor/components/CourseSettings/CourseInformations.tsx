import Button from '@codegouvfr/react-dsfr/Button';
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Editor } from '@tiptap/react';
import { useState, useEffect } from 'react';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { Collapse } from '@mui/material';
import { apiClient } from '@/lib/api-client';
import { EducationLevel, Theme } from '@prisma/client';

const EducationLevelPicker = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [schoolLevels, setSchoolLevels] = useState<EducationLevel[]>([]);

    useEffect(() => {
        const fetchEducationLevels = async () => {
            try {
                const levels = await apiClient.getEducationLevels();
                setSchoolLevels(levels);
            } catch (error) {
                console.error('Error fetching education levels:', error);
            }
        };

        fetchEducationLevels();
    }, []);

    const toggleCollapse = () => {
        setIsOpen(!isOpen);
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
                    {schoolLevels.map((level, index) => (
                        <Checkbox
                            key={index}
                            options={[
                                {
                                    nativeInputProps: {
                                        onChange: () => { }
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

const SchoolsSubjectsPicker = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [schoolSubjects, setSchoolSubjects] = useState<EducationLevel[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

    useEffect(() => {
        const fetchEducationLevels = async () => {
            try {
                const levels = await apiClient.getSchoolsSubjects();
                setSchoolSubjects(levels);
            } catch (error) {
                console.error('Error fetching education levels:', error);
            }
        };

        fetchEducationLevels();
    }, []);

    const toggleCollapse = () => {
        setIsOpen(!isOpen);
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
                    {schoolSubjects.map((subject, index) => (
                        <RadioButtons
                            key={index}
                            options={[
                                {
                                    nativeInputProps: {
                                        checked: selectedSubject === subject.name,
                                        onChange: () => setSelectedSubject(subject.name)
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

const ThemePicker = () => {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        const fetchThemes = async () => {
            try {
                const fetchedThemes = await apiClient.getThemes();
                setThemes(fetchedThemes);
            } catch (error) {
                console.error('Error fetching themes:', error);
            }
        };

        fetchThemes();
    }, []);

    const toggleCollapse = () => {
        setIsOpen(!isOpen);
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
                    {themes.map((theme, index) => (
                        <RadioButtons
                            key={index}
                            options={[
                                {
                                    nativeInputProps: {
                                        checked: selectedTheme === theme,
                                        onChange: () => setSelectedTheme(theme)
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


const CourseInformations = (props: { editor: Editor }) => {
    return <div className="flex flex-col ">
        <EducationLevelPicker />
        <SchoolsSubjectsPicker />
        <ThemePicker />
    </div>
};

export default CourseInformations;