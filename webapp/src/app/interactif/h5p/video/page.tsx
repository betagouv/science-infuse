'use client';
import React from "react";

import { H5PPlayerUI, H5PEditorUI } from "@lumieducation/h5p-react";

import { ContentService } from "./contentService";


const initialState = {
  plugin: "rows",
  state: [
    {
      plugin: "text",
      state: [
        {
          type: "h",
          level: 1,
          children: [{ text: "Frage erstellen und anschließend auf Render klicken!" }],
        },
      ],
    },
  ],
};

interface ContentDumpProps {
    editor: React.RefObject<H5PEditorUI>;
    contentService: ContentService;
    updateRenderer: React.Dispatch<React.SetStateAction<any>>;
}

function H5pEditor() {
  const [state, setState] = React.useState(initialState);
  const h5pEditor: React.RefObject<H5PEditorUI> = React.createRef();
  const contentService = new ContentService('http://localhost:8020/h5p')
  return (
    <div className="App">
      <H5PPlayerUI
        contentId="1016044042"
        loadContentCallback={contentService.getPlay}
      />
      {/* <H5PEditorUI
        contentId="new"
        ref={h5pEditor}
        loadContentCallback={contentService.getEdit}
        saveContentCallback={contentService.save}
        onSaved={(contentId: string, metadata: any) => {
          console.log(contentId);
        }}
      /> */}
    </div>
  );
}


export default H5pEditor;