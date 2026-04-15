import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { useOnClickOutside } from 'usehooks-ts';
import { Node as PMNode } from '@tiptap/pm/model';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@codegouvfr/react-dsfr/Button';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SubjectIcon from '@mui/icons-material/Subject';
import StyleIcon from '@mui/icons-material/Style';
import GridOnIcon from '@mui/icons-material/GridOn';
import QuizzManager from '@/app/(main)/intelligence-artificielle/quizz/QuizzEditor';
import TexteATrousManager from '@/app/(main)/intelligence-artificielle/texte-a-trous/TexteATrousEditor';
import DialogcardManager from '@/app/(main)/intelligence-artificielle/dialogcards/DialogcardEditor';
import MotsCroisesManager from '@/app/(main)/intelligence-artificielle/mots-croises/MotsCroisesEditor';

type SourceType = 'full' | 'chapter';
export type H5PContentType = 'quiz' | 'texte-a-trous' | 'dialogcards' | 'mots-croises';

interface H5PPopupProps {
  editor: Editor;
  courseBlockNode: PMNode;
  closePopup: () => void;
  h5PContentType: H5PContentType;
}

const H5PPopup: React.FC<H5PPopupProps> = ({
  editor,
  courseBlockNode,
  closePopup,
  h5PContentType,
}) => {
  const [selectedSource, setSelectedSource] = useState<SourceType | null>(null);
  const [generatedH5pId, setGeneratedH5pId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Handle popup close with fade animation
  const handleClosePopup = useCallback(() => {
    if (!ref.current?.parentElement) return;

    ref.current.parentElement.style.opacity = '0';
    setTimeout(() => {
      closePopup();
    }, 400);
  }, [closePopup]);

  // Handle Escape key to close popup
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClosePopup();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClosePopup]);

  // Fade in animation on mount
  useEffect(() => {
    if (!ref.current?.parentElement) return;

    ref.current.parentElement.style.opacity = '0';
    requestAnimationFrame(() => {
      if (ref.current?.parentElement) {
        ref.current.parentElement.style.opacity = '1';
      }
    });
  }, []);

  // Close on click outside
  useOnClickOutside(ref, handleClosePopup);

  // Extract full document text
  const getFullText = (): string => {
    return editor.getText();
  };

  // Extract current chapter/block text
  const getCourseBlockText = (): string => {
    const { view, state } = editor;
    const { doc } = state;

    // Find the position of the node in the document by matching on id attribute
    // (reference equality fails because ProseMirror creates new node instances on transactions)
    const courseBlockId = courseBlockNode.attrs.id;
    let nodePos: number | null = null;
    let matchedNode: PMNode | null = null;
    doc.descendants((node, pos) => {
      if (node.attrs.id && node.attrs.id === courseBlockId) {
        nodePos = pos;
        matchedNode = node;
        return false; // Stop searching
      }
    });

    if (nodePos === null || !matchedNode) return '';

    const $start = doc.resolve(nodePos);
    const $end = doc.resolve(nodePos + (matchedNode as PMNode).nodeSize);

    // Extract text content
    let text = doc.textBetween($start.pos, $end.pos);

    // Get DOM element to extract PDF text if present
    const domElement = view.nodeDOM(nodePos) as HTMLElement | null;
    const domElementById = document.getElementById(courseBlockId);
    const element = domElement || domElementById;

    if (element) {
      const pdfs: HTMLDivElement[] = Array.from(
        element.querySelectorAll('.node-pdf .pdf-wrapper')
      );
      const pdfsTexts = pdfs.map((pdf) => pdf.innerText).join('\n\n');
      text += pdfsTexts.trim();
    }

    // Fallback to textContent if needed
    if (!text && element) {
      text = element.textContent || '';
    }

    return text.slice(0, 4000);
  };

  // Get context based on selected source
  const getContext = (): string => {
    if (selectedSource === 'full') {
      return getFullText();
    } else if (selectedSource === 'chapter') {
      return getCourseBlockText();
    }
    return '';
  };

  // Handle back navigation
  const handleBack = () => {
    setSelectedSource(null);
    setGeneratedH5pId(null);
  };

  // Get icon and color based on content type
  const getContentTypeInfo = () => {
    switch (h5PContentType) {
      case 'quiz':
        return { icon: AutoAwesomeIcon, label: 'Quiz', color: '#4f46e5', bgColor: '#e8edff' };
      case 'texte-a-trous':
        return { icon: SubjectIcon, label: 'Texte à trous', color: '#d97706', bgColor: '#fef3c7' };
      case 'dialogcards':
        return { icon: StyleIcon, label: 'Flash Cards', color: '#059669', bgColor: '#d1fae5' };
      case 'mots-croises':
        return { icon: GridOnIcon, label: 'Mots croisés', color: '#dc2626', bgColor: '#fee2e2' };
      default:
        return { icon: AutoAwesomeIcon, label: '', color: '#4f46e5', bgColor: '#e8edff' };
    }
  };

  // Render source selection step
  const renderSourceSelection = () => {
    const { icon: Icon, label, color, bgColor } = getContentTypeInfo();
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-8 w-full"
      >
        {/* Header with content type badge */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex items-center gap-3 px-6 py-3 rounded-full text-white font-medium"
            style={{ backgroundColor: color }}
          >
            <Icon className="text-2xl" />
            <span>Générer {label}</span>
          </div>
          <h2 className="text-2xl font-bold text-center text-[#161616]">Choisir la source</h2>
        </div>

        {/* Source options */}
        <div className="flex flex-col gap-4 w-full">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedSource('full')}
            className="w-full flex items-center gap-4 p-6 rounded-xl bg-white border-2 border-[#e8edff] hover:border-[#4f46e5] transition-colors text-left"
          >
            <div className="flex-shrink-0 flex justify-center items-center w-12 h-12 rounded-lg bg-[#ececfe]">
              <DescriptionIcon className="text-2xl text-[#4f46e5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-[#161616]">Texte complet</span>
              <span className="text-sm text-[#6b7280]">Générer à partir de tout le contenu du cours</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedSource('chapter')}
            className="w-full flex items-center gap-4 p-6 rounded-xl bg-white border-2 border-[#e8edff] hover:border-[#4f46e5] transition-colors text-left"
          >
            <div className="flex-shrink-0 flex justify-center items-center w-12 h-12 rounded-lg bg-[#ececfe]">
              <MenuBookIcon className="text-2xl text-[#4f46e5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-[#161616]">Chapitre actuel</span>
              <span className="text-sm text-[#6b7280]">Générer à partir du bloc de cours actuel</span>
            </div>
          </motion.button>
        </div>
      </motion.div>
    );
  };

  const onH5PGenerated = (h5pId: string) => {
    console.log("onH5PGenerated", h5pId)
    setGeneratedH5pId(h5pId);
  }
  // Render content manager based on content type prop
  const renderContentManager = () => {
    const context = getContext();
    const source = { type: 'additionalContext' as const, context };

    if (h5PContentType === 'quiz') {
      return <QuizzManager source={source} hideBackButton={true} onH5PGenerated={onH5PGenerated} />;
    }

    if (h5PContentType === 'texte-a-trous') {
      return <TexteATrousManager source={source} hideBackButton={true} onH5PGenerated={onH5PGenerated} />;
    }

    if (h5PContentType === 'dialogcards') {
      return <DialogcardManager source={source} hideBackButton={true} onH5PGenerated={onH5PGenerated} />;
    }

    if (h5PContentType === 'mots-croises') {
      return <MotsCroisesManager source={source} hideBackButton={true} onH5PGenerated={onH5PGenerated} />;
    }

    return null;
  };

  const { icon: Icon, label, color } = getContentTypeInfo();

  return (
    <div className="flex h-full transition-[0.4s] w-full items-center justify-center bg-[#16161686]">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-auto flex flex-col items-center gap-8 bg-white rounded-xl shadow-2xl w-[90vw] md:w-[80vw] h-fit max-w-[700px] max-h-[90vh] relative"
      >
        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClosePopup}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb] transition-colors"
          title="Fermer"
        >
          <CloseIcon className="text-xl" />
        </motion.button>

        {/* Header with content type indicator */}
        <div className="w-full flex items-center justify-between px-8 md:px-12 py-4 sticky top-0 bg-white z-10">
          {selectedSource && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#6b7280] hover:bg-[#e5e7eb] transition-colors"
            >
              <ArrowBackIcon className="text-xl" />
              <span>Retour</span>
            </motion.button>
          )}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ backgroundColor: color + '20' }}
            >
              <Icon style={{ color }} className="text-xl" />
            </div>
            <span className="text-lg font-semibold text-[#161616]">{label}</span>
          </div>

          {generatedH5pId && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                editor.chain().focus().setTextSelection(editor.state.selection.to).insertH5PBlock({ h5pContentId: generatedH5pId, h5pContentType: h5PContentType }).run();
                handleClosePopup();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white transition-colors"
            >
              <AddIcon className="text-xl" />
              <span>Insérer</span>
            </motion.button>
          )}


        </div>

        {/* Content */}
        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {!selectedSource ? (
              <motion.div
                key="source-selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {renderSourceSelection()}
              </motion.div>
            ) : (
              <motion.div
                key="content-manager"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {renderContentManager()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default H5PPopup;