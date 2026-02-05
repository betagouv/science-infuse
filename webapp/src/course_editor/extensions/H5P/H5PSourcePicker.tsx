import React, { useCallback, useRef, useState } from 'react';
import { Editor } from '@tiptap/react';
import { useOnClickOutside } from 'usehooks-ts'
import { useEffect } from '@preact-signals/safe-react/react';
import { Node as PMNode } from '@tiptap/pm/model'
import QuizzGenerator from '@/app/(main)/intelligence-artificielle/quizz/QuizzGenerator';
import QuizzClient from '@/app/(main)/intelligence-artificielle/quizz/QuizzClient';
import QuizzEditor from '@/app/(main)/intelligence-artificielle/quizz/QuizzEditor';



const H5PSourcePicker = (props: { editor: Editor; courseBlockNode: PMNode, closePopup: () => void }) => {

  const handleClosePopup = useCallback(() => {
    if (!ref.current) return;
    if (!ref.current.parentElement) return;
    ref.current.parentElement.style.opacity = '0';
    setTimeout(() => {
      props.closePopup();
    }, 400)
  }, [props])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClosePopup();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClosePopup]);


  const ref = useRef<HTMLDivElement>(null)


  useEffect(() => {
    if (!ref.current) return;
    if (!ref.current.parentElement) return;
    ref.current.parentElement.style.opacity = '0';
    setTimeout(() => {
      if (ref.current && ref.current.parentElement) {
        ref.current.parentElement.style.opacity = '1';
      }
    }, 0)
  }, [ref])

  useOnClickOutside(ref, handleClosePopup)



  const getFullText = () => {
    return props.editor.getText();
  }
  const getCourseBlockText = () => {
    let text = "";
    const { view, state } = props.editor;
    const { doc } = state;

    // Find the position of the node in the document
    let nodePos: number | null = null;
    doc.descendants((n, pos) => {
      if (n === props.courseBlockNode) {
        nodePos = pos;
        return false; // Stop searching
      }
    });

    if (nodePos !== null) {
      const $start = doc.resolve(nodePos);
      const $end = doc.resolve(nodePos + props.courseBlockNode.nodeSize);

      // Get the DOM element first to ensure it's available
      const domElement = view.nodeDOM(nodePos) as HTMLElement | null;
      const domElementById = document.getElementById(props.courseBlockNode.attrs.id);
      const element = domElement || domElementById;

      // Extract text content
      text = doc.textBetween($start.pos, $end.pos);

      if (element) {
        const pdfs: HTMLDivElement[] = Array.from(element.querySelectorAll('.node-pdf .pdf-wrapper'));
        const pdfsTexts = pdfs.map(pdf => pdf.innerText).join("\n\n");
        text += pdfsTexts.trim();
      }

      // Add a small delay to ensure DOM is ready
      if (!text && element) {
        text = element.textContent || '';
      }
    }

    return text.slice(0, 4000);
  };

  // const saveQuiz = () => {
  //   props.editor.commands.updateCourseBlockQuestions(props.courseBlockNode.attrs.id, questions);
  // }

  const [h5pData, setH5pData] = useState<{ downloadH5p?: string, downloadHTML?: string }>({})

  // const handleDownloadH5p = async (type: 'h5p' | 'html') => {
  //   if (h5pData.downloadH5p && type === 'h5p') {
  //     window.open(h5pData.downloadH5p, '_blank')
  //     return;
  //   }
  //   if (h5pData.downloadHTML && type === 'html') {
  //     window.open(h5pData.downloadHTML, '_blank')
  //     return;
  //   }
  //   const data = await apiClient.exportH5p({
  //     type: 'question', data: questions,
  //     documentIds: []
  //   })
  //   setH5pData(data)
  //   if (type === 'h5p') {
  //     window.open(data.downloadH5p, '_blank')
  //   }
  //   if (type === 'html') {
  //     window.open(data.downloadHTML, '_blank')
  //   }
  // }


  return (
    <div className="flex h-full transition-[0.4s] w-full items-center justify-center bg-[#16161686]">

      <div ref={ref} className="overflow-auto flex flex-col items-center gap-8 bg-[#f6f6f6] rounded-lg shadow-lg p-16 w-[80vw] h-fit max-w-[800px] max-h-[90vh]">
        test
        {/* <QuizzEditor
          onBackClicked={() => {
            // setDocumentId(undefined)
            // setLoading(false);
          }}
          documentId={"8b0546be-d631-4c2e-9437-f8d270d440ab"}
        // onDocumentProcessingEnd={onDocumentProcessingEnd}
        /> */}
      </div>
    </div>
  );
};

export default H5PSourcePicker;