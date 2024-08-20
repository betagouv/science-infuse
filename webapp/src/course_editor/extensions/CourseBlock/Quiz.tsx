import React, { useState } from 'react'
import {
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    Button,
    Paper,
    TextField,
    IconButton,
    CircularProgress,
    Collapse,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { motion, AnimatePresence } from 'framer-motion'
import { apiClient } from '@/lib/api-client';
import { useSnackbar } from '@/app/SnackBarProvider';

export interface Question {
    question: string
    options: { answer: string; correct: boolean }[]
}

const Quiz = (props: { parentRef: React.RefObject<HTMLElement>, getContext: () => string, questions: Question[], setQuestions: (questions: Question[]) => void, isExpanded: boolean, setIsExpanded: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const { getContext, questions, setQuestions } = props;
    const [isGenerating, setIsGenerating] = useState(false);
    const { isExpanded, setIsExpanded } = props;
    const { showSnackbar } = useSnackbar();

    const addQuestion = () => {
        setIsExpanded(true);

        setQuestions([
            ...questions,
            {
                question: '',
                options: [
                    { answer: '', correct: false },
                    { answer: '', correct: false },
                ],
            },
        ])
    }

    const generateQuiz = async () => {
        if (!getContext)
            return;
        props.parentRef?.current && props.parentRef.current.classList.add('ai-loading')
        props.parentRef?.current && props.parentRef.current.querySelectorAll('.node-pdf').forEach(el => el.classList.add('ai-loading'))

        setIsGenerating(true);
        const context = getContext();
        try {
            const quiz = await apiClient.generateQuiz(context);
            setQuestions(JSON.parse(quiz));
            setIsExpanded(true);
            showSnackbar(
                <div className="flex flex-col items-start justify-start gap-2">
                    <p className="font-semibold  m-0">Quiz généré avec succès <span></span></p>
                    <p className="text-sm m-0 text-gray-600">Pensez à vérifier l'exactitude <br /> des questions et des réponses</p>
                </div>,
                'info',
                <AutoAwesomeIcon className="text-blue-500" />
            )
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
            props.parentRef?.current && props.parentRef.current.classList.remove('ai-loading')
            props.parentRef?.current && props.parentRef.current.querySelectorAll('.node-pdf').forEach(el => el.classList.remove('ai-loading'))
        }
    }

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index))
    }

    const updateQuestion = (index: number, newQuestion: string) => {
        const updatedQuestions = [...questions]
        updatedQuestions[index].question = newQuestion
        setQuestions(updatedQuestions)
    }

    const addOption = (questionIndex: number) => {
        const updatedQuestions = [...questions]
        updatedQuestions[questionIndex].options.push({ answer: '', correct: false })
        setQuestions(updatedQuestions)
    }

    const removeOption = (questionIndex: number, optionIndex: number) => {
        const updatedQuestions = [...questions]
        updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter(
            (_, i) => i !== optionIndex
        )
        setQuestions(updatedQuestions)
    }

    const updateOption = (questionIndex: number, optionIndex: number, newAnswer: string) => {
        const updatedQuestions = [...questions]
        updatedQuestions[questionIndex].options[optionIndex].answer = newAnswer
        setQuestions(updatedQuestions)
    }

    const toggleCorrect = (questionIndex: number, optionIndex: number) => {
        const updatedQuestions = [...questions]
        updatedQuestions[questionIndex].options[optionIndex].correct = !updatedQuestions[questionIndex].options[optionIndex].correct
        setQuestions(updatedQuestions)
    }
    const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const questionVariants = {
        hidden: {
            opacity: 0,
            y: 10
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.3,
                ease: "easeIn"
            }
        }
    };

    const optionVariants = {
        hidden: {
            opacity: 0,
            x: -5
        },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            x: 5,
            transition: {
                duration: 0.2,
                ease: "easeIn"
            }
        }
    };

    return (
        <Box className="w-full flex flex-col gap-4 max-w-4xl mx-auto mt-8 p-6 bg-[--background-default-grey] rounded-lg shadow-lg">
            {questions.length > 0 && (
                <Button
                    onClick={() => setIsExpanded(!isExpanded)}
                    startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    className="mb-4"
                >
                    {isExpanded ? 'Masquer le quiz' : 'Afficher le quiz'}
                </Button>
            )}
            <Collapse in={isExpanded}>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <AnimatePresence>
                        {questions.map((question, questionIndex) => (
                            <motion.div
                                key={questionIndex}
                                variants={questionVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                layout
                            >
                                <Paper className="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm transition-shadow duration-300 hover:shadow-md">
                                    <Box className="flex items-center justify-between mb-4">
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label={`Question ${questionIndex + 1}`}
                                            value={question.question}
                                            onChange={(e) => updateQuestion(questionIndex, e.target.value)}
                                            className="mr-4"
                                        />
                                        <IconButton
                                            onClick={() => removeQuestion(questionIndex)}
                                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                    <AnimatePresence>
                                        {question.options.map((option, optionIndex) => (
                                            <motion.div
                                                key={optionIndex}
                                                variants={optionVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                layout
                                            >
                                                <Box className="flex items-center mb-2">
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={option.correct}
                                                                onChange={() => toggleCorrect(questionIndex, optionIndex)}
                                                            />
                                                        }
                                                        label=""
                                                    />
                                                    <TextField
                                                        fullWidth
                                                        variant="outlined"
                                                        size="small"
                                                        value={option.answer}
                                                        onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                                                        className="mr-2"
                                                    />
                                                    <IconButton
                                                        onClick={() => removeOption(questionIndex, optionIndex)}
                                                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Button
                                            startIcon={<AddIcon />}
                                            onClick={() => addOption(questionIndex)}
                                            className="mt-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                        >
                                            Ajouter une option
                                        </Button>
                                    </motion.div>
                                </Paper>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </Collapse>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-row gap-8">
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={addQuestion}
                        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-sm transition-all duration-300 ease-in-out hover:shadow-md"
                    >
                        {questions.length > 0 ? "Ajouter une question" : "Créer un quiz"}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={isGenerating ? <CircularProgress size={24} /> : <AutoAwesomeIcon />}
                        onClick={generateQuiz}
                        disabled={isGenerating}
                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-sm transition-all duration-300 ease-in-out hover:shadow-md"
                    >
                        {isGenerating ? 'Génération en cours...' : 'Générer un quiz basé sur le bloc'}
                    </Button>
                </div>
            </motion.div>
        </Box>
    )
}

export default Quiz