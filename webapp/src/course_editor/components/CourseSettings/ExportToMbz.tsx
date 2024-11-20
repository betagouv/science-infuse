import { apiClient } from '@/lib/api-client';
import Button from '@codegouvfr/react-dsfr/Button';
import { CircularProgress } from '@mui/material';
import { Editor } from '@tiptap/react';
import React, { useState } from 'react';

const style = `

@page {
  margin: 2rem 4rem;
}
body {
  font-family: "Marianne", arial, sans-serif;
}

/* files */

.block-image, 
.block-video {
  box-sizing: border-box;
  width: 100%;
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.block-image a,
.block-video a {
  display: block;
  margin-top: 1rem;
}

.block-image p {
  font-size: 1rem;
}
.block-video p {
  margin: 0;
  font-size: 1.5rem;
}

.block-image img,
.block-video video {
  width: 100%;
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
  page-break-inside: avoid;
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

const ExportToMbz = (props: { editor: Editor }) => {
  const [isLoading, setIsLoading] = useState(false);


  return (
    <Button
      iconId="fr-icon-download-fill"
      iconPosition="right"
      onClick={async () => {
        const htmlContent = buildHtml(props.editor.getHTML());
        const data = await apiClient.exportMbz({ html: htmlContent })
        window.open(data.url, '_blank')
      }}
      className='w-full flex justify-center h-fit items-center'
    >
      Télécharger en MBZ
    </Button>
  );
};


export default ExportToMbz;