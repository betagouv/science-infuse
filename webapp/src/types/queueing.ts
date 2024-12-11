export interface PgBossJobIndexContent {
    id: string,
    name: string,
    data: {
        author: string,
        path: string,
    },
    state: 'created' | 'retry' | 'active' | 'completed' | 'cancelled' | 'failed',
    started_on: Date,
    created_on: Date,
    completed_on: Date
}

export interface PgBossJobGetIndexContentResponse {
    jobs: PgBossJobIndexContent[],
    pagination: {
        currentPage: number,
        totalPages: number,
        pageSize: number,
        totalCount: number
    }
}

export enum IndexingContentType {
    url = 'url',
    file = 'file',
    youtube = 'youtube'
  }
  