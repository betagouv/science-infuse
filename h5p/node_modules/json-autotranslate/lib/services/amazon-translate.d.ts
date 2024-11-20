import { TranslationService, TString } from '.';
import { Matcher } from '../matchers';
export declare class AmazonTranslate implements TranslationService {
    private translate;
    private interpolationMatcher;
    private supportedLanguages;
    private decodeEscapes;
    name: string;
    initialize(config?: string, interpolationMatcher?: Matcher, decodeEscapes?: boolean): Promise<void>;
    supportsLanguage(language: string): boolean;
    translateStrings(strings: TString[], from: string, to: string): Promise<{
        key: string;
        value: string;
        translated: string;
    }[]>;
}
