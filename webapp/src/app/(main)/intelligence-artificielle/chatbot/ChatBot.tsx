"use client";

import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { Suspense, useState, useEffect } from "react";
import { Thread } from "@/components/assistant-ui/thread";
import { useAssistantInstructions, useAssistantToolUI } from "@assistant-ui/react";
import ChunkRenderer from "@/app/(main)/recherche/DocumentChunkFull";
import { apiClient } from "@/lib/api-client";
import { ChunkWithScoreUnion } from "@/types/vectordb";
import { FileTextIcon, ImageIcon, LinkIcon, VideoIcon } from "lucide-react";
import { formatTime } from "@/lib/utils";


// Client-side version that uses useEffect instead of async/await
const useFetchChunk = (chunkId: string) => {
  const [chunk, setChunk] = useState<ChunkWithScoreUnion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChunk = async () => {
      try {
        const chunkData = await apiClient.getChunk(chunkId);
        setChunk(chunkData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chunk:", error);
        setLoading(false);
      }
    };

    fetchChunk();
  }, [chunkId]);

  return { chunk, loading };
};

const RenderChunk = (props: { chunkId: string; }) => {
  const { chunk, loading } = useFetchChunk(props.chunkId);

  if (loading) {
    return <div>Loading...</div>;
  }

  return chunk ? (
    <ChunkRenderer
      chunk={chunk}
      searchWords={['']}
    />
  ) : undefined;
};

const RenderSource = (props: { chunkId: string; }) => {
  const { chunk, loading } = useFetchChunk(props.chunkId);

  if (loading) {
    return <div>Loading...</div>;
  }

  const getIcon = () => {
    switch (chunk?.mediaType) {
      case 'video_transcript':
        return <VideoIcon size={20} />
      case 'pdf_text':
        return <FileTextIcon size={20} />;
      case 'website':
      case 'website_qa':
      case 'website_experience':
        return <LinkIcon size={20} />;
      case 'image':
      case 'pdf_image':
      case 'raw_image':
        return <ImageIcon size={20} />
          ;
      default:
        return undefined;
    }
  }
  const getSource = () => {
    switch (chunk?.mediaType) {
      case 'video_transcript':
        return `/media/video/${chunk.document.id}`
      case 'pdf_text':
        return `/media/pdf/${chunk.document.id}/${chunk.metadata?.pageNumber}`
      case 'website':
      case 'website_qa':
      case 'website_experience':
        return chunk.document.originalPath;
      case 'pdf_image':
        return `/media/pdf/${chunk.document.id}/${chunk.metadata?.pageNumber}`;
      default:
        return "#";
    }
  }

  const getTitle = () => {
    switch (chunk?.mediaType) {
      case 'video_transcript':
        return `${chunk.document.mediaName} - ${formatTime(chunk.metadata.start)}`
      case 'pdf_text':
      case 'pdf_image':
        return `${chunk.document.mediaName} - page ${chunk.metadata.pageNumber}`
      default:
        return chunk?.document.mediaName;
    }
  }

  return chunk ? (
    <Tag linkProps={{ href: getSource(), target: '_blank' }} className="flex gap-2">
      {getIcon()}
      {getTitle()}
    </Tag>
  ) : undefined;
};

const RenderChunks = (props: { documents: { id: any; }[]; }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
      {props.documents.map((documentId: { id: any; }, index: any) => (
        <RenderChunk chunkId={documentId.id} key={index} />
      ))}
    </div>
  );
};

const RenderSources = (props: { documents: { id: any; }[]; }) => {
  return (
    <div className="flex flex-wrap gap-2 my-4">
      {props.documents.map((chunk: { id: any; }, index: any) => (
        <RenderSource key={index} chunkId={chunk.id} />
      ))}

    </div>
  );
};

export default function ChatBot() {

  useAssistantToolUI({
    toolName: "display_document_chunks",
    render: ({ args }) => (<RenderChunks documents={args.documents} />)
  });

  useAssistantToolUI({
    toolName: "display_sources_to_user",
    render: ({ args }) => (<RenderSources documents={args.documents} />)
  });

  return (
    <Thread suggestions={[
      {
        label: "Comment fonctionne la division cellulaire ?",
        prompt: "Explique-moi les étapes de la division cellulaire. Fais ça sous forme d'exposé avec des images et des vidéos pour illustrer."
      },
      {
        label: "Comment fonctionne un volcan ?",
        prompt: "Peux-tu m'expliquer le fonctionnement d'un volcan ? Utilise des images et des vidéos pour illustrer."
      }
    ]} />
  );
}