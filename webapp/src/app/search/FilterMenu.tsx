import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { useState } from '@preact-signals/safe-react/react';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const grades = ['5ème', '4ème', '3ème']
const subFields = ["Monde microbien", "Prévention et lutte contre les infections et les contaminations", "Réactions immunitaires", "Reproduction", "Rôle du cerveau", "Système cardiovasculaire", "Système digestif", "Système nerveux", "Système respiratoire"]
const skills = ["Adopter un comportement éthique et responsable", "Concevoir, créer, réaliser", "Pratiquer des démarches scientifiques", "Pratiquer des langages", "Utiliser des outils et mobiliser des méthodes pour apprendre", "Utiliser des outils numériques", "Se situer dans l’espace et dans le temps"]
// const chunk_types = ["Activités", "Articles", "Dossiers pédagogiques", "Images", "Jeux", "Séquences de cours", "Vidéos"]
const chunk_types = ["Image", "Texte"]

export default function FilterMenu() {
    const [expanded, setExpanded] = useState(false)
    return (
        <div className="bg-white flex">
            <Accordion expanded={expanded} onChange={() => { setExpanded(!expanded) }} className="border-t border-b border-gray-200 shadow-none">
                <AccordionSummary className="w-full min-h-20">
                    <FilterAltIcon htmlColor='var(--background-flat-blue-france)' className='absolute' />
                    <div className="flex justify-between w-full">
                        <div className='flex items-center justify-center w-full'>
                            <div className='flex items-center'>
                                <Typography className="text-lg w-full mb-0">Niveaux</Typography>
                                <ExpandMoreIcon style={{ transform: `rotate(${expanded ? 180 : 0}deg)` }} className='transition' />
                            </div>
                        </div>
                        <div className='flex items-center justify-center w-full'>
                            <div className='flex items-center'>
                                <Typography className="text-lg w-full mb-0">Sous-thèmes</Typography>
                                <ExpandMoreIcon style={{ transform: `rotate(${expanded ? 180 : 0}deg)` }} className='transition' />
                            </div>
                        </div>
                        <div className='flex items-center justify-center w-full'>
                            <div className='flex items-center'>
                                <Typography className="text-lg w-full mb-0">Compétences</Typography>
                                <ExpandMoreIcon style={{ transform: `rotate(${expanded ? 180 : 0}deg)` }} className='transition' />
                            </div>
                        </div>
                        <div className='flex items-center justify-center w-full'>
                            <div className='flex items-center'>
                                <Typography className="text-lg w-full mb-0">Formats de contenus</Typography>
                                <ExpandMoreIcon style={{ transform: `rotate(${expanded ? 180 : 0}deg)` }} className='transition' />
                            </div>
                        </div>
                    </div>
                </AccordionSummary>
                <AccordionDetails className="flex justify-between space-x-4">
                    <Box className="flex flex-col w-full items-center">
                        {/* <Typography variant="subtitle1" className="font-bold">Niveaux</Typography> */}
                        <Checkbox
                            options={grades.map(grade => ({
                                label: grade,
                                nativeInputProps: {
                                    name: 'grade',
                                    value: 'grade',
                                    disabled: true,
                                }
                            }))}
                        />
                    </Box>
                    <Box className="flex flex-col w-full items-center">
                        <Checkbox
                            options={subFields.map(grade => ({
                                label: grade,
                                nativeInputProps: {
                                    name: 'grade',
                                    value: 'grade',
                                    disabled: true,
                                }
                            }))}
                        />
                    </Box>
                    <Box className="flex flex-col w-full items-center">
                        <Checkbox
                            options={skills.map(grade => ({
                                label: grade,
                                nativeInputProps: {
                                    name: 'grade',
                                    value: 'grade',
                                    disabled: true,
                                }
                            }))}
                        />
                    </Box>
                    <Box className="flex flex-col w-full items-center">
                        <Checkbox
                            options={chunk_types.map(grade => ({
                                label: grade,
                                nativeInputProps: {
                                    name: 'grade',
                                    value: 'grade',
                                }
                            }))}
                        />
                    </Box>
                </AccordionDetails>
            </Accordion>
        </div>
    );
}