export function catchErrorTyped<T, E extends new (...args: any[]) => Error>(
    promise: Promise<T>,
    errorsToCatch?: E[]
): Promise<[undefined, T] | [InstanceType<E>]> {
    return promise
        .then(data => {
            return [undefined, data] as [undefined, T]
        })
        .catch(error => {
            if (errorsToCatch == undefined) {
                return [error]
            }
            if (errorsToCatch.some((e: E) => error instanceof e)) {
                return [error]
            }
            throw error
        })
}


export class DocumentAlreadyIndexed extends Error {
    documentId: string;

    constructor(documentId: string, message?: string) {
        super(message || `Document has already been indexed with ID: ${documentId}`);
        this.name = 'DocumentAlreadyIndexed';
        this.documentId = documentId;
        // This line is needed for proper instanceof checking in TypeScript
        Object.setPrototypeOf(this, DocumentAlreadyIndexed.prototype);
    }
}