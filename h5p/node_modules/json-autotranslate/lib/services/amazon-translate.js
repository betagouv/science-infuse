"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmazonTranslate = void 0;
const client_translate_1 = require("@aws-sdk/client-translate");
const html_entities_1 = require("html-entities");
const matchers_1 = require("../matchers");
const fs_1 = __importDefault(require("fs"));
class AmazonTranslate {
    translate;
    interpolationMatcher;
    supportedLanguages = {
        'af': 'af',
        'sq': 'sq',
        'am': 'am',
        'ar': 'ar',
        'hy': 'hy',
        'az': 'az',
        'bn': 'bn',
        'bs': 'bs',
        'bg': 'bg',
        'ca': 'ca',
        'zh': 'zh',
        'zh-tw': 'zh-TW',
        'hr': 'hr',
        'cs': 'cs',
        'da': 'da',
        'fa-af': 'fa-AF',
        'nl': 'nl',
        'en': 'en',
        'et': 'et',
        'fa': 'fa',
        'tl': 'tl',
        'fi': 'fi',
        'fr': 'fr',
        'fr-ca': 'fr-CA',
        'ka': 'ka',
        'de': 'de',
        'el': 'el',
        'gu': 'gu',
        'ht': 'ht',
        'ha': 'ha',
        'he': 'he',
        'hi': 'hi',
        'hu': 'hu',
        'is': 'is',
        'id': 'id',
        'ga': 'ga',
        'it': 'it',
        'ja': 'ja',
        'kn': 'kn',
        'kk': 'kk',
        'ko': 'ko',
        'lv': 'lv',
        'lt': 'lt',
        'mk': 'mk',
        'ms': 'ms',
        'ml': 'ml',
        'mt': 'mt',
        'mr': 'mr',
        'mn': 'mn',
        'no': 'no',
        'ps': 'ps',
        'pl': 'pl',
        'pt': 'pt',
        'pt-pt': 'pt-PT',
        'pa': 'pa',
        'ro': 'ro',
        'ru': 'ru',
        'sr': 'sr',
        'si': 'si',
        'sk': 'sk',
        'sl': 'sl',
        'so': 'so',
        'es': 'es',
        'es-mx': 'es-MX',
        'sw': 'sw',
        'sv': 'sv',
        'ta': 'ta',
        'te': 'te',
        'th': 'th',
        'tr': 'tr',
        'uk': 'uk',
        'ur': 'ur',
        'uz': 'uz',
        'vi': 'vi',
        'cy': 'cy',
    };
    decodeEscapes;
    name = 'Amazon Translate';
    async initialize(config, interpolationMatcher, decodeEscapes) {
        const configJson = config ? JSON.parse(fs_1.default.readFileSync(config).toString()) : {};
        this.translate = new client_translate_1.Translate(configJson);
        this.interpolationMatcher = interpolationMatcher;
        this.decodeEscapes = decodeEscapes;
    }
    supportsLanguage(language) {
        return Object.keys(this.supportedLanguages).includes(language.toLowerCase());
    }
    async translateStrings(strings, from, to) {
        return Promise.all(strings.map(async ({ key, value }) => {
            const { clean, replacements } = (0, matchers_1.replaceInterpolations)(value, this.interpolationMatcher);
            const { TranslatedText } = await this.translate.translateText({
                Text: clean,
                SourceLanguageCode: this.supportedLanguages[from.toLowerCase()],
                TargetLanguageCode: this.supportedLanguages[to.toLowerCase()],
            });
            const reInsterted = (0, matchers_1.reInsertInterpolations)(TranslatedText, replacements);
            return {
                key: key,
                value: value,
                translated: this.decodeEscapes ? (0, html_entities_1.decode)(reInsterted) : reInsterted,
            };
        }));
    }
}
exports.AmazonTranslate = AmazonTranslate;
