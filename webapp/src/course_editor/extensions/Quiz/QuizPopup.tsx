import React, { useCallback, useRef, useState } from 'react';
import { Editor } from '@tiptap/react';
import { useOnClickOutside } from 'usehooks-ts'
import { useEffect } from '@preact-signals/safe-react/react';
import { CircularProgress, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@codegouvfr/react-dsfr/Button';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { useSnackbar } from '@/app/SnackBarProvider';
import { apiClient } from '@/lib/api-client';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Node as PMNode } from '@tiptap/pm/model'
import { Question } from '@/types/course-editor';



const QuizPopup = (props: { editor: Editor; courseBlockNode: PMNode, closePopup: () => void }) => {

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


  const [questions, setQuestions] = useState<Question[]>(props.courseBlockNode.attrs.quizQuestions || [
    {
      question: '',
      options: [{ answer: '', correct: false }],
    },
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: [{ answer: '', correct: false }] }]);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push({ answer: '', correct: false });
    setQuestions(newQuestions);
  };

  const updateQuestion = (questionIndex: number, newText: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].question = newText;
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, newText: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex].answer = newText;
    setQuestions(newQuestions);
  };

  const toggleCorrectOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex].correct = !newQuestions[questionIndex].options[optionIndex].correct;
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(newQuestions);
  };

  const removeQuestion = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(questionIndex, 1);
    setQuestions(newQuestions);
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const { showSnackbar } = useSnackbar();


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
      const domElement = view.nodeDOM(nodePos) as HTMLElement | null;

      // Extract text content
      text = doc.textBetween($start.pos, $end.pos);

      if (domElement) {
        const pdfs: HTMLDivElement[] = Array.from(domElement.querySelectorAll('.node-pdf .pdf-wrapper'));
        const pdfsTexts = pdfs.map(pdf => pdf.innerText).join("\n\n");
        text += pdfsTexts.trim().slice(0, 2000);
      }
    }

    return text.slice(0, 4000);
  };

  const generateQuiz = async (context: string) => {
    setIsGenerating(true);
    try {
      const quiz = await apiClient.generateQuiz(context);
      setQuestions(JSON.parse(quiz));
    } catch (error) {
      showSnackbar(
        <div className="flex flex-col items-start justify-start gap-2">
          <p className="font-semibold m-0 text-red-500">Échec la génération du quiz</p>
          <p className="text-sm m-0 text-gray-600">Veuillez réessayer ultérieurement</p>
        </div>,
        'error',
        <AutoAwesomeIcon className="text-red-500" />
      )

    } finally {
      setIsGenerating(false);
    }
  }

  const handleGenerateQuiz = (type: 'courseBlock' | 'fullChapter') => {
    const context = type === 'courseBlock' ? getCourseBlockText() : getFullText();
    generateQuiz(context);
  }

  const saveQuiz = () => {
    props.editor.commands.updateCourseBlockQuestions(props.courseBlockNode.attrs.id, questions);
    showSnackbar(
      <div className="flex flex-col items-start justify-start gap-2">
        <p className="font-semibold  m-0">Quiz sauvegardé avec succès</p>
      </div>,
      'info',
      <AutoAwesomeIcon className="text-blue-500" />
    )
    setTimeout(() => {
      handleClosePopup();
    }, 500)
  }

  const [h5pData, setH5pData] = useState<{ downloadH5p?: string, downloadHTML?: string }>({})

  const handleDownloadH5p = async (type: 'h5p' | 'html') => {
    if (h5pData.downloadH5p && type === 'h5p') {
      window.open(h5pData.downloadH5p, '_blank')
      return;
    }
    if (h5pData.downloadHTML && type === 'html') {
      window.open(h5pData.downloadHTML, '_blank')
      return;
    }
    const data = await apiClient.exportH5p({ type: 'question', data: questions })
    setH5pData(data)
    if (type === 'h5p') {
      window.open(data.downloadH5p, '_blank')
    }
    if (type === 'html') {
      window.open(data.downloadHTML, '_blank')
    }
  }


  return (
    <div className="flex h-full transition-[0.4s] w-full items-center justify-center bg-[#16161686]">

      <div ref={ref} className="overflow-auto flex flex-col items-center gap-8 bg-[#f6f6f6] rounded-lg shadow-lg p-16 w-[80vw] h-fit max-w-[800px] max-h-[90vh]">
        <p className="m-0 text-2xl font-bold text-center text-black">Quiz ({questions.length} question{questions.length > 1 ? 's' : ''})</p>

        <div className="flex gap-4">
          {isGenerating ? (
            <div className='flex gap-4'>
              <CircularProgress sx={{ color: '#00000094' }} size={24} />
              <p className="font-semibold m-0">Génération en cours</p>
            </div>
          ) : (
            <>
              {getCourseBlockText().length > 100 && <Button
                iconId="fr-icon-sparkling-2-line"
                iconPosition="right"
                className='bg-black'
                disabled={isGenerating}
                onClick={() => handleGenerateQuiz('courseBlock')}
              >
                Générer un quiz sur le bloc
              </Button>}
              <Button
                iconId="fr-icon-sparkling-2-line"
                iconPosition="right"
                disabled={isGenerating}
                onClick={() => handleGenerateQuiz('fullChapter')}
              >
                Générer un quiz sur le chapitre
              </Button>
            </>
          )}
        </div>
        <div className="flex flex-col md:flex-row items-start gap-2 mx-auto">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-4 h-4 mt-1"><path fillRule="evenodd" clipRule="evenodd" d="M12.9993 1.66666H2.99935C2.26297 1.66666 1.66602 2.26361 1.66602 2.99999V13C1.66602 13.7364 2.26297 14.3333 2.99935 14.3333H12.9993C13.7357 14.3333 14.3327 13.7364 14.3327 13V2.99999C14.3327 2.26361 13.7357 1.66666 12.9993 1.66666ZM8.66602 4.66666H7.33268V5.99999H8.66602V4.66666ZM8.66602 7.33332H7.33268V11.3333H8.66602V7.33332Z" fill="black" /></svg>
          <p className="m-0 text-xs text-left text-black">
            L'intelligence artificielle de Science Infuse vous propose des questions et réponses d'après le
            chapitre que vous avez créé. Vous pouvez modifier ou supprimer les questions et réponses
            proposées.
          </p>
        </div>

        <div className="w-full bg-gray-100 rounded-lg">
          {questions.map((question, questionIndex) => (
            <div key={questionIndex} className="mb-8 p-6 bg-white rounded-lg shadow-sm relative">
              <IconButton
                onClick={() => removeQuestion(questionIndex)}
                className="text-red-500 !absolute top-2 right-2"
              >
                <DeleteIcon />
              </IconButton>
              <p className="m-0 mb-4 text-lg text-center text-black underline">Question {questionIndex + 1}</p>

              <div className="mt-4">
                <Checkbox
                  legend={<Input
                    label=" "
                    nativeInputProps={{
                      value: question.question,
                      onChange: (e) => updateQuestion(questionIndex, e.target.value),
                      required: true,
                      placeholder: "Rédiger la question.",
                    }}
                  />}
                  options={question.options.map((option, optionIndex) => ({
                    label: <div className='flex w-full'>
                      <Input
                        label=""
                        className='!m-0 !p-0 [&_input]:!m-0 w-full'
                        nativeInputProps={{
                          className: 'm-0',
                          value: option.answer,
                          onChange: (e) => updateOption(questionIndex, optionIndex, e.target.value),
                          required: true,
                          placeholder: "Compléter avec une réponse.",
                        }}
                      />
                      <IconButton
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        className="text-red-500"
                      >
                        <DeleteIcon />
                      </IconButton>

                    </div>,
                    nativeInputProps: {
                      name: `question-${questionIndex}`,
                      checked: option.correct,
                      onChange: () => toggleCorrectOption(questionIndex, optionIndex)
                    }
                  }))}
                  state="default"
                />
              </div>
              <Button
                className='w-full flex items-center justify-center mt-8'
                priority='secondary'
                onClick={() => addOption(questionIndex)}
              >
                Ajouter une réponse supplémentaire
              </Button>
            </div>
          ))}

          <div className="flex flex-col w-full gap-4">
            <Button
              className='w-full flex items-center justify-center'
              priority='secondary'
              onClick={addQuestion}
            >
              Ajouter une question
            </Button>
            <Button
              className='w-full flex items-center justify-center'
              priority='primary'
              onClick={() => { saveQuiz() }}
            >
              Enregistrer le quiz
            </Button>

            <Button className='w-full flex items-center justify-center' priority='tertiary no outline' iconId="fr-icon-download-fill" iconPosition="right" onClick={() => handleDownloadH5p('h5p')}>Télécharger en H5P</Button>
            <Button className='w-full flex items-center justify-center' priority='tertiary no outline' iconId="fr-icon-download-fill" iconPosition="right" onClick={() => handleDownloadH5p('html')}>Télécharger en HTML</Button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPopup;