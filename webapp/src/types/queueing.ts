export interface PgBossJobIndexFile {
    id: string,
    name: string,
    data: {
        author: string,
        filePath: string,
    },
    state: 'created' | 'retry' | 'active' | 'completed' | 'cancelled' | 'failed',
    started_on: Date,
    created_on: Date,
    completed_on: Date
}

export interface PgBossJobGetIndexFileResponse {
    jobs: PgBossJobIndexFile[],
    pagination: {
        currentPage: number,
        totalPages: number,
        pageSize: number,
        totalCount: number
    }
}