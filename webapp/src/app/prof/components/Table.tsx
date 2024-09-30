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
import Badge from '@codegouvfr/react-dsfr/Badge';
import { ChapterStatus } from '@prisma/client';
import { AlertProps } from '@codegouvfr/react-dsfr/Alert';
import { Icon, Trash2 } from 'lucide-react';
import { RenderChapterTOC } from '@/course_editor/components/CourseSettings/ChapterTableOfContents';


const statusToSeverity = {
  [ChapterStatus.DRAFT]: undefined,
  [ChapterStatus.REVIEW]: "info",
  [ChapterStatus.PUBLISHED]: "success",
}

const statusToText = {
  [ChapterStatus.DRAFT]: "Brouillon",
  [ChapterStatus.REVIEW]: "En cours de revue",
  [ChapterStatus.PUBLISHED]: "Publié",
}

const ChapterRow = ({ chapter, onDeleteChapter }: { chapter: ChapterWithBlock, onDeleteChapter: (chapterId: string) => void }) => {
  const [open, setOpen] = useState(false);
  // people might have created block (so created witha pi) but removed them by pressing delete key or x button,
  // in this case we do not remove them from db, since it would be hard to know if the block should be re-created, for example if the user do a ctrl+y (redo)
  // so we get all visible blockId in the current chapter's content, and only deal with chapter's blocks from db that do exist in this list.
  const chapterBlockIds = (typeof chapter.content === 'string' ? JSON.parse(chapter.content) : chapter.content).content.filter((c: any) => c.type == 'courseBlock').map((cb: any) => cb.attrs.id)
  const chapterContent = typeof chapter.content === 'string' ? JSON.parse(chapter.content) : chapter.content;
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
        <TableCell>
          <img className='w-64 aspect-[16/9] object-contain bg-[#f2f2f9]' src={chapter?.coverPath || "https://www.systeme-de-design.gouv.fr/img/placeholder.16x9.png"} alt={`image de couverture du chapitre "${chapter.title}"`} />
        </TableCell>

        <TableCell component="th" scope="row" className='min-w-36'>
          <Link className='flex w-fit' target="_blank" href={`/prof/chapitres/${chapter.id}`}>
            {chapter.title}
          </Link>
        </TableCell>
        <TableCell className=''>
          <Badge severity={statusToSeverity[chapter.status as keyof typeof statusToSeverity] as AlertProps.Severity}>
            {statusToText[chapter.status as keyof typeof statusToText]}
          </Badge>
        </TableCell>
        <TableCell className=''>
          <div className="flex gap-1">
            {chapter.educationLevels.map((level, index) => (
              <Chip key={index} label={level.name} size="small" />
            ))}
          </div>
        </TableCell>
        <TableCell>{new Date(chapter.updatedAt).toLocaleDateString()}</TableCell>
        <TableCell className=''>
          <div className="w-full flex items-center justify-center">
            <Trash2 size={16} className="cursor-pointer hover:text-red-500" onClick={() => onDeleteChapter(chapter.id)} />
          </div>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0, paddingLeft: '65px' }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>

            <div className="p-8">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sommaire</TableCell>
                    <TableCell align="right">Compétences et notions clés</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      <RenderChapterTOC content={chapterContent.content} />
                      {/* {chapter.blocks
                        .filter(block => chapterBlockIds.includes(block.id))
                        .map((block, index) => (
                          <p key={index} className="text-base text-[#161616] font-medium">{block.title}</p>
                        ))
                      } */}
                    </TableCell>
                    <TableCell align="right" className='!flex'>
                      <div className="h-full w-full flex flex-col justify-end">
                        {
                          chapter.skillsAndKeyIdeas.split("\n").map((t, index) =>
                            <p key={index} className="text-base text-[#161616] font-medium">{t}</p>)
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
const ChaptersTable = ({ chapters, onDeleteChapter }: { chapters: ChapterWithBlock[], onDeleteChapter: (chapterId: string) => void }) => {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Couverture</TableCell>
            <TableCell>Titre</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Niveaux d'éducation</TableCell>
            <TableCell>Dernière mise à jour</TableCell>
            <TableCell><div className="w-full text-center">Supprimer</div></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {chapters.map((chapter) => (
            <ChapterRow key={chapter.id} chapter={chapter} onDeleteChapter={onDeleteChapter} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ChaptersTable;