// app/prof/ProfDashboardContent.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Block, Chapter, User } from '@prisma/client';
import { signOut } from 'next-auth/react';

interface ProfDashboardContentProps {
  initialChapters: Chapter[];
  initialBlocks: Block[];
  createChapter: () => Promise<string>;
  deleteChapter: (chapterId: string) => Promise<Chapter[]>;
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
    <>
      <Toolbar>
        <Typography variant="h6">Dashboard</Typography>
      </Toolbar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} lg={9}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Mes chapitres
              </Typography>
              <List>
                {chapters.map((chapter) => (
                  <ListItem key={chapter.id}>
                    <ListItemText primary={chapter.title} />
                    <Button onClick={() => window.open(`/prof/chapitres/${chapter.id}`, '_blank')}>
                      Modifier
                    </Button>
                    <Button onClick={() => handleDeleteChapter(chapter.id)}>
                      Supprimer
                    </Button>
                  </ListItem>
                ))}
              </List>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateChapter}
              >
                Créer un nouveau chapitre
              </Button>
            </Paper>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Mes blocs
              </Typography>
              <List>
                {blocks.map((block) => (
                  <ListItem key={block.id}>
                    <ListItemText primary={block.title} />
                    {/* <Button onClick={() => window.open(`/prof/chapitres/${block.id}`, '_blank')}>
                      Modifier
                    </Button> */}
                    {/* <Button onClick={() => handleDeleteChapter(block.id)}>
                      Supprimer
                    </Button> */}
                  </ListItem>
                ))}
              </List>
              <Button
                variant="contained"
                color="primary"
              // onClick={handleCreateChapter}
              >
                Créer un nouveau Bloc
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Mon Compte
              </Typography>
              <Button variant="outlined" onClick={() => setOpenDialog(true)}>
                Modifier
              </Button>
              <Button variant="outlined" onClick={async () => await signOut()}>
                Déconnexion
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Mettre à jour le compte</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleUpdateAccount}>Mettre à jour</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}