import Button from '@codegouvfr/react-dsfr/Button';
import { Editor } from '@tiptap/react';

const buildHtml = (content: string) => {
    return `
<html lang="fr">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
body {
    font-family: "Marianne", arial, sans-serif;
    padding: 2rem;
}

.course-block-content {
    background-color: #f6f6f6;
    padding: 2rem;
    margin-bottom: 2rem;
    border-radius: 0.75rem;
    border-width: 1px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

}

.course-block-title {
    margin-top: 2rem;
    font-size: 1.5rem;
    font-weight: 700;
    text-align: left;
    color: #ff8742;
    width: 100%;
    margin-bottom: 2rem;
    background-color: transparent;
    border: none;
    outline: none;
}
.course-block-title:focus {
    outline: none;
    box-shadow: none;
}

.course-block-keyIdeas-picker {
    display: none;
}

        </style>
    </head>
    <body>
        ${content}
    </body>
</html>
`
}

const ExportToPdf = (props: { editor: Editor }) => {
    return (
        <Button
            iconId="fr-icon-download-fill"
            iconPosition="right"
            className='bg-black w-full flex justify-center h-fit' onClick={() => {
                const htmlContent = buildHtml(props.editor.getHTML());
                navigator.clipboard.writeText(htmlContent)
                    .then(() => {
                        console.log('HTML content copied to clipboard');
                    })
                    .catch((err) => {
                        console.error('Failed to copy HTML content: ', err);
                    });

                // return;
                fetch('/api/export/pdf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ html: htmlContent }),
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