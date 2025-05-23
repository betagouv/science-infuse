import YouTube from 'react-youtube';
import VideoPlayerHotSpots from "@/app/(main)/mediaViewers/VideoPlayerHotSpots";
import { useSnackbar } from "@/app/SnackBarProvider";
import { WEBAPP_URL } from "@/config";
import { TiptapEditor, useTiptapEditor } from "@/course_editor";
import { RenderChapterBlockTOC, RenderChapterTOC } from "@/course_editor/components/CourseSettings/ChapterTableOfContents";
import { apiClient } from "@/lib/api-client";
import { ChapterWithBlock } from "@/types/api";
import { OnInserted } from "@/types/course-editor";
import { BlockWithChapter, ChunkWithScore, ChunkWithScoreUnion, DocumentWithChunks, GroupedVideo, isImageChunk, isPdfImageChunk, isPdfTextChunk, isVideoTranscriptChunk, isWebsiteChunk, isWebsiteExperienceChunk, isWebsiteQAChunk, s3ToPublicUrl } from "@/types/vectordb";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Quote } from "@codegouvfr/react-dsfr/Quote";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import styledComponent from '@emotion/styled';
import { Collapse, Tooltip, Typography, styled } from '@mui/material';
import { Document } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { findNormalizedChunks } from "../text-highlighter";
import { extractYoutubeVideoId } from "@/lib/utils/youtube";
import ThreeDotMenu from '@/components/cards/ThreeDotMenu';

export const StyledCardWithoutTitle = styled(Card)`
.fr-card__content {
    padding: 1rem;
    padding-top: 0;
}

.fr-card__title {
    display: none;
}
`

export const StyledGroupedVideoCard = styled(StyledCardWithoutTitle)`
.fr-card__body,
.fr-card__content,
.fr-card__desc,
.fr-card__start {
    margin: 0 !important;
    padding: 0 !important;
};

.fr-card__end {
    padding: 1rem;
}

.fr-card__body {
    overflow: hidden;
}

`


export const StyledImageCard = styled(StyledCardWithoutTitle)`
a {
    filter: none;
}
.fr-responsive-img {
    object-fit: contain;
    background-color: #f6f6f6;
}
`

// Types
type BaseCardProps = {
    chunk: ChunkWithScoreUnion;
    children: React.ReactNode;
    end?: React.ReactNode;
    title?: string;
    linkProps?: {
        href: string;
        target: string;
    };
    badgeText?: string;
    badgeSeverity?: "new" | "info" | "success" | "warning" | "error";
};

type ChunkRendererProps = {
    chunk: ChunkWithScoreUnion;
    searchWords: string[];
};

export const getColorFromScore = (score: number) => {
    const clampedScore = Math.max(0, Math.min(1, score));
    const hue = clampedScore * 120;
    return `hsl(${hue}, 100%, 50%)`;
}

const StarDocumentChunk = (props: { query: string, chunkId: string, starred: boolean }) => {
    const [starred, setStarred] = useState(props.starred);
    const { showSnackbar } = useSnackbar();

    const starDocumentChunk = async () => {
        await apiClient.starDocumentChunk(props.chunkId, props.query)
        setStarred(true);
        showSnackbar(
            <p className="m-0">Favori ajouté avec succès</p>,
            'success'
        )
    }

    const unStarDocumentChunk = async () => {
        await apiClient.unStarDocumentChunk(props.chunkId);
        setStarred(false);
        showSnackbar(
            <p className="m-0">Favori supprimé avec succès</p>,
            'success'
        )

    }
    return <Tooltip title={props.starred ? "Supprimer des favoris" : "Ajouter aux favoris"}>
        {starred ? <svg onClick={unStarDocumentChunk} className="cursor-pointer" width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M11.9999 18.26L4.94691 22.208L6.52191 14.28L0.586914 8.792L8.61391 7.84L11.9999 0.5L15.3859 7.84L23.4129 8.792L17.4779 14.28L19.0529 22.208L11.9999 18.26Z" fill="#161616" />
        </svg> : <svg onClick={starDocumentChunk} className="cursor-pointer" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M11.9999 0.5L15.3859 7.84L23.4129 8.792L17.4779 14.28L19.0529 22.208L11.9999 18.26L4.94691 22.208L6.52191 14.28L0.586914 8.792L8.61391 7.84L11.9999 0.5ZM11.9999 5.275L9.96191 9.695L5.12891 10.267L8.70191 13.572L7.75291 18.345L11.9999 15.968L16.2469 18.345L15.2979 13.572L18.8709 10.267L14.0379 9.694L11.9999 5.275Z" fill="#161616" />
        </svg>}
    </Tooltip>
}

const StarBlock = (props: { query: string, blockId: string, starred: boolean }) => {
    const [starred, setStarred] = useState(props.starred);
    const { showSnackbar } = useSnackbar();

    const starBlock = async () => {
        await apiClient.starBlock(props.blockId, props.query)
        setStarred(true);
        showSnackbar(
            <p className="m-0">Favori ajouté avec succès</p>,
            'success'
        )
    }

    const unStarBlock = async () => {
        await apiClient.unStarBlock(props.blockId);
        setStarred(false);
        showSnackbar(
            <p className="m-0">Favori supprimé avec succès</p>,
            'success'
        )

    }
    return <Tooltip title={props.starred ? "Supprimer des favoris" : "Ajouter aux favoris"}>
        {starred ? <svg onClick={unStarBlock} className="cursor-pointer" width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M11.9999 18.26L4.94691 22.208L6.52191 14.28L0.586914 8.792L8.61391 7.84L11.9999 0.5L15.3859 7.84L23.4129 8.792L17.4779 14.28L19.0529 22.208L11.9999 18.26Z" fill="#161616" />
        </svg> : <svg onClick={starBlock} className="cursor-pointer" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M11.9999 0.5L15.3859 7.84L23.4129 8.792L17.4779 14.28L19.0529 22.208L11.9999 18.26L4.94691 22.208L6.52191 14.28L0.586914 8.792L8.61391 7.84L11.9999 0.5ZM11.9999 5.275L9.96191 9.695L5.12891 10.267L8.70191 13.572L7.75291 18.345L11.9999 15.968L16.2469 18.345L15.2979 13.572L18.8709 10.267L14.0379 9.694L11.9999 5.275Z" fill="#161616" />
        </svg>}
    </Tooltip>
}

export const BuildCardEnd = (props: OnInserted & { chunk: ChunkWithScoreUnion, end?: React.ReactNode, downloadLink?: string, starred: boolean | undefined }) => {
    const searchParams = useSearchParams();
    const query = searchParams.get('query') || "";
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <div className="flex flex-col justify-between gap-4">
            {props.end}
            <div className="flex items-center gap-4 ml-auto w-full">
                {user && props.starred != undefined && <StarDocumentChunk key={props.chunk.id} query={query} chunkId={props.chunk.id} starred={props.starred} />}
                {
                    props.downloadLink && props.chunk.mediaType !== "video_transcript" && user && <button
                        className='flex'
                        onClick={() => window.open(props.downloadLink, '_blank')}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M3 19H21V21H3V19ZM13 13.172L19.071 7.1L20.485 8.514L12 17L3.515 8.515L4.929 7.1L11 13.17V2H13V13.172Z" fill="#161616" />
                        </svg>
                    </button>
                }

                {
                    props.onInserted && <Tooltip enterDelay={1500} title={props.onInsertedLabel || "Sélectionner"}><Button
                        className='block text-sm truncate text-ellipsis whitespace-nowrap flex-1'
                        onClick={() => props.onInserted && props.onInserted(props.chunk)}
                    >
                        {props.onInsertedLabel || "Sélectionner"}
                    </Button></Tooltip>
                }

                <ThreeDotMenu className='ml-auto' chunk={props.chunk} />
            </div>
        </div>
    )
}
// Base Card component
export const BaseCard: React.FC<OnInserted & BaseCardProps> = ({ onInserted, onInsertedLabel, end, children, title, linkProps, chunk, badgeText, badgeSeverity = "new" }) => {

    return (
        <div className="relative">

            <Card
                background
                border
                className="text-left"

                end={<BuildCardEnd
                    onInserted={onInserted}
                    onInsertedLabel={onInsertedLabel}
                    chunk={chunk}
                    end={end}
                    starred={!!chunk?.user_starred}
                />}
                desc={
                    <div className="relative">
                        {children}
                    </div>
                }
                linkProps={linkProps}
                size="medium"
                title={title}
                titleAs="h3"
            />
        </div>
    );
};

export const RenderPdfTextCard: React.FC<OnInserted & { searchWords: string[]; chunk: ChunkWithScore<"pdf_text"> }> = ({ onInserted, onInsertedLabel, searchWords, chunk }) => {
    const path = chunk.title.toLowerCase().split('>');
    return (

        <Card
            background
            border
            className="text-left"

            end={
                // <BreadcrumbNoLink className="flex pointer-events-none m-0" list={path} />
                <BuildCardEnd
                    onInserted={onInserted}
                    onInsertedLabel={onInsertedLabel}
                    chunk={chunk}
                    end={
                        <div className="flex">
                            <a className="m-0" href={`/media/pdf/${chunk.document.id}/${chunk.metadata?.pageNumber}`} target="_blank">source</a>
                        </div>
                    }
                    starred={!!chunk?.user_starred}
                    downloadLink={chunk.document.originalPath.includes('RevueDecouverte') ? undefined : `${WEBAPP_URL}/api/s3/presigned_url/object_name/${chunk.document.s3ObjectName}`}
                />
            }
            desc={
                < div className="relative" >
                    <Highlighter
                        highlightClassName="highlightSearch"
                        searchWords={searchWords}
                        autoEscape={false}
                        textToHighlight={chunk.text}
                        findChunks={findNormalizedChunks}
                    />
                </div >
            }
            linkProps={{
                href: `/media/pdf/${chunk.document.id}/${chunk.metadata?.pageNumber}`,
                target: "_blank",
            }}
            size="medium"
            title={`${chunk.document.mediaName} - page ${chunk.metadata?.pageNumber}`}
            titleAs="h3"
        />
    )
};

export const RenderWebsiteChunk: React.FC<OnInserted & { searchWords: string[]; chunk: ChunkWithScore<"website"> }> = ({ onInserted, onInsertedLabel, searchWords, chunk }) => {
    let textHash = ``
    const txt = chunk.text.slice(chunk.title.length, chunk.text.length);
    // textHash += encodeURIComponent(chunk.title)
    // textHash += `-,`
    textHash += encodeURIComponent(txt.split(' ').slice(0, 5).join(' ').trim())
    return (

        <Card
            background
            border
            className="text-left"

            end={
                <BuildCardEnd
                    onInserted={onInserted}
                    onInsertedLabel={onInsertedLabel}
                    chunk={chunk}
                    end={
                        <div className="flex">
                            <a className="m-0" href={chunk.document.originalPath} target="_blank">source</a>
                        </div>
                    }
                    starred={!!chunk?.user_starred}
                    downloadLink={chunk.document.originalPath.includes('RevueDecouverte') ? undefined : `${WEBAPP_URL}/api/s3/presigned_url/object_name/${chunk.document.s3ObjectName}`}
                />
            }
            desc={
                < div className="relative" >
                    <Highlighter
                        highlightClassName="highlightSearch"
                        searchWords={searchWords}
                        autoEscape={false}
                        textToHighlight={chunk.text}
                        findChunks={findNormalizedChunks}
                    />
                </div >
            }
            linkProps={{
                href: `${chunk.metadata.url}#:~:text=${textHash}`,
                target: "_blank",
            }}
            size="medium"
            title={chunk.title}
            titleAs="h3"
        />
    )
};


export const RenderPdfImageCard: React.FC<OnInserted & { chunk: ChunkWithScore<"pdf_image"> }> = ({ onInserted, onInsertedLabel, chunk }) => {
    const path = chunk.document.originalPath.split('ftp-data')[1]?.split('/') || chunk.document.originalPath.split('/')
    if (chunk.title) {
        path.push(...chunk.title.toLowerCase().split('>'))
    }
    return (
        <StyledImageCard
            background
            border
            imageAlt={chunk.text}
            imageUrl={`${WEBAPP_URL}/api/s3/presigned_url/object_name/${chunk.metadata.s3ObjectName}`}
            end={<BuildCardEnd
                onInserted={onInserted}
                onInsertedLabel={onInsertedLabel}
                chunk={chunk}
                end={
                    <div className="flex">
                        <a className="m-0" href={`/media/pdf/${chunk.document.id}/${chunk.metadata?.pageNumber}`} target="_blank">source</a>
                    </div>
                }
                starred={!!chunk?.user_starred}
                downloadLink={`${WEBAPP_URL}/api/s3/presigned_url/object_name/${chunk.metadata.s3ObjectName}`}
            />}
            size="medium"
            title=""
            titleAs="h3"
        />

    )
};

export const RenderImageCard: React.FC<OnInserted & { chunk: ChunkWithScore<"image"> }> = ({ onInserted, onInsertedLabel, chunk }) => {
    const path = chunk.document.originalPath.split('ftp-data')[1]?.split('/') || chunk.document.originalPath.split('/')
    if (chunk.title) {
        path.push(...chunk.title.toLowerCase().split('>'))
    }
    return (
        <StyledImageCard
            background
            border
            imageAlt={chunk.text}
            imageUrl={`${WEBAPP_URL}/api/s3/presigned_url/object_name/${chunk.metadata.s3ObjectName}`}
            end={<BuildCardEnd
                onInserted={onInserted}
                onInsertedLabel={onInsertedLabel}
                chunk={chunk}
                starred={!!chunk?.user_starred}
                downloadLink={`${WEBAPP_URL}/api/s3/presigned_url/object_name/${chunk.metadata.s3ObjectName}`}
            />}
            size="medium"
            title=""
            titleAs="h3"
        />

    )
};

export const RenderGroupedVideoTranscriptCard: React.FC<OnInserted & { video: GroupedVideo; searchWords: string[], defaultSelectedChunk?: ChunkWithScore<"video_transcript"> }> = ({ onInserted, onInsertedLabel, video, defaultSelectedChunk, searchWords }) => {
    const user = useSession()?.data?.user;
    const firstChunk = video.items[0];
    let originalPath = firstChunk.document.originalPath;
    const [selectedChunk, setSelectedChunk] = useState<ChunkWithScore<"video_transcript"> | undefined>(defaultSelectedChunk)
    if (originalPath.includes("youtube") && selectedChunk) {
        originalPath = originalPath.replace("https://www.youtube.com/watch?v=", "https://youtu.be/") + `?t=${Math.floor(selectedChunk.metadata.start)}`
    }

    const openLink = user ? `/media/video/${video.documentId}` : originalPath;

    useEffect(() => {
        if (!defaultSelectedChunk) return;
        console.log("defaultSelectedChunk", defaultSelectedChunk.text)
        setSelectedChunk(defaultSelectedChunk)
    }, [defaultSelectedChunk])

    return (
        <StyledGroupedVideoCard
            className='max-w-full'
            end={<BuildCardEnd
                onInserted={onInserted}
                onInsertedLabel={onInsertedLabel}
                chunk={selectedChunk || video.items[0]}
                end={
                    <div className="flex flex-col items-start justify-between gap-4 overflow-hidden">
                        <a className="m-0 text-base overflow-hidden whitespace-nowrap overflow-ellipsis max-w-full" href={openLink} target="_blank">{firstChunk.title}</a>
                        <p className="m-0 text-xs text-[#666]">{video.items.length} correspondance{video.items.length > 1 ? 's' : ''}</p>
                    </div>
                }
                starred={selectedChunk ? selectedChunk.user_starred : undefined}
                downloadLink={`${WEBAPP_URL}/api/s3/presigned_url/object_name/${firstChunk.document.s3ObjectName}`}
            />}
            desc={
                <VideoPlayerHotSpots
                    useYoutubePlayer={!user}
                    document={firstChunk.document}
                    selectedChunk={selectedChunk}
                    // onChunkSelected={(_chunk) => {}}
                    onChunkSelected={(_chunk) => setSelectedChunk(_chunk)}
                    chunks={video.items}
                />
            }
            size="medium"
            title=""
        />
    )
}

export const RenderVideoTranscriptCard: React.FC<OnInserted & { chunk: ChunkWithScore<"video_transcript">; searchWords: string[] }> = ({ onInserted, onInsertedLabel, chunk, searchWords }) => {
    const user = useSession()?.data?.user;
    console.log("chunkKK", chunk)
    let originalPath = chunk.document.originalPath;
    if (originalPath.includes("youtube")) {
        originalPath = originalPath.replace("https://www.youtube.com/watch?v=", "https://youtu.be/") + `?t=${Math.floor(chunk.metadata.start)}`
    }
    return (
        <StyledGroupedVideoCard
            end={<BuildCardEnd
                onInserted={onInserted}
                onInsertedLabel={onInsertedLabel}
                chunk={chunk}
                end={
                    <div className="flex flex-col items-start justify-between gap-4 overflow-hidden">
                        <a className="m-0 text-base overflow-hidden whitespace-nowrap overflow-ellipsis max-w-full" href={`${originalPath}`} target="_blank">{chunk.title}</a>
                    </div>
                }
                starred={chunk.user_starred}
                downloadLink={`${WEBAPP_URL}/api/s3/presigned_url/object_name/${chunk.document.s3ObjectName}`}
            />}
            desc={
                <VideoPlayerHotSpots
                    useYoutubePlayer={!user}
                    document={chunk.document}
                    selectedChunk={chunk}
                    onChunkSelected={() => { }}
                    chunks={[chunk]}
                />
            }
            size="medium"
            title=""
        />
    )
};

export const RenderVideoTranscriptDocumentCard: React.FC<OnInserted & { document: Document; }> = ({ onInserted, onInsertedLabel, document }) => {
    let originalPath = document.originalPath;
    const { data: session } = useSession();
    const user = session?.user;

    if (originalPath.includes("youtube")) {
        originalPath = originalPath.replace("https://www.youtube.com/watch?v=", "https://youtu.be/")
    }
    const videoUrl = `${WEBAPP_URL}/api/s3/presigned_url/object_name/${document.s3ObjectName}`;

    return (
        <StyledGroupedVideoCard
            end={<div className="flex flex-col items-start justify-between gap-4 overflow-hidden">
                <a className="m-0 text-base overflow-hidden whitespace-nowrap overflow-ellipsis max-w-full" href={`${originalPath}`} target="_blank">{document.mediaName}</a>
            </div>}
            desc={
                <div className="w-full mx-auto">
                    {document.isExternal ?
                        <YoutubeEmbed url={document.originalPath} onDuration={() => { }} /> :
                        <video src={videoUrl} className="w-full prevent-download" controls controlsList="nodownload" />
                    }
                </div>
            }
            size="medium"
            title=""
        />
    )
};


function getDomain(input: string) {
    try {
        const url = new URL(input);
        return url.hostname;
    } catch (error) {
        const match = input.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im);
        return match ? match[1] : null;
    }
}


export const RenderWebsiteQAChunk: React.FC<OnInserted & { chunk: ChunkWithScore<"website_qa">; searchWords: string[] }> = ({ chunk, searchWords }) => {
    const [expanded, setExpanded] = useState(false);
    const answerParts = chunk.metadata.answer.split("\n");

    return (
        <BaseCard

            chunk={chunk}
            title={chunk.title}
            linkProps={{
                href: chunk.document.originalPath,
                target: "_blank",
            }}
            badgeText="Question Réponse"
        >
            <div className="flex flex-col gap-4">
                <Typography className="text-md w-full mb-0">
                    <Highlighter
                        highlightClassName="highlightSearch"
                        searchWords={searchWords}
                        autoEscape={false}
                        textToHighlight={chunk.metadata.question}
                        findChunks={findNormalizedChunks}
                    />
                </Typography>
                <Button className="self-center" priority="secondary" onClick={() => setExpanded(!expanded)}>
                    {expanded ? 'Masquer les réponses' : 'Afficher les réponses'}
                </Button>
                <Collapse in={expanded}>
                    {answerParts.map((answer, index) => (
                        <div key={index} className={"text-left px-4 my-4"}>
                            {answer.startsWith('```') && answer.endsWith('```') ?
                                (
                                    <Quote
                                        className="overflow-hidden"
                                        // author="Auteur"
                                        source={answerParts[index + 1].startsWith('http') ? <a className="w-fit text-ellipsis" href={answerParts[index + 1]} target="_blank">{getDomain(answerParts[index + 1])}</a> : undefined}
                                        size="medium"
                                        text={
                                            <Highlighter
                                                highlightClassName="highlightSearch"
                                                searchWords={searchWords}
                                                autoEscape={false}
                                                textToHighlight={answer.startsWith('```') ? answer.slice(3, -3) : answer}
                                                findChunks={findNormalizedChunks}
                                            />

                                        }
                                    />
                                )
                                :
                                (
                                    (index > 1 && answerParts[index].startsWith('http') && answerParts[index - 1].startsWith('```')) ?
                                        <></>
                                        :
                                        <Highlighter
                                            highlightClassName="highlightSearch"
                                            searchWords={searchWords}
                                            autoEscape={false}
                                            textToHighlight={answer.startsWith('```') ? answer.slice(3, -3) : answer}
                                            findChunks={findNormalizedChunks}
                                        />
                                )
                            }
                        </div>
                        // <div key={index} className={answer.startsWith('```') && answer.endsWith('```') ? "bg-gray-300 rounded-xl my-4 p-4 text-left" : "text-left px-4"}>
                        //     <Highlighter
                        //         highlightClassName="highlightSearch"
                        //         searchWords={searchWords}
                        //         autoEscape={false}
                        //         textToHighlight={answer.startsWith('```') ? answer.slice(3, -3) : answer}
                        //         findChunks={findNormalizedChunks}
                        //     />
                        // </div>
                    ))}
                </Collapse>
            </div>
        </BaseCard>
    );
};

export const RenderWebsiteExperienceChunk: React.FC<OnInserted & { chunk: ChunkWithScore<"website_experience">; searchWords: string[] }> = ({ chunk, searchWords }) => (
    <BaseCard

        chunk={chunk}
        title={chunk.title}
        linkProps={{
            href: chunk.document.originalPath,
            target: "_blank",
        }}
        badgeText={`Web/${chunk.metadata.type}`}
    >
        <div className="flex flex-col gap-4">
            {chunk.metadata.description.split('\n').map((paragraph, index) => (
                <Typography key={index} className="text-md w-full mb-0 text-left">
                    <Highlighter
                        highlightClassName="highlightSearch"
                        searchWords={searchWords}
                        autoEscape={false}
                        textToHighlight={paragraph}
                        findChunks={findNormalizedChunks}
                    />
                </Typography>
            ))}
        </div>
    </BaseCard>
);




const StyledRenderBlock = styledComponent.div`
    h1.is-empty {
        display: none;
    }
    max-height: 14rem;
    overflow: hidden;
    zoom: 0.8;
    text-align: left;
    mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
`

const RenderTiptapContent = (props: { content: any }) => {
    const { editor, setContent } = useTiptapEditor({ preview: true })
    useEffect(() => {
        setContent(props.content)
    }, [editor])


    return (
        <StyledRenderBlock>
            {editor && <TiptapEditor editor={editor} />}
        </StyledRenderBlock>
    )
}

export const RenderChapterBlock = (props: { searchWords: string[], block: BlockWithChapter }) => {
    const searchParams = useSearchParams();
    const query = searchParams.get('query') || "";

    const { searchWords, block } = props;

    const baseImageSrc = 'https://www.systeme-de-design.gouv.fr/img/placeholder.16x9.png';
    // const blockImageSrc = JSON.parse(block.content).find((e: any) => e.type == "imageBlock")?.attrs?.src
    // const chapterImageSrc = JSON.parse(block.chapter.content as string).content.find((e: any) => e.type == "imageBlock")?.attrs?.src
    const blockContent = typeof props.block.content === 'string' ? JSON.parse(props.block.content) : props.block.content;

    const link = `/prof/chapitres/${block.chapter.id}/view?block=${props.block.id}`
    return <StyledCardWithoutTitle
        background
        border
        // enlargeLink
        badge={(block.chapter.educationLevels || []).map((e, index) => <Badge className="bg-[#ececfe] text-[#000091] text-sm capitalize" key={index}>{e.name}</Badge>)}
        start={
            block.chapter.theme ? <ul className="fr-badges-group pt-4 w-full">
                <li className="w-full overflow-hidden">
                    <Badge className="bg-[#ececfe] text-[#000091] whitespace-nowrap overflow-hidden text-ellipsis max-w-full inline-block">
                        {props.block.chapter?.theme?.title || ""}
                    </Badge>
                </li>
            </ul> : undefined
        }
        desc={
            < div className="relative" >
                <p className="text-start text-2xl text-black">{props.block.chapter.title}</p>
                <p className="text-start text-xl text-black">{props.block.title}</p>
                <RenderChapterBlockTOC content={blockContent} />
            </div >
        }
        horizontal
        imageAlt="image d'illustration du bloc"
        imageUrl={props.block.chapter?.coverPath || baseImageSrc}
        // imageUrl={blockImageSrc || chapterImageSrc || baseImageSrc}
        footer={
            <div className="flex justify-between items-center">

                <a href={link} id="" className="bg-none" >
                    <div className="flex justify-start items-center gap-3 pt-2">
                        <div className="flex items-center gap-2">
                            <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.7812 7.33336L7.20517 3.75736L8.14784 2.8147L13.3332 8.00003L8.14784 13.1854L7.20517 12.2427L10.7812 8.6667H2.6665V7.33336H10.7812Z" fill="#000091" />
                            </svg>
                            <p className="m-0 text-xs text-[#000091]">Détail</p>
                        </div>
                    </div>
                </a >
                <div className="flex flex-row justify-between gap-4">
                    <div className="flex self-end gap-4 ml-auto">
                        {props.block.user_starred != undefined && <StarBlock key={props.block.id} query={query} blockId={props.block.id} starred={props.block.user_starred} />}
                    </div>
                </div>

            </div>
        }
        size="small"
        title={< div className="flex flex-col gap-2 w-full text-left" >
            <p className="m-0 font-bold text-xl text-[#161616]">{block.chapter.title}</p>
            <p className="m-0 font-bold text-[#161616]">{block.title}</p>
        </div >}
        titleAs="h3"
        linkProps={{
            href: link,
            target: "_self"
        }}
    />
}
export const RenderChapter = (props: { chapter: ChapterWithBlock }) => {
    const { chapter } = props;
    const baseImageSrc = 'https://www.systeme-de-design.gouv.fr/img/placeholder.16x9.png';
    // const chapterImageSrc = JSON.parse(chapter.content as string).content.find((e: any) => e.type == "imageBlock")?.attrs?.src
    // const blockImageSrc = chapter.blocks.map((strBlock) => JSON.parse(strBlock.content as string).find((e: any) => e.type == "imageBlock")?.attrs?.src).find(i => i)
    const chapterContent = typeof props.chapter.content === 'string' ? JSON.parse(props.chapter.content) : props.chapter.content;
    return <StyledCardWithoutTitle
        background
        enlargeLink
        border
        badge={(chapter.educationLevels || []).map((e, index) => <Badge className="bg-[#ececfe] text-[#000091] text-sm capitalize" key={index}>{e.name}</Badge>)}
        desc={
            <div className="relative pt-4" >
                <h5 className='text-[#161616] text-left text-[22px]'>{chapter.title}</h5>
                <RenderChapterTOC content={chapterContent.content} />
            </div >
        }
        horizontal
        imageAlt="image d'illustration du chapitre"
        imageUrl={chapter.coverPath || baseImageSrc}
        // imageUrl={chapterImageSrc || blockImageSrc || baseImageSrc}
        footer={
            <a href={`/prof/chapitres/${chapter.id}/view`} id="">
                <div className="flex justify-start items-center gap-3 pt-2">
                    <div className="flex items-center gap-2">
                        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.7812 7.33336L7.20517 3.75736L8.14784 2.8147L13.3332 8.00003L8.14784 13.1854L7.20517 12.2427L10.7812 8.6667H2.6665V7.33336H10.7812Z" fill="#000091" />
                        </svg>
                        <p className="m-0 text-xs text-[#000091]">Détail</p>
                    </div>
                </div>
            </a>
        }
        size="small"
        title={''}
        titleAs="h3"
        linkProps={{
            href: `/prof/chapitres/${chapter.id}/view`,
            target: "_self"
        }}
    />
}


const typeMap = {
    image: { label: "Image" },
    pdf_image: { label: "Image PDF" },
    raw_image: { label: "Image brute" },
    pdf_text: { label: "Texte PDF" },
    video_transcript: { label: "Vidéo" },
    website_qa: { label: "Site web Q&R" },
    website: { label: "Site web" },
    website_experience: { label: "Expérience web" },
}

const getDocumentTags = (document: DocumentWithChunks) => {

    const types = Array.from(new Set(document.chunks.map(chunk => chunk.mediaType)));
    const badges = types.map(type => <Badge key={type} noIcon severity="new">{typeMap[type].label}</Badge>)
    return <div className="flex gap-2">{badges}</div>
}


const StyledTile = styled(Tile)`
    .fr-tile__content {
        padding-bottom: 0 !important;
    }
`
export const DocumentPreview = (props: { document: DocumentWithChunks }) => {
    let link = "";
    const chunks = props.document.chunks;
    if (chunks.some(chunk => ["pdf_text", "pdf_image"].includes(chunk.mediaType)))
        link = `/media/pdf/${props.document.id}/1`
    else if (chunks.some(chunk => ["video_transcript"].includes(chunk.mediaType)))
        link = `/media/video/${props.document.id}`
    else if (chunks.some(chunk => ["website_qa", "website", "website_experience"].includes(chunk.mediaType)))
        link = props.document.source
    else if (props.document.s3ObjectName)
        link = s3ToPublicUrl(props.document.s3ObjectName)

    return (
        <StyledTile
            title={props.document.mediaName}
            linkProps={{
                href: link,
                target: "_blank"
            }}
            orientation="horizontal"
            desc={getDocumentTags(props.document)}
            small={true}
        />
    )
}

// export const YoutubeEmbed = (props: { url: string }) => {
//     return <iframe width="100%" className="aspect-video" src={`https://www.youtube.com/embed/${videoId}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
// }
interface ResponsiveYoutubeEmbedProps {
    url: string;
    aspectRatio?: number; // ratio = largeur/hauteur, par défaut 16/9
    onDuration: (duration: number) => void;
    initialStartTime?: number;
}

export interface YouTubePlayerRef {
    seekToTime: (seconds: number) => void;
}

export const YoutubeEmbed = forwardRef<YouTubePlayerRef, ResponsiveYoutubeEmbedProps>(({ url, aspectRatio = 16 / 9, onDuration, initialStartTime = 0 }, ref) => {
    console.log("initialStartTime", initialStartTime)
    const videoId = extractYoutubeVideoId(url);
    const playerRef = useRef<any>(null);
    const opts = {
        width: '100%',
        height: '100%',
        playerVars: {
            autoplay: 0,
            start: initialStartTime
        },
    };

    useImperativeHandle(ref, () => ({
        seekToTime(seconds: number) {
            playerRef.current?.seekTo && playerRef.current?.seekTo(seconds, true);
        }
    }), []);

    const onReady = (event: any) => {
        playerRef.current = event.target;

        const duration = event.target.getDuration();
        onDuration(duration);
    };
    const paddingBottom = (1 / aspectRatio) * 100;

    return <div style={{ position: 'relative', width: '100%', paddingBottom: `${paddingBottom}%` }}>
        <YouTube
            ref={playerRef}
            videoId={videoId}
            opts={opts}
            onReady={onReady}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
    </div>;
});
export const ChunkRenderer: React.FC<OnInserted & ChunkRendererProps> = ({ onInserted, onInsertedLabel, chunk, searchWords }) => {
    if (isImageChunk(chunk)) return <RenderImageCard onInserted={onInserted} onInsertedLabel={onInsertedLabel} chunk={chunk} />;
    if (isPdfImageChunk(chunk)) return <RenderPdfImageCard onInserted={onInserted} onInsertedLabel={onInsertedLabel} chunk={chunk} />;
    if (isPdfTextChunk(chunk)) return <RenderPdfTextCard onInserted={onInserted} onInsertedLabel={onInsertedLabel} chunk={chunk} searchWords={searchWords} />;
    if (isVideoTranscriptChunk(chunk)) return <RenderVideoTranscriptCard onInserted={onInserted} onInsertedLabel={onInsertedLabel} chunk={chunk} searchWords={searchWords} />;
    if (isWebsiteQAChunk(chunk)) return <RenderWebsiteQAChunk onInserted={onInserted} onInsertedLabel={onInsertedLabel} chunk={chunk} searchWords={searchWords} />;
    if (isWebsiteChunk(chunk)) return <RenderWebsiteChunk onInserted={onInserted} onInsertedLabel={onInsertedLabel} chunk={chunk} searchWords={searchWords} />;
    if (isWebsiteExperienceChunk(chunk)) return <RenderWebsiteExperienceChunk onInserted={onInserted} onInsertedLabel={onInsertedLabel} chunk={chunk} searchWords={searchWords} />;
    return null;
};

export default ChunkRenderer;