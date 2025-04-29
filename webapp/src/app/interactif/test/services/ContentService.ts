// /home/erwan/Desktop/clients/ScienceInfuse/webapp/src/app/interactif/test/services/ContentService.ts
import type {
    IEditorModel,
    IPlayerModel,
    IContentMetadata
} from '@lumieducation/h5p-server';

export interface IContentListEntry {
    contentId: string;
    mainLibrary: string;
    title: string;
    originalNewKey?: string;
}

export interface IContentService {
    delete(contentId: string): Promise<void>;
    getEdit(contentId: string): Promise<IEditorModel>;
    getPlay(
        contentId: string,
        contextId?: string,
        asUserId?: string,
        readOnlyState?: boolean
    ): Promise<IPlayerModel>;
    list(): Promise<IContentListEntry[]>;
    save(
        contentId: string,
        requestBody: { library: string; params: any }
    ): Promise<{ contentId: string; metadata: IContentMetadata }>;
    generateDownloadLink(contentId: string): string;
    setCsrfToken(csrfToken: string | undefined): void; // Added type hint
    getCsrfToken(): string | undefined;
    setJwtToken(jwtToken: string | undefined): void; // Added JWT methods
    getJwtToken(): string | undefined; // Added JWT methods
}

export class ContentService implements IContentService {
    /**
     *
     */
    constructor(protected baseUrl: string = '') {
        this.csrfToken = localStorage.getItem('h5p_csrf_token') || undefined;
        this.jwtToken = localStorage.getItem('h5p_jwt_token') || undefined;
    }

    private csrfToken: string | undefined = undefined;
    private jwtToken: string | undefined = undefined; // Added JWT property

    // Helper to generate headers
    private getHeaders(includeContentType: boolean = false): HeadersInit {
        const headers: HeadersInit = {};
        if (this.jwtToken) {
            headers['Authorization'] = `Bearer ${this.jwtToken}`;
            console.log('Adding Authorization header with JWT:', this.jwtToken.substring(0, 15) + '...');
        } else {
            console.log('No JWT token available for request headers');
        }
        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    }

    private getStateChangingHeaders(): HeadersInit {
        // 1. Get base headers
        const headers: Record<string, string> = this.getHeaders(true) as Record<string, string>;
        console.log('[getStateChangingHeaders] Initial headers:', JSON.stringify(headers)); // Log 1: Before check

        // 2. Log the token value we expect to add
        console.log('[getStateChangingHeaders] CSRF token value available:', this.csrfToken); // Log 2: Value check

        // 3. Check and attempt to add
        if (this.csrfToken) {
            console.log('[getStateChangingHeaders] Condition (this.csrfToken) is TRUE. Attempting to add header...'); // Log 3: Inside IF
            headers['csrf-token'] = this.csrfToken;
            console.log('[getStateChangingHeaders] Headers object *immediately after* assignment:', JSON.stringify(headers)); // Log 4: AFTER assignment
        } else {
            console.warn('[getStateChangingHeaders] Condition (this.csrfToken) is FALSE. Not adding header.');
        }

        // 4. Log the final object being returned
        console.log('[getStateChangingHeaders] Final headers object being returned:', JSON.stringify(headers)); // Log 5: Final check
        return headers;
    }

    delete = async (contentId: string): Promise<void> => {
        console.log(`ContentService: deleting ${contentId}...`);
        const result = await fetch(`${this.baseUrl}/${contentId}`, {
            method: 'DELETE', // Corrected method to uppercase DELETE
            headers: this.getStateChangingHeaders() // Use helper for state-changing headers
        });
        if (!result.ok) {
            throw new Error(
                `Error while deleting content: ${result.status} ${result.statusText
                } ${await result.text()}`
            );
        }
    };

    getEdit = async (contentId: string): Promise<IEditorModel> => {
        console.log(
            `ContentService: Getting information to edit ${contentId}...`
        );
        const res = await fetch(`${this.baseUrl}/${contentId}/edit`, {
            headers: this.getHeaders() // Add JWT header
        });
        if (!res || !res.ok) {
            throw new Error(`${res.status} ${res.statusText}`);
        }
        return res.json();
    };

    getPlay = async (
        contentId: string,
        contextId?: string,
        asUserId?: string,
        readOnlyState?: boolean
    ): Promise<IPlayerModel> => {
        console.log(
            `ContentService: Getting information to play ${contentId}${contextId ? `, contextId ${contextId}` : ''
            }${asUserId ? `, asUserId ${asUserId}` : ''}${readOnlyState !== undefined
                ? `, readOnlyState ${readOnlyState}`
                : ''
            }...`
        );

        const query = new URLSearchParams();
        if (contextId) {
            query.append('contextId', contextId);
        }
        if (asUserId) {
            query.append('asUserId', asUserId);
        }
        if (readOnlyState === true) {
            query.append('readOnlyState', 'yes');
        }

        const queryString = query.toString();

        const res = await fetch(
            `${this.baseUrl}/${contentId}/play${queryString ? `?${queryString}` : ''
            }`,
            {
                headers: this.getHeaders() // Add JWT header
            }
        );
        if (!res || !res.ok) {
            throw new Error(`${res.status} ${res.statusText}`);
        }
        return res.json();
    };

    list = async (): Promise<IContentListEntry[]> => {
        console.log(`ContentService: Listing content objects`);
        const result = await fetch(this.baseUrl, {
            headers: this.getHeaders() // Add JWT header
        });
        if (result.ok) {
            return result.json();
        }
        throw new Error(
            `Request to REST endpoint returned ${result.status} ${result.statusText
            }: ${await result.text()}`
        );
    };

    save = async (
        contentId: string, // Note: In your original code, contentId is '' for new, not null/undefined
        requestBody: { library: string; params: any }
    ): Promise<{ contentId: string; metadata: IContentMetadata }> => {
        const isNew = !contentId || contentId === 'new'; // Check if it's new content
        if (isNew) {
            console.log(`ContentService: Saving new content.`);
        } else {
            console.log(`ContentService: Saving content ${contentId}`);
        }

        console.log(`ContentService (save): Checking CSRF token before fetch. Is it present?`, !!this.csrfToken);
        if (this.csrfToken) {
            console.log(`ContentService (save): CSRF Token value being used: ${this.csrfToken}`);
        } else {
            console.error(`ContentService (save): ERROR - CSRF token is missing before making the save request!`);
        }

        const body = JSON.stringify(requestBody);
        const url = isNew ? this.baseUrl : `${this.baseUrl}/${contentId}`;
        const method = isNew ? 'POST' : 'PATCH';

        const res = await fetch(url, {
            method: method,
            headers: this.getStateChangingHeaders(), // Use helper for state-changing headers
            body
        });


        if (!res || !res.ok) {
            throw new Error(
                `${res.status} ${res.statusText} - ${await res.text()}`
            );
        }
        return res.json();
    };

    generateDownloadLink = (contentId: string): string =>
        `${this.baseUrl}/download/${contentId}`; // Note: Ensure /download route exists and is authenticated

    setCsrfToken = (csrfToken: string | undefined): void => {
        this.csrfToken = csrfToken;

        if (csrfToken) {
            localStorage.setItem('h5p_csrf_token', csrfToken);
        } else {
            localStorage.removeItem('h5p_csrf_token');
        }
    }
    getCsrfToken = (): string | undefined => {
        return this.csrfToken;
    };

    // Added JWT methods
    setJwtToken = (jwtToken: string | undefined): void => {
        console.log("ContentService: Setting JWT:", jwtToken ? jwtToken.substring(0, 15) + '...' : 'undefined');
        this.jwtToken = jwtToken;

        // Persist to localStorage
        if (jwtToken) {
            localStorage.setItem('h5p_jwt_token', jwtToken);
        } else {
            localStorage.removeItem('h5p_jwt_token');
        }
    }

    getJwtToken = (): string | undefined => {
        return this.jwtToken;
    }
}