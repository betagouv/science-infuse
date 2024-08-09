import { Block, File as DbFile, FileType } from '@prisma/client';
import { JSONContent } from '@tiptap/core';
import axios from 'axios';

interface CreateBlockRequest {
  title: string;
  content: string;
  chapterId: string;
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

  async createBlock(data: CreateBlockRequest): Promise<Block> {
    const response = await this.axiosInstance.post<Block>('/course/chapters/blocks', data);
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
    const response = await this.axiosInstance.post<string>('/ai/completion', { context });
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

  async saveBlock(blockId: string, title: string, content: any[]): Promise<boolean> {
    const response = await this.axiosInstance.put(`/course/chapters/blocks/${blockId}`, { title: title, content: JSON.stringify(content) })
    return response.data;
  }

  async saveChapter(chapterId: string, title: string, content: JSONContent | string): Promise<boolean> {
    const response = await this.axiosInstance.put(`/course/chapters/${chapterId}`, { title: title, content: JSON.stringify(content) });
    return response.data;
  }



}

export const apiClient = new ApiClient();