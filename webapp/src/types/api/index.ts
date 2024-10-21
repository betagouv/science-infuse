import { Activity, Block, Chapter, Comment, CommentThread, EducationLevel, KeyIdea, SchoolSubject, Skill, Tag, User, UserRoles } from '@prisma/client';
import { BlockWithChapter, ChunkWithScoreUnion } from '../vectordb';

export interface CreateChapterBlockRequest {
    title: string;
    content: string;
    chapterId: string;
}

export interface UserFull extends Omit<User, 'password' | 'emailVerified' | 'resetToken' | 'resetTokenExpiry'> {
    roles: UserRoles[],    educationLevels: EducationLevel[],
    schoolSubjects: SchoolSubject[],
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

export type ChapterWithoutBlocks = Chapter & { user: UserFull, skills: Skill[], educationLevels: EducationLevel[] } | null;
export type ChapterWithBlock = ChapterWithoutBlocks & { blocks: FullBlock[] };


export type GroupedFavorites = {
    [keyword: string]: { documentChunks: ChunkWithScoreUnion[], blocks: BlockWithChapter[] };
};