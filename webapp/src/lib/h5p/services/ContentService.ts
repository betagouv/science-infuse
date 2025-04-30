import axios, { AxiosError } from 'axios';
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
}
export class ContentService implements IContentService{
    private h5pUrl: string;
    private jwtToken: string | undefined;
    private csrfToken: string | undefined;

    // State tracking for asynchronous initialization
    private isInitializing: boolean = false;
    private initializationPromise: Promise<void> | null = null;
    private initializationError: Error | null = null;
    private isReady: boolean = false;

    constructor(h5pUrl: string) {
        // Ensure H5P URL is configured
        this.h5pUrl = h5pUrl;
        if (!this.h5pUrl) {
            const errorMsg = "NEXT_PUBLIC_H5P_URL environment variable is not set.";
            console.error(errorMsg);
            // Set initialization error immediately if config is missing
            this.initializationError = new Error(errorMsg);
            this.initializationPromise = Promise.reject(this.initializationError);
            this.isReady = false; // Explicitly set ready state to false
            return; // Stop constructor execution
        }

        // Start the asynchronous authentication process
        console.log('ContentService: Initiating authentication...');
        this.initializationPromise = this._initialize();
    }
    delete = async (contentId: string): Promise<void> => {
        console.log(`ContentService: deleting ${contentId}...`);
        const result = await fetch(`${this.h5pUrl}/h5p/${contentId}`, {
            method: 'delete',
            headers: {
                'Authorization': `Bearer ${this.getJwtToken()}`,
                'CSRF-Token': this.getCsrfToken() ?? ''
            }
        });
        if (!result.ok) {
            throw new Error(
                `Error while deleting content: ${result.status} ${
                    result.statusText
                } ${await result.text()}`
            );
        }
    };
    getEdit = async (contentId: string): Promise<IEditorModel> => {
        console.log(
            `ContentService: Getting information to edit ${contentId}...`
        );
        const res = await fetch(`${this.h5pUrl}/h5p/${contentId}/edit`);
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
            `ContentService: Getting information to play ${contentId}${
                contextId ? `, contextId ${contextId}` : ''
            }${asUserId ? `, asUserId ${asUserId}` : ''}${
                readOnlyState !== undefined
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
            `${this.h5pUrl}/h5p/${contentId}/play${
                queryString ? `?${queryString}` : ''
            }`
        );
        if (!res || !res.ok) {
            throw new Error(`${res.status} ${res.statusText}`);
        }
        return res.json();
    };
    list =  async (): Promise<IContentListEntry[]> => {
        console.log(`ContentService: Listing content objects`);
        const result = await fetch(`${this.h5pUrl}/h5p`);
        if (result.ok) {
            return result.json();
        }
        throw new Error(
            `Request to REST endpoint returned ${result.status} ${
                result.statusText
            }: ${await result.text()}`
        );
    };
    save = async (
        contentId: string,
        requestBody: { library: string; params: any }
    ): Promise<{ contentId: string; metadata: IContentMetadata }> =>{
        if (contentId) {
            console.log(`ContentService: Saving new content.`);
        } else {
            console.log(`ContentService: Saving content ${contentId}`);
        }

        const body = JSON.stringify(requestBody);

        const res = contentId
            ? await fetch(`${this.h5pUrl}/h5p/${contentId}`, {
                  method: 'PATCH',
                  headers: {
                      'Content-Type': 'application/json',
                      'CSRF-Token': this.csrfToken ?? ''
                  },
                  body
              })
            : await fetch(`${this.h5pUrl}/h5p`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'CSRF-Token': this.csrfToken ?? ''
                  },
                  body
              });

        if (!res || !res.ok) {
            throw new Error(
                `${res.status} ${res.statusText} - ${await res.text()}`
            );
        }
        return res.json();

    }
    generateDownloadLink = (contentId: string) => {
        return `${this.h5pUrl}/h5p/download/${contentId}`;
    }

    /**
     * Performs the asynchronous authentication steps.
     * Called by the constructor.
     */
    private async _initialize(): Promise<void> {
        // Prevent multiple initializations
        if (this.isInitializing || this.isReady) {
            // If already initializing or ready, return the existing promise or a resolved one
            return this.initializationPromise ?? Promise.resolve();
        }

        this.isInitializing = true;
        this.initializationError = null; // Reset error state

        try {
            // Step 1: Get JWT from the local API
            console.log('ContentService: Fetching JWT from /api/h5p/auth...');
            const authResponse = await fetch(`/api/h5p/auth`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for cookies/session handling
            });

            if (!authResponse.ok) {
                const errorText = await authResponse.text();
                console.error('ContentService: Failed to get JWT from /api/h5p/auth:', authResponse.status, errorText);
                throw new Error(`Failed to initiate H5P session (status: ${authResponse.status})`);
            }

            const authData = await authResponse.json();
            if (!authData.token) {
                console.error('ContentService: No token received from /api/h5p/auth.');
                throw new Error('No token received from authentication endpoint.');
            }
            this.jwtToken = authData.token;
            console.log('ContentService: Received JWT.'); // Avoid logging the token itself

            // Step 2: Validate the token with the H5P server and get CSRF token
            console.log('ContentService: Validating token with H5P server...');
            const validationResponse = await axios.post(`${this.h5pUrl}/validate-token`, {}, {
                headers: {
                    'Authorization': `Bearer ${this.jwtToken}`,
                    'Accept': 'application/json',
                },
            });

            if (!validationResponse.data || !validationResponse.data.csrfToken) {
                 console.error('ContentService: Invalid response from /validate-token', validationResponse.data);
                 throw new Error('Failed to get CSRF token from H5P server during validation.');
            }

            this.csrfToken = validationResponse.data.csrfToken;
            console.log('ContentService: Received CSRF token and validated successfully.');

            // Authentication successful
            this.isReady = true;
            this.isInitializing = false;

        } catch (error) {
            console.error('ContentService: Authentication failed.', error);
            this.isReady = false;
            this.isInitializing = false;
            // Store the specific error
            if (error instanceof AxiosError) {
                 this.initializationError = new Error(`H5P server communication error: ${error.message} ${error.response?.data ? JSON.stringify(error.response.data) : ''}`);
            } else if (error instanceof Error) {
                this.initializationError = error;
            } else {
                this.initializationError = new Error('An unknown authentication error occurred.');
            }
            // Rethrow the error so the initializationPromise rejects
            throw this.initializationError;
        }
    }

    /**
     * Returns a promise that resolves when the service is authenticated and ready,
     * or rejects if authentication fails.
     */
    public async waitUntilReady(): Promise<void> {
        if (!this.initializationPromise) {
            // This case handles the immediate failure in the constructor (e.g., missing URL)
             return Promise.reject(this.initializationError || new Error("ContentService was not properly initialized."));
        }
        // Wait for the ongoing or completed initialization
        return this.initializationPromise;
    }

    /**
     * Checks if the service has successfully authenticated and is ready to use.
     * Note: This is a synchronous check. For guaranteed readiness, use `waitUntilReady()`.
     */
    public isServiceReady(): boolean {
        return this.isReady;
    }

    /**
     * Gets the initialization error, if any occurred.
     */
    public getInitializationError(): Error | null {
        return this.initializationError;
    }

    /**
     * Gets the CSRF token obtained during authentication.
     * Throws an error if the service is not ready.
     */
    public getCsrfToken(): string {
        if (!this.isReady || !this.csrfToken) {
            throw new Error('ContentService is not ready or CSRF token is missing. Call waitUntilReady() first.');
        }
        return this.csrfToken;
    }

    /**
     * Gets the JWT obtained during authentication.
     * Throws an error if the service is not ready.
     * Use with caution - avoid exposing JWTs unnecessarily.
     */
    public getJwtToken(): string {
        if (!this.isReady || !this.jwtToken) {
            throw new Error('ContentService is not ready or JWT token is missing. Call waitUntilReady() first.');
        }
        return this.jwtToken;
    }
   // The current implementation doesn't have an explicit logout method.
}