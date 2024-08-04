import { Block } from '@prisma/client';
import axios from 'axios';

interface CreateBlockRequest {
  title: string;
  content: string;
  chapterId: string;
}
export interface ImageUploadResponse {
  s3ObjectName: string;
  message: string;
}

interface APIClientImageUploadResponse {
  s3ObjectName: string,
  url: string
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

  async createBlcok(data: CreateBlockRequest): Promise<Block> {
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

  async uploadImage(file: File): Promise<APIClientImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await this.axiosInstance.post<ImageUploadResponse>('/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.s3ObjectName) {
        return {
          s3ObjectName: response.data.s3ObjectName, url: `${process.env.NEXT_PUBLIC_SERVER_URL}/s3/${response.data.s3ObjectName}`
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

  async shareImage(s3ObjectName: string, shared: boolean): Promise<boolean> {
    const response = await this.axiosInstance.post<boolean>('/file/share', { s3ObjectName, shared });
    if (response.data) {
      return response.data
    }
    return false;
  }

  async isImageShared(s3ObjectName: string): Promise<boolean> {
    const response = await this.axiosInstance.get<boolean>(`/file/share?s3ObjectName=${s3ObjectName}`, {});
    if (response.data) {
      return response.data
    }
    return false;
  }

}

export const apiClient = new ApiClient();