'use client';

import { ContentService } from "@/lib/h5p/services/ContentService";
import { H5PPlayerUI } from "@lumieducation/h5p-react";


const contentService = new ContentService(process.env.NEXT_PUBLIC_H5P_URL || "");


export default function H5pEmbedPage({ params }: { params: { contentId: string } }) {
  return (
    <H5PPlayerUI
      readOnlyState={true}
      contextId={Math.random().toString(36).substring(2, 15)}
      contentId={params.contentId}
      loadContentCallback={contentService.getPlay}
    />
  );
}