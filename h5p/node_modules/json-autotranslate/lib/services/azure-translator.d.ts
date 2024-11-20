import { TranslationService, TranslationResult, TString } from '.';
import { Matcher } from '../matchers';
export declare class AzureTranslator implements TranslationService {
    name: string;
    private apiKey;
    private region?;
    private interpolationMatcher;
    private supportedLanguages;
    private decodeEscapes;
    initialize(config?: string, interpolationMatcher?: Matcher, decodeEscapes?: boolean): Promise<void>;
    getAvailableLanguages(): Promise<Set<string>>;
    supportsLanguage(language: string): boolean;
    translateBatch(batch: TString[], from: string, to: string): Promise<{
        key: string;
        value: string;
        translated: string;
    }[]>;
    translateStrings(strings: TString[], from: string, to: string): Promise<TranslationResult[]>;
}
