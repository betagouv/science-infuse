import Button from '@codegouvfr/react-dsfr/Button';
import { Editor } from '@tiptap/react';

const style = `

@page {
    margin: 2rem 4rem;
  }
  body {
    font-family: "Marianne", arial, sans-serif;
  }

  .chapter-course-block {
    page-break-before: auto;
    margin-top: 4rem;
    margin-bottom: 2rem;
    border-radius: 0.75rem;
    border-width: 1px;
  }

  .course-block-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: black;
    width: 100%;
    margin-bottom: 2rem;
  }

  /* quiz */
  .course-block-quiz {
    margin-top: 4rem;
    display: flex;
    flex-flow: column;
    gap: 1.5rem;
  }

  .course-block-quiz .quiz-question {
    page-break-inside: avoid;
    padding: 1.5rem;
    background-color: #ffffff;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    position: relative;
  }

  .course-block-quiz ul {
    padding: 0;
    margin: 0;
  }

  .course-block-quiz li {
    list-style-type: none;
    width: 100%;
    padding: 0.5rem 0rem;
  }
  .course-block-quiz li label {
    display: flex;
    gap: 0.3rem;
    align-items: first baseline;
    line-height: 1.4rem;
  }

  .course-block-quiz p {
    margin: 0;
    margin-bottom: 1rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #2d3748;
  }
`
const buildHtml = (content: string) => {
    return `
<html lang="fr">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
        ${style}
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

                // Copy htmlContent to clipboard
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