import { Matcher } from '../matchers';
import { TranslationService, TString } from '.';
export declare class GoogleTranslate implements TranslationService {
    private translate;
    private interpolationMatcher;
    private supportedLanguages;
    private decodeEscapes;
    name: string;
    cleanResponse(response: string): string;
    initialize(config?: string, interpolationMatcher?: Matcher, decodeEscapes?: boolean): Promise<void>;
    getAvailableLanguages(): Promise<string[]>;
    supportsLanguage(language: string): boolean;
    cleanLanguageCode(languageCode: string): any;
    translateStrings(strings: TString[], from: string, to: string): Promise<{
        key: string;
        value: string;
        translated: string;
    }[]>;
}
