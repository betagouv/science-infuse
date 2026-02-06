import { PROJECT_NAME } from '@/config';
import { Editor } from '@tiptap/core';
import { Node as PMNode } from '@tiptap/pm/model';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StyleIcon from '@mui/icons-material/Style';
import ImageIcon from '@mui/icons-material/Image';
import SubjectIcon from '@mui/icons-material/Subject';
import GridOnIcon from '@mui/icons-material/GridOn';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

type H5PContentType = 'quiz' | 'texte-a-trous' | 'dialogcards' | 'mots-croises';

interface ActionButtonsProps {
    courseBlockNode: PMNode;
    editor: Editor;
    pos?: number;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ courseBlockNode, editor, pos = 0, collapsed: externalCollapsed, onToggleCollapse }) => {
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const isCollapsed = externalCollapsed ?? internalCollapsed;
    const handleToggle = onToggleCollapse ?? (() => setInternalCollapsed(prev => !prev));
    const handleH5PClick = (contentType: H5PContentType) => {
        editor.commands.openH5pPopup(courseBlockNode, contentType);
    };

    return (
        <div contentEditable={false} className="w-full overflow-hidden">
            <AnimatePresence mode="wait">
                {isCollapsed ? (
                    <motion.div
                        key="collapsed"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="w-full flex items-center justify-center gap-2 py-2"
                    >
                        {/* Import File - Icon only */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => editor.commands.openFileImportPopup(pos)}
                            className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg bg-white border-2 border-[#e8edff] hover:border-[#4f46e5] transition-colors"
                            title="Importer un fichier"
                        >
                            <UploadFileIcon className="text-xl text-[#4f46e5]" />
                        </motion.button>

                        {/* Search - Icon only */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => editor.commands.openContentSearchPopup(pos)}
                            className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg bg-white border-2 border-[#e8edff] hover:border-[#4f46e5] transition-colors"
                            title={`Chercher dans ${PROJECT_NAME}`}
                        >
                            <SearchIcon className="text-xl text-[#4f46e5]" />
                        </motion.button>

                        {/* Quiz - Icon only */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleH5PClick('quiz')}
                            className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg bg-[#e8edff] text-[#4f46e5] hover:opacity-80 transition-opacity"
                            title="Générer un quiz"
                        >
                            <AutoAwesomeIcon className="text-xl" />
                        </motion.button>

                        {/* Flash Cards - Icon only */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleH5PClick('dialogcards')}
                            className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg bg-[#e8edff] text-[#6366f1] hover:opacity-80 transition-opacity"
                            title="Flash cards"
                        >
                            <StyleIcon className="text-xl" />
                        </motion.button>

                        {/* Image à compléter - Icon only */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleH5PClick('texte-a-trous')}
                            className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg bg-[#d1fae5] text-[#059669] hover:opacity-80 transition-opacity"
                            title="Image à compléter"
                        >
                            <ImageIcon className="text-xl" />
                        </motion.button>

                        {/* Texte à trous - Icon only */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleH5PClick('texte-a-trous')}
                            className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg bg-[#fef3c7] text-[#d97706] hover:opacity-80 transition-opacity"
                            title="Texte à trous"
                        >
                            <SubjectIcon className="text-xl" />
                        </motion.button>

                        {/* Mots croisés - Icon only */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleH5PClick('mots-croises')}
                            className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg bg-[#fee2e2] text-[#dc2626] hover:opacity-80 transition-opacity"
                            title="Mots croisés"
                        >
                            <GridOnIcon className="text-xl" />
                        </motion.button>

                        {/* Toggle expand/collapse button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleToggle}
                            className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb] transition-colors ml-2"
                            title="Développer"
                        >
                            <KeyboardArrowRightIcon className="text-xl" />
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="w-full flex flex-col gap-6"
                    >
                        {/* Top Action Buttons */}
                        <div className="w-full flex flex-wrap justify-center items-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => editor.commands.openFileImportPopup(pos)}
                                className="flex-1 min-w-[200px] max-w-[300px] cursor-pointer flex items-center gap-3 p-4 rounded-lg bg-white border-2 border-[#e8edff] hover:border-[#4f46e5] transition-colors"
                            >
                                <div className="flex-shrink-0 flex justify-center items-center w-10 h-10 rounded-lg bg-[#ececfe]">
                                    <UploadFileIcon className="text-xl text-[#4f46e5]" />
                                </div>
                                <p className="m-0 text-base font-medium text-[#161616]">
                                    Importer un fichier
                                </p>
                            </motion.button>

                            <span className="text-[#9ca3af] text-sm font-medium">ou</span>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => editor.commands.openContentSearchPopup(pos)}
                                className="flex-1 min-w-[200px] max-w-[300px] cursor-pointer flex items-center gap-3 p-4 rounded-lg bg-white border-2 border-[#e8edff] hover:border-[#4f46e5] transition-colors"
                            >
                                <div className="flex-shrink-0 flex justify-center items-center w-10 h-10 rounded-lg bg-[#ececfe]">
                                    <SearchIcon className="text-xl text-[#4f46e5]" />
                                </div>
                                <p className="m-0 text-base font-medium text-[#161616]">
                                    Chercher dans {PROJECT_NAME}
                                </p>
                            </motion.button>
                        </div>

                        {/* H5P Content Generation Section */}
                        <div className="w-full flex flex-col gap-4 whitespace-nowrap">
                            <h3 className="text-center text-[#6b7280] text-base font-medium m-0">
                                Générer un module d'exercice:
                            </h3>

                            <div className="w-full flex flex-wrap justify-center items-center gap-4">
                                {/* Quiz Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleH5PClick('quiz')}
                                    className="flex-1 min-w-[180px] max-w-[280px] cursor-pointer flex items-center gap-3 p-4 rounded-lg bg-[#e8edff] text-[#4f46e5] hover:opacity-80 transition-opacity"
                                >
                                    <AutoAwesomeIcon className="text-2xl flex-shrink-0" />
                                    <p className="m-0 text-base font-medium">
                                        Générer un quiz
                                    </p>
                                </motion.button>

                                {/* Flash Cards Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleH5PClick('dialogcards')}
                                    className="flex-1 min-w-[180px] max-w-[280px] cursor-pointer flex items-center gap-3 p-4 rounded-lg bg-[#e8edff] text-[#6366f1] hover:opacity-80 transition-opacity"
                                >
                                    <StyleIcon className="text-2xl flex-shrink-0" />
                                    <p className="m-0 text-base font-medium">
                                        Flash cards
                                    </p>
                                </motion.button>

                                {/* Image à compléter Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleH5PClick('texte-a-trous')}
                                    className="flex-1 min-w-[180px] max-w-[280px] cursor-pointer flex items-center gap-3 p-4 rounded-lg bg-[#d1fae5] text-[#059669] hover:opacity-80 transition-opacity"
                                >
                                    <ImageIcon className="text-2xl flex-shrink-0" />
                                    <p className="m-0 text-base font-medium">
                                        Image à compléter
                                    </p>
                                </motion.button>

                                {/* Texte à trous Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleH5PClick('texte-a-trous')}
                                    className="flex-1 min-w-[180px] max-w-[280px] cursor-pointer flex items-center gap-3 p-4 rounded-lg bg-[#fef3c7] text-[#d97706] hover:opacity-80 transition-opacity"
                                >
                                    <SubjectIcon className="text-2xl flex-shrink-0" />
                                    <p className="m-0 text-base font-medium">
                                        Texte à trous
                                    </p>
                                </motion.button>
                            </div>

                            {/* Crossword Button - Full Width */}
                            <div className="w-full flex justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleH5PClick('mots-croises')}
                                    className="min-w-[180px] max-w-[280px] cursor-pointer flex items-center gap-3 p-4 rounded-lg bg-[#fee2e2] text-[#dc2626] hover:opacity-80 transition-opacity"
                                >
                                    <GridOnIcon className="text-2xl flex-shrink-0" />
                                    <p className="m-0 text-base font-medium">
                                        Mots croisés
                                    </p>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ActionButtons;