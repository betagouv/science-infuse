import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
  Chip,
  Typography,
  Tooltip,
  Link,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { ChapterWithBlock, FullBlock } from '@/lib/api-client';


const RenderChapterBlock = ({ chapter }: { chapter: ChapterWithBlock }) => {
  const blocks = chapter.blocks;
  const chapterBlockIds = JSON.parse((chapter.content as string)).content.filter((c: any) => c.type == 'courseBlock').map((cb: any) => cb.attrs.id)

  return <Box sx={{ margin: 1, marginLeft: 8 }}>
    <Table size="small" aria-label="blocks">
      <TableHead>
        <TableRow>
          <TableCell>Titre du bloc</TableCell>
          <TableCell>Compétences</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {
          blocks
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .map((block, index) => {
              const existInBlock = chapterBlockIds.includes(block.id)

              return <TableRow style={{ opacity: existInBlock ? 1 : 0.4 }} key={block.id}>
                <TableCell className='whitespace-nowrap' component="th" scope="row">
                  {block.title}
                </TableCell>
                <TableCell>
                  <div className="flex flex-nowrap max-w-[35rem] overflow-auto gap-1">
                    {
                      block.keyIdeas.map((keyIdea, index) => (
                        <Tooltip key={index} title={keyIdea.title}>
                          <Chip label={keyIdea.title} className='max-w-48' size="small" />
                        </Tooltip>
                      ))
                    }
                  </div>
                </TableCell>
              </TableRow>
            })
        }
      </TableBody>
    </Table>
  </Box>


}

const ChapterRow = ({ chapter }: { chapter: ChapterWithBlock }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" className='min-w-36'>
          <Link className='flex w-fit' target="_blank" href={`/prof/chapitres/${chapter.id}`}>
            {chapter.title}
          </Link>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {chapter.skills.map((skill, index) => (
              <Chip key={index} label={skill.title} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
            ))}
          </div>
        </TableCell>
        <TableCell className='flex flex-wrap'>
          <div className="flex gap-1">
            {chapter.educationLevels.map((level, index) => (
              <Chip key={index} label={level.name} size="small" />
            ))}
          </div>
        </TableCell>
        <TableCell>{new Date(chapter.updatedAt).toLocaleDateString()}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0, paddingLeft: '65px' }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <RenderChapterBlock chapter={chapter} />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const ChaptersTable = ({ chapters }: { chapters: ChapterWithBlock[] }) => {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Titre</TableCell>
            <TableCell>Compétences</TableCell>
            <TableCell>Niveaux d'éducation</TableCell>
            <TableCell>Dernière mise à jour</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {chapters.map((chapter) => (
            <ChapterRow key={chapter.id} chapter={chapter} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ChaptersTable;