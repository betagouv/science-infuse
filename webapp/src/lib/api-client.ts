import { ChunkWithScoreUnion } from '@/types/vectordb';
import { Activity, Block, Chapter, Comment, CommentThread, File as DbFile, DocumentChunk, EducationLevel, FileType, KeyIdea, Skill, StarredDocumentChunk, Tag } from '@prisma/client';
import { JSONContent } from '@tiptap/core';
import axios from 'axios';

export interface QueryRequest {
  query: string,
  mediaTypes?: string[],
  limit?: number
}
interface StarDocumentChunkRequest {
  documentChunkId: string;
  keyword: string;
}
interface UnStarDocumentChunkRequest {
  documentChunkId: string;
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

export interface APIClientFileUploadResponse {
  s3ObjectName: string,
  url: string,
  id: string
}

export interface TextWithScore {
  text: string,
  score: number
}

export type FullBlock = Block & { keyIdeas: KeyIdea[], activities: Activity[], tags: Tag[] }
export type CommentWithUserEmail = Comment & { user: { email: string } }
export type FullCommentThread = CommentThread & { comments: CommentWithUserEmail[] }

export type ChapterWithoutBlocks = (Chapter & { skills: Skill[], educationLevels: EducationLevel[] }) | null;
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

  async createBlock(data: CreateBlockRequest): Promise<Block> {
    const response = await this.axiosInstance.post<Block>('/course/chapters/blocks', data);
    return response.data;
  }

  async getStarDocumentChunk(): Promise<{ [key: string]: ChunkWithScoreUnion[] }> {
    const response = await this.axiosInstance.get<{ [key: string]: ChunkWithScoreUnion[] }>('/starDocumentChunk');
    return response.data;
  }

  async starDocumentChunk(data: StarDocumentChunkRequest): Promise<boolean> {
    const response = await this.axiosInstance.post<boolean>('/starDocumentChunk', data);
    return response.data;
  }

  async unStarDocumentChunk(data: UnStarDocumentChunkRequest): Promise<boolean> {
    const response = await this.axiosInstance.delete<boolean>('/starDocumentChunk', { data });
    return response.data;
  }
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

  async uploadFile(file: File): Promise<APIClientFileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.axiosInstance.post<DbFile>('/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.s3ObjectName) {
        return {
          s3ObjectName: response.data.s3ObjectName,
          url: `${process.env.NEXT_PUBLIC_SERVER_URL}/s3/${response.data.s3ObjectName}`,
          id: response.data.id,
        }
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

  async saveBlock(blockId: string, title: string, content: any[], keyIdeas?: string[]): Promise<boolean> {
    const response = await this.axiosInstance.put(`/course/chapters/blocks/${blockId}`, {
      title: title,
      content: JSON.stringify(content),
      keyIdeas: keyIdeas
    })
    return response.data;
  }

  async saveChapter(chapterId: string, title: string, content: JSONContent | string, skills?: Skill[], educationLevels?: EducationLevel[]): Promise<boolean> {
    const response = await this.axiosInstance.put(`/course/chapters/${chapterId}`, {
      title: title,
      content: JSON.stringify(content),
      skills,
      educationLevels
    });
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
}

export const apiClient = new ApiClient();