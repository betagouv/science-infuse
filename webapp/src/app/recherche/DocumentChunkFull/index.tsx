import React, { useEffect, useState } from "react";
import { Quote } from "@codegouvfr/react-dsfr/Quote";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { BlockWithChapter, ChunkWithScore, ChunkWithScoreUnion, GroupedVideo, isPdfImageChunk, isPdfTextChunk, isVideoTranscriptChunk, isWebsiteExperienceChunk, isWebsiteQAChunk } from "@/types/vectordb";
import { findNormalizedChunks } from "../text-highlighter";
import Highlighter from "react-highlight-words";
import { WEBAPP_URL } from "@/config";
import { Typography, Collapse, Tooltip, styled } from '@mui/material';

import styledComponent from '@emotion/styled';


import Badge from "@codegouvfr/react-dsfr/Badge";
// import Button from "@codegouvfr/react-dsfr/Button";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { apiClient, ChapterWithBlock } from "@/lib/api-client";
import { useSnackbar } from "@/app/SnackBarProvider";
import { useSearchParams } from "next/navigation";
import VideoPlayerHotSpots from "@/app/mediaViewers/VideoPlayerHotSpots";
import { TiptapEditor, useTiptapEditor } from "@/course_editor";
import { OnInserted } from "../RenderSearch";
import { RenderChapterBlockTOC, RenderChapterTOC } from "@/course_editor/components/CourseSettings/ChapterTableOfContents";
import { JSONContent } from "@tiptap/core";

const StyledCardWithoutTitle = styled(Card)`
.fr-card__content {
    padding: 1rem;
    padding-top: 0;
}

.fr-card__title {
    display: none;
}
`

const StyledGroupedVideoCard = styled(StyledCardWithoutTitle)`
.fr-card__body,
.fr-card__content,
.fr-card__desc,
.fr-card__start {
    margin: 0;
    padding: 0;
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

const Star = (props: { query: string, chunkId: string, starred: boolean }) => {
    const [starred, setStarred] = useState(props.starred);
    const { showSnackbar } = useSnackbar();

    const starDocumentChunk = async () => {
        await apiClient.starDocumentChunk({ documentChunkId: props.chunkId, keyword: props.query })
        setStarred(true);
        showSnackbar(
            <p className="m-0">Favori ajouté avec succès</p>,
            'success'
        )
    }

    const unStarDocumentChunk = async () => {
        await apiClient.unStarDocumentChunk({ documentChunkId: props.chunkId })
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

export const BuildCardEnd = (props: OnInserted & { chunk: ChunkWithScoreUnion, end?: React.ReactNode, downloadLink?: string, starred: boolean | undefined }) => {
    const searchParams = useSearchParams();
    const query = searchParams.get('query') || "";
    return (
        <div className="flex flex-row justify-between gap-4">
            {props.end}
            <div className="flex self-end gap-4 ml-auto">
                {props.starred != undefined && <Star key={props.chunk.id} query={query} chunkId={props.chunk.id} starred={props.starred} />}
                {
                    props.downloadLink && <button
                        onClick={() => window.open(props.downloadLink, '_blank')}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M3 19H21V21H3V19ZM13 13.172L19.071 7.1L20.485 8.514L12 17L3.515 8.515L4.929 7.1L11 13.17V2H13V13.172Z" fill="#161616" />
                        </svg>
                    </button>
                }

                {
                    props.onInserted && <button
                        onClick={() => props.onInserted && props.onInserted(props.chunk)}
                    >
                        <svg width={14} height={14} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"  >
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M6 6V0H8V6H14V8H8V14H6V8H0V6H6Z" fill="#161616" />
                        </svg>
                    </button>
                }

                {/* <button
                onClick={async () => {
                    await apiClient.deleteDocument(props.chunk.document.id)
                }}
                >
                    delete
                </button> */}


            </div>
        </div>
    )
}

// Base Card component
export const BaseCard: React.FC<OnInserted & BaseCardProps> = ({ onInserted, end, children, title, linkProps, chunk, badgeText, badgeSeverity = "new" }) => {

    return (
        <div className="relative">

            <Card
                background
                border
                className="text-left"

                end={<BuildCardEnd onInserted={onInserted} chunk={chunk} end={end} starred={!!chunk?.user_starred} />}
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

export const RenderPdfTextCard: React.FC<OnInserted & { searchWords: string[]; chunk: ChunkWithScore<"pdf_text"> }> = ({ onInserted, searchWords, chunk }) => {
    const path = chunk.title.toLowerCase().split('>');
    if (!chunk.metadata) {
        console.log("CHUNKKK", chunk)
    }
    return (

        <Card
            background
            border
            className="text-left"

            end={
                // <BreadcrumbNoLink className="flex pointer-events-none m-0" list={path} />
                <BuildCardEnd
                    onInserted={onInserted}
                    chunk={chunk}
                    end={
                        <div className="flex">
                            <a className="m-0" href={`/pdf/${chunk.document.id}/${chunk.metadata.pageNumber}`} target="_blank">source</a>
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
                href: `/pdf/${chunk.document.id}/${chunk.metadata.pageNumber}`,
                target: "_blank",
            }}
            size="medium"
            title={`${chunk.document.mediaName} - page ${chunk.metadata.pageNumber}`}
            titleAs="h3"
        />
    )
};


export const RenderPdfImageCard: React.FC<OnInserted & { chunk: ChunkWithScore<"pdf_image"> }> = ({ onInserted, chunk }) => {
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
                chunk={chunk}
                end={
                    <div className="flex">
                        <a className="m-0" href={`/pdf/${chunk.document.id}/${chunk.metadata.pageNumber}`} target="_blank">source</a>
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

export const RenderGroupedVideoTranscriptCard: React.FC<OnInserted & { video: GroupedVideo; searchWords: string[] }> = ({ onInserted, video, searchWords }) => {
    const firstChunk = video.items[0];
    const url = `${WEBAPP_URL}/api/s3/presigned_url/object_name/${firstChunk.document.s3ObjectName}`
    let originalPath = firstChunk.document.originalPath;
    const [selectedChunk, setSelectedChunk] = useState<ChunkWithScore<"video_transcript"> | undefined>(undefined)
    if (originalPath.includes("youtube") && selectedChunk) {
        originalPath = originalPath.replace("https://www.youtube.com/watch?v=", "https://youtu.be/") + `?t=${Math.floor(selectedChunk.metadata.start)}`
    }

    return (
        <StyledGroupedVideoCard
            end={<BuildCardEnd
                onInserted={onInserted}
                chunk={selectedChunk || video.items[0]}
                end={
                    <div className="flex flex-col items-start justify-between gap-4 overflow-hidden">
                        <a className="m-0 text-base overflow-hidden whitespace-nowrap overflow-ellipsis max-w-full" href={`${originalPath}`} target="_blank">{firstChunk.title}</a>
                        <p className="m-0 text-xs text-[#666]">{video.items.length} correspondance{video.items.length > 1 ? 's' : ''}</p>
                    </div>
                }
                starred={selectedChunk ? selectedChunk.user_starred : undefined}
                downloadLink={`${WEBAPP_URL}/api/s3/presigned_url/object_name/${firstChunk.document.s3ObjectName}`}
            />}
            desc={
                <VideoPlayerHotSpots
                    videoUrl={url}
                    selectedChunk={selectedChunk}
                    onChunkSelected={(_chunk) => setSelectedChunk(_chunk)}
                    chunks={video.items}
                />
            }
            size="medium"
            title=""
        />
    )
}
export const RenderVideoTranscriptCard: React.FC<OnInserted & { chunk: ChunkWithScore<"video_transcript">; searchWords: string[] }> = ({ onInserted, chunk, searchWords }) => {
    let originalPath = chunk.document.originalPath;
    const url = `${WEBAPP_URL}/api/s3/presigned_url/object_name/${chunk.document.s3ObjectName}`
    if (originalPath.includes("youtube")) {
        originalPath = originalPath.replace("https://www.youtube.com/watch?v=", "https://youtu.be/") + `?t=${Math.floor(chunk.metadata.start)}`
    }
    return (
        <StyledGroupedVideoCard
            end={<BuildCardEnd
                onInserted={onInserted}
                chunk={chunk}
                end={
                    <div className="flex flex-col items-start justify-between gap-4 overflow-hidden">
                        <a className="m-0 text-base overflow-hidden whitespace-nowrap overflow-ellipsis max-w-full" href={`${originalPath}`} target="_blank">{chunk.title}</a>
                        {/* <p className="m-0 text-xs text-[#666]">{video.items.length} correspondance{video.items.length > 1 ? 's' : ''}</p> */}
                    </div>
                }
                starred={chunk.user_starred}
                downloadLink={`${WEBAPP_URL}/api/s3/presigned_url/object_name/${chunk.document.s3ObjectName}`}
            />}
            desc={
                <VideoPlayerHotSpots
                    videoUrl={url}
                    selectedChunk={chunk}
                    onChunkSelected={() => { }}
                    chunks={[chunk]}
                />
            }
            size="medium"
            title=""
        />

        // <VideoPlayerHotSpots
        //     // <VideoPlayer
        //     selectedChunk={chunk}
        //     onChunkSelected={() => {}}
        //     videoUrl={`${WEBAPP_URL}/api/s3/presigned_url/object_name/${chunk.document.s3ObjectName}`}
        //     chunks={[chunk]}
        // />
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
    const { searchWords, block } = props;
    const baseImageSrc = 'https://www.systeme-de-design.gouv.fr/img/placeholder.16x9.png';
    // const blockImageSrc = JSON.parse(block.content).find((e: any) => e.type == "imageBlock")?.attrs?.src
    // const chapterImageSrc = JSON.parse(block.chapter.content as string).content.find((e: any) => e.type == "imageBlock")?.attrs?.src
    const blockContent = typeof props.block.content === 'string' ? JSON.parse(props.block.content) : props.block.content;
    const link = `/prof/chapitres/${block.chapter.id}/view?block=${props.block.id}`
    console.log("BLOCK CONTENT", blockContent)
    return <StyledCardWithoutTitle
        background
        border
        enlargeLink
        badge={(block.chapter.educationLevels || []).map((e, index) => <Badge className="bg-[#f7dfd8] text-[#ff8742] text-sm capitalize" key={index}>{e.name}</Badge>)}
        start={
            block.chapter.theme ? <ul className="fr-badges-group pt-4 w-full">
                <li className="w-full overflow-hidden">
                    <Badge className="bg-[#f5ece9] text-[#ff8742] whitespace-nowrap overflow-hidden text-ellipsis max-w-full inline-block">
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
            < a href={link} id="" >
                <div className="flex justify-start items-center gap-3 pt-2">
                    <div className="flex items-center gap-2">
                        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.7812 7.33336L7.20517 3.75736L8.14784 2.8147L13.3332 8.00003L8.14784 13.1854L7.20517 12.2427L10.7812 8.6667H2.6665V7.33336H10.7812Z" fill="#FF8742" />
                        </svg>
                        <p className="m-0 text-xs text-[#ff8742]">Détail</p>
                    </div>
                </div>
            </a >
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
        badge={(chapter.educationLevels || []).map((e, index) => <Badge className="bg-[#f7dfd8] text-[#ff8742] text-sm capitalize" key={index}>{e.name}</Badge>)}
        desc={
            <div className="relative pt-4" >
                <p className="text-start text-4xl text-black">{chapter.title}</p>
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
                            <path d="M10.7812 7.33336L7.20517 3.75736L8.14784 2.8147L13.3332 8.00003L8.14784 13.1854L7.20517 12.2427L10.7812 8.6667H2.6665V7.33336H10.7812Z" fill="#FF8742" />
                        </svg>
                        <p className="m-0 text-xs text-[#ff8742]">Détail</p>
                    </div>
                </div>
            </a>
        }
        size="small"
        title={""}
        titleAs="h3"
        linkProps={{
            href: `/prof/chapitres/${chapter.id}/view`,
            target: "_self"
        }}
    />
}

export const ChunkRenderer: React.FC<OnInserted & ChunkRendererProps> = ({ onInserted, chunk, searchWords }) => {
    if (isPdfImageChunk(chunk)) return <RenderPdfImageCard onInserted={onInserted} chunk={chunk} />;
    if (isPdfTextChunk(chunk)) return <RenderPdfTextCard onInserted={onInserted} chunk={chunk} searchWords={searchWords} />;
    if (isVideoTranscriptChunk(chunk)) return <RenderVideoTranscriptCard onInserted={onInserted} chunk={chunk} searchWords={searchWords} />;
    if (isWebsiteQAChunk(chunk)) return <RenderWebsiteQAChunk onInserted={onInserted} chunk={chunk} searchWords={searchWords} />;
    if (isWebsiteExperienceChunk(chunk)) return <RenderWebsiteExperienceChunk onInserted={onInserted} chunk={chunk} searchWords={searchWords} />;
    return null;
};

export default ChunkRenderer;