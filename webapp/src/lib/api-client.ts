import { SearchResults, ChunkWithScoreUnion } from '@/types/vectordb';
import { Academy, Activity, Block, Chapter, Comment, CommentThread, File as DbFile, DocumentChunk, EducationLevel, FileType, KeyIdea, SchoolSubject, Skill, StarredDocumentChunk, Tag, Theme, User, UserRoles } from '@prisma/client';
import { JSONContent } from '@tiptap/core';
import axios from 'axios';
import { GroupedFavorites, TableOfContents } from './types';
import { WEBAPP_URL } from '@/config';


export interface UserFull extends Omit<User, 'password'> {
  roles: UserRoles[],
  educationLevels: EducationLevel[],
  schoolSubjects: SchoolSubject[],
}
export interface QueryRequest {
  query: string,
  mediaTypes?: string[],
  limit?: number
}

interface CreateBlockRequest {
  title: string;
  content: string;
  chapterId: string;
}

interface CreateThreadRequest {
  chapterId: string;
}

interface CreateMessageRequest {
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

export type ChapterWithoutBlocks = Chapter & { skills: Skill[], educationLevels: EducationLevel[] } | null;
export type ChapterWithBlock = ChapterWithoutBlocks & { blocks: FullBlock[] };


class ApiClient {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getUser(): Promise<UserFull> {
    const response = await this.axiosInstance.get<UserFull>(`/users/me`);
    return response.data;
  }

  async updateUser(userData: Partial<UserFull>, userId?: string): Promise<UserFull> {
    const response = await this.axiosInstance.put<UserFull>(`/users/${userId || "me"}`, userData);
    return response.data;
  }

  async getThemes(): Promise<Theme[]> {
    const response = await this.axiosInstance.get<Theme[]>(`/themes`);
    return response.data;
  }

  async getChaptersByTheme(themeId: string): Promise<ChapterWithBlock[]> {
    const response = await this.axiosInstance.get<ChapterWithBlock[]>(`/course/chapters/byTheme/${themeId}`);
    return response.data;
  }

  async search(queryData: QueryRequest): Promise<SearchResults> {
    const response = await this.axiosInstance.post<SearchResults>(`/search`, queryData);
    return response.data;
  }

  async deleteDocument(id: string): Promise<any> {
    const response = await this.axiosInstance.delete<any>(`/document/${id}`);
    return response.data;
  }

  async getDocumentToc(id: string): Promise<TableOfContents> {
    const response = await this.axiosInstance.get<TableOfContents>(`/document/${id}/toc`);
    return response.data;
  }

  async getDocumentS3PresignedUrl(id: string): Promise<string> {
    const response = await this.axiosInstance.get<string>(`/s3/presigned_url/document/${id}`);
    return response.data;
  }

  async getThread(threadId: string): Promise<FullCommentThread> {
    const response = await this.axiosInstance.get<FullCommentThread>(`/comments/thread/${threadId}`);
    return response.data;
  }

  async getKeyIdeaAiReco(context: string): Promise<TextWithScore[]> {
    const response = await this.axiosInstance.post<TextWithScore[]>(`/ai/completion/keyIdea`, { context });
    return response.data;
  }

  async getChapter(chapterId: string): Promise<ChapterWithoutBlocks> {
    const response = await this.axiosInstance.get<ChapterWithoutBlocks>(`/course/chapters/${chapterId}`);
    return response.data;
  }

  async duplicateChapter(chapterId: string): Promise<ChapterWithoutBlocks> {
    const response = await this.axiosInstance.get<ChapterWithoutBlocks>(`/course/chapters/${chapterId}/duplicate`);
    return response.data;
  }

  async createBlock(data: CreateBlockRequest): Promise<Block> {
    const response = await this.axiosInstance.post<Block>('/course/chapters/blocks', data);
    return response.data;
  }

  async getUserStarredContent(): Promise<GroupedFavorites> {
    const response = await this.axiosInstance.get<GroupedFavorites>('/users/me/starred_content');
    return response.data;
  }

  async starDocumentChunk(id: string, keyword: string): Promise<boolean> {
    const response = await this.axiosInstance.post<boolean>(`/documentChunks/star/${id}`, {keyword});
    return response.data;
  }

  async unStarDocumentChunk(id: string): Promise<boolean> {
    const response = await this.axiosInstance.delete<boolean>(`/documentChunks/star/${id}`);
    return response.data;
  }

  async starBlock(id: string, keyword: string): Promise<boolean> {
    const response = await this.axiosInstance.post<boolean>(`/course/chapters/blocks/${id}/star`, {keyword});
    return response.data;
  }

  async unStarBlock(id: string): Promise<boolean> {
    const response = await this.axiosInstance.delete<boolean>(`/course/chapters/blocks/${id}/star`);
    return response.data;
  }

  // async starBlock(data: StarBlockRequest): Promise<boolean> {
  //   const response = await this.axiosInstance.post<boolean>(`/block/star`, data);
  //   return response.data;
  // }

  // async unStarBlock(data: UnStarDocumentChunkRequest): Promise<boolean> {
  //   const response = await this.axiosInstance.delete<boolean>(`/block/star`, { data });
  //   return response.data;
  // }
  async createThread(data: CreateThreadRequest): Promise<CommentThread> {
    const response = await this.axiosInstance.post<CommentThread>('/comments/thread', data);
    return response.data;
  }

  async createMessage(threadId: string, data: CreateMessageRequest): Promise<CommentThread> {
    const response = await this.axiosInstance.post<CommentThread>(`/comments/thread/${threadId}`, data);
    return response.data;
  }

  async deleteBlock(blockId: string): Promise<Block> {
    const response = await this.axiosInstance.delete<Block>(`/course/chapters/blocks/${blockId}`);
    return response.data;
  }

  async getBlocks(): Promise<Block[]> {
    const response = await this.axiosInstance.get<Block[]>('/course/chapters/blocks');
    return response.data;
  }

  async uploadFile(file: File, author?: string): Promise<DbFile> {
    const formData = new FormData();
    formData.append('file', file);
    if (author)
      formData.append('author', author);

    try {
      const response = await this.axiosInstance.post<DbFile>('/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("WEBAPP_URLWEBAPP_URLWEBAPP_URLWEBAPP_URL", WEBAPP_URL)
      if (response.data && response.data.s3ObjectName) {
        return response.data;
        // url: `${WEBAPP_URL}/api/s3/presigned_url/object_name/${response.data.s3ObjectName}`,
      } else {
        throw new Error('Upload failed: No filename received');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Upload error:', error.response?.data || error.message);
        throw new Error(`Upload failed: ${error.response?.data?.error || error.message} `);
      } else {
        console.error('Unexpected error:', error);
        throw new Error('An unexpected error occurred during upload');
      }
    }
  }

  async shareFile(s3ObjectName: string, shared: boolean): Promise<boolean> {
    const response = await this.axiosInstance.post<boolean>('/file/share', { s3ObjectName, shared });
    if (response.data) {
      return response.data
    }
    return false;
  }

  async isFileShared(s3ObjectName: string): Promise<boolean> {
    const response = await this.axiosInstance.get<boolean>(`/file/share?s3ObjectName=${s3ObjectName}`, {});
    if (response.data) {
      return response.data
    }
    return false;
  }

  async getFileTypes(): Promise<FileType[]> {
    const response = await this.axiosInstance.get<FileType[]>(`/course/fileType`, {});
    if (response.data) {
      return response.data
    }
    return [];
  }

  async updateFile(id: string, fields: Partial<DbFile>, fileTypes?: string[]): Promise<DbFile | null> {
    const response = await this.axiosInstance.put<DbFile>(`/course/files/${id}`, { ...fields, fileTypes });
    if (response.data) {
      return response.data
    }
    return null;
  }

  async autoComplete(context: string): Promise<string> {
    const response = await this.axiosInstance.post<string>('/ai/completion/text', { context });
    if (response.data) {
      return response.data
    }
    return "";
  }


  async generateQuiz(context: string): Promise<string> {
    const response = await this.axiosInstance.post<string>('/ai/quiz', { context });
    if (response.data) {
      return response.data
    }
    return "";
  }

  async updateBlock(chapterId: string, blockId: string, title: string, content: any[]): Promise<boolean> {
    const response = await this.axiosInstance.put(`/course/chapters/blocks/${blockId}`, {
      title: title,
      chapterId,
      content: JSON.stringify(content),
    })
    return response.data;
  }

  async updateChapter(chapterId: string, data: Partial<ChapterWithoutBlocks>): Promise<boolean> {
    const response = await this.axiosInstance.put(`/course/chapters/${chapterId}`, data);
    return response.data;
  }
  async getSkills(): Promise<Skill[]> {
    const response = await this.axiosInstance.get<Skill[]>(`/skills`);
    return response.data;
  }

  async getKeyIdeas(): Promise<KeyIdea[]> {
    const response = await this.axiosInstance.get<KeyIdea[]>(`/keyIdeas`);
    return response.data;
  }

  async getEducationLevels(): Promise<EducationLevel[]> {
    const response = await this.axiosInstance.get<EducationLevel[]>(`/educationLevel`);
    return response.data;
  }

  async getSchoolSubject(): Promise<SchoolSubject[]> {
    const response = await this.axiosInstance.get<SchoolSubject[]>(`/schoolSubjects`);
    return response.data;
  }

  async getAcademies(): Promise<Academy[]> {
    const response = await this.axiosInstance.get<Academy[]>(`/academies`);
    return response.data;
  }

  async getUsers(): Promise<UserFull[]> {
    console.log("GET USERS")
    const response = await this.axiosInstance.get<UserFull[]>(`/users`);
    console.log("GET USERS data", response.data)

    return response.data;
  }
}

export const apiClient = new ApiClient();