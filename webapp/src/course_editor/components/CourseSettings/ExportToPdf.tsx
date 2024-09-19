import Button from '@codegouvfr/react-dsfr/Button';
import { Editor } from '@tiptap/react';

const ExportToPdf = (props: { editor: Editor }) => {
    return (
        <Button
            iconId="fr-icon-download-fill"
            iconPosition="right"
            className='bg-black  h-fit' onClick={() => {
                fetch('/api/export/pdf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ html: props.editor.getHTML() }),
                })
                    .then(response => response.blob())
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        a.download = 'exported_document.pdf';
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                    })
                    .catch(error => console.error('Error:', error));
            }}>Télécharger en PDF</Button>
    )
}


export default ExportToPdf;