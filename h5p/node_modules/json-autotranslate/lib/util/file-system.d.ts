export type FileType = 'key-based' | 'natural' | 'auto';
export type DirectoryStructure = 'default' | 'ngx-translate';
export interface TranslatableFile {
    name: string;
    originalContent: string;
    type: FileType;
    content: object;
}
export declare const getAvailableLanguages: (directory: string, directoryStructure: DirectoryStructure) => string[];
export declare const detectFileType: (json: any) => FileType;
export declare const loadTranslations: (directory: string, fileType?: FileType, withArrays?: boolean) => TranslatableFile[];
export declare const fixSourceInconsistencies: (directory: string, cacheDir: string) => void;
export declare const evaluateFilePath: (directory: string, dirStructure: DirectoryStructure, lang: string) => string;
