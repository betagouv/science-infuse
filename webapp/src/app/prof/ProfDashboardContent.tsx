// app/prof/ProfDashboardContent.tsx
'use client';

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';

import { Block, User } from '@prisma/client';
import { ChapterWithBlock } from '@/lib/api-client';
import ChaptersTable from './components/Table';
import { signOut } from 'next-auth/react';

interface ProfDashboardContentProps {
  initialChapters: ChapterWithBlock[];
  initialBlocks: Block[];
  createChapter: () => Promise<string>;
  deleteChapter: (chapterId: string) => Promise<ChapterWithBlock[]>;
  user?: User;
}


export default function ProfDashboardContent({ initialChapters, initialBlocks, user, createChapter, deleteChapter }: ProfDashboardContentProps) {
  const [chapters, setChapters] = useState(initialChapters);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState(user?.firstName || '');
  const [email, setEmail] = useState(user?.email || '');

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
    try {
      const updatedChapters = await deleteChapter(chapterId);
      setChapters(updatedChapters);
      alert("Chapter deleted successfully");
    } catch (error) {
      console.error('Error deleting chapter:', error);
      alert('Failed to delete chapter. Please try again.');
    }
  };


  const handleUpdateAccount = async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });
      if (response.ok) {
        alert('Account updated successfully');
        setOpenDialog(false);
      } else {
        throw new Error('Failed to update account');
      }
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Failed to update account. Please try again.');
    }
  };

  return (
    <div>
      <button onClick={() => signOut()}>Disconnect</button>
      <button onClick={handleCreateChapter}>Nouveau chapitre</button>
      <ChaptersTable chapters={chapters} />
    </div>
  );
}