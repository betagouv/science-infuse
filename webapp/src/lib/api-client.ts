import { CourseChapterBlock } from '@prisma/client';
import axios from 'axios';

interface CreateCourseChapterBlockRequest {
  title: string;
  content: string;
  chapterId: string;
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

  async createCourseChapterBlock(data: CreateCourseChapterBlockRequest): Promise<CourseChapterBlock> {
    const response = await this.axiosInstance.post<CourseChapterBlock>('/course/chapters/blocks', data);
    return response.data;
  }

  async deleteCourseChapterBlock(blockId: string): Promise<CourseChapterBlock> {
    const response = await this.axiosInstance.delete<CourseChapterBlock>(`/course/chapters/blocks/${blockId}`);
    return response.data;
  }

  async getCourseChapterBlocks(): Promise<CourseChapterBlock[]> {
    const response = await this.axiosInstance.get<CourseChapterBlock[]>('/course/chapters/blocks');
    return response.data;
  }

}

export const apiClient = new ApiClient();