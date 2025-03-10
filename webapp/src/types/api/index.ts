import { Activity, Block, Chapter, Comment, CommentThread, EducationLevel, KeyIdea, SchoolSubject, Skill, Tag, Theme, User, UserRoles } from '@prisma/client';
import { BlockWithChapter, ChunkWithScoreUnion } from '../vectordb';

export interface CreateChapterBlockRequest {
    title: string;
    content: string;
    chapterId: string;
}

export interface UserFull extends Omit<User, 'password' | 'emailVerified' | 'resetToken' | 'resetTokenExpiry' | 'creationDate'> {
    roles: UserRoles[], educationLevels: EducationLevel[],
    schoolSubjects: SchoolSubject[],
}

export interface UserFullWithChapterCount extends UserFull {
    chapterCount: number
}

export interface QueryRequest {
    query: string,
    mediaTypes?: string[],
    limit?: number
}

export interface CreateBlockRequest {
    title: string;
    content: string;
    chapterId: string;
}

export interface CreateThreadRequest {
    chapterId: string;
}

export interface CreateMessageRequest {
    chapterId: string;
    message: string;
}

export interface FileUploadResponse {
    s3ObjectName: string;
    message: string;
}


export interface TextWithScore {
    text: string,
    score: number
}

export type FullBlock = Block & { keyIdeas: KeyIdea[], activities: Activity[], tags: Tag[] }
export type CommentWithUserEmail = Comment & { user: { email: string } }
export type FullCommentThread = CommentThread & { comments: CommentWithUserEmail[] }

export type ChapterWithoutBlocks = Chapter & { user: UserFull, skills: Skill[], educationLevels: EducationLevel[], theme: Theme | null } | null;
export type ChapterWithBlock = ChapterWithoutBlocks & { blocks: FullBlock[] };


export type GroupedFavorites = {
    [keyword: string]: { documentChunks: ChunkWithScoreUnion[], blocks: BlockWithChapter[] };
};

export type ExportUrlResponse = { url: string }
export type ExportH5pResponse = { downloadH5p: string, downloadHTML: string, embedUrl: string, h5pContentId: string }
