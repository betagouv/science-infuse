import { useSnackbar } from '@/app/SnackBarProvider';
import { apiClient } from '@/lib/api-client';
import Button from '@codegouvfr/react-dsfr/Button';
import { Editor } from '@tiptap/react';
import { useState } from 'react';



const DuplicateChapter = (props: { chapterId: string, editor: Editor }) => {
  const [isDuplicated, setIsDuplicated] = useState(false);
  const { showSnackbar } = useSnackbar();

  const handleDuplicate = async () => {
    try {
      const chapter = await apiClient.duplicateChapter(props.chapterId);
      if (chapter) {

        showSnackbar(
          <div className='flex items-center gap-4 flex-col'>
            <p className='m-0'>Chapitre dupliqué avec succès</p>
            <Button priority="secondary" className='w-full flex items-center justify-center' linkProps={{ href: `/prof/chapitres/${chapter?.id}`, target: '_blank', rel: 'noopener noreferrer' }}>Ouvrir</Button>
          </div>, 'success');
        setIsDuplicated(true);
      }
    } catch (error: any) {
      if (error.response.status == 409)
        showSnackbar("Ce chapitre vous appartient déjà", 'warning');
    }
  };

  return (
    <Button
      iconId="fr-icon-clipboard-fill"
      iconPosition="right"
      disabled={isDuplicated}
      className='bg-black w-full flex justify-center h-fit'
      onClick={() => {
        handleDuplicate();
      }}>Réutiliser</Button>
  )
}


export default DuplicateChapter;