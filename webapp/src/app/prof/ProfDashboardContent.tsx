// app/prof/ProfDashboardContent.tsx
'use client';

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

import { Block } from '@prisma/client';
import { ChapterWithBlock } from '@/types/api';
import ChaptersTable from './components/Table';
import Button from '@codegouvfr/react-dsfr/Button';
import { User } from 'next-auth';

interface ProfDashboardContentProps {
  initialChapters: ChapterWithBlock[];
  initialBlocks: Block[];
  createChapter: () => Promise<string>;
  deleteChapter: (chapterId: string) => Promise<ChapterWithBlock[]>;
  user?: User;
}


export default function ProfDashboardContent({ initialChapters, initialBlocks, user, createChapter, deleteChapter }: ProfDashboardContentProps) {
  const [chapters, setChapters] = useState(initialChapters);
  const [openDialog, setOpenDialog] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);

  const handleCreateChapter = async () => {
    try {
      const newChapterId = await createChapter();
      window.open(`/prof/chapitres/${newChapterId}`, '_blank');
    } catch (error) {
      console.error('Error creating new chapter:', error);
      alert('Failed to create new chapter. Please try again.');
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    setChapterToDelete(chapterId);
    setOpenDialog(true);
  };

  const confirmDeleteChapter = async () => {
    if (chapterToDelete) {
      try {
        const updatedChapters = await deleteChapter(chapterToDelete);
        setChapters(updatedChapters);
      } catch (error) {
        console.error('Error deleting chapter:', error);
        alert('Échec de la suppression du chapitre. Veuillez réessayer.');
      }
    }
    setOpenDialog(false);
    setChapterToDelete(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setChapterToDelete(null);
  };

  return (
    <div className='w-full fr-grid-row fr-grid-row--gutters fr-grid-row--center'>
      <div className='flex flex-col fr-col-12 fr-col-md-10 main-content-item my-24 gap-8'>
        <div className="flex gap-4">
        <Button priority='secondary' onClick={handleCreateChapter}>
          Nouveau chapitre
        </Button>
        </div>
        <ChaptersTable chapters={chapters} onDeleteChapter={handleDeleteChapter} />
      </div>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirmer la suppression"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir supprimer ce chapitre ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} priority="secondary">Annuler</Button>
          <Button onClick={confirmDeleteChapter} priority="primary">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}