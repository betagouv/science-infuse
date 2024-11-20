"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleTranslate = void 0;
const translate_1 = require("@google-cloud/translate");
const html_entities_1 = require("html-entities");
const matchers_1 = require("../matchers");
// Contains replacements for language codes
const codeMap = {
    'zh-tw': 'zh-TW',
    'zh-cn': 'zh-CN',
};
class GoogleTranslate {
    translate;
    interpolationMatcher;
    supportedLanguages = [];
    decodeEscapes;
    name = 'Google Translate';
    cleanResponse(response) {
        const translated = response.replace(/\<(.+?)\s*\>\s*(.+?)\s*\<\/\s*(.+?)>/g, '<$1>$2</$3>');
        return this.decodeEscapes ? (0, html_entities_1.decode)(translated) : translated;
    }
    async initialize(config, interpolationMatcher, decodeEscapes) {
        this.translate = new translate_1.v2.Translate({
            autoRetry: true,
            keyFilename: config || undefined,
        });
        this.interpolationMatcher = interpolationMatcher;
        this.supportedLanguages = await this.getAvailableLanguages();
        this.decodeEscapes = decodeEscapes;
    }
    async getAvailableLanguages() {
        const [languages] = await this.translate.getLanguages();
        console.log(languages);
        return languages.map((l) => l.code.toLowerCase());
    }
    supportsLanguage(language) {
        return this.supportedLanguages.includes(language.toLowerCase());
    }
    cleanLanguageCode(languageCode) {
        const lowerCaseCode = languageCode.toLowerCase();
        if (codeMap[lowerCaseCode]) {
            return codeMap[lowerCaseCode];
        }
        return lowerCaseCode.split('-')[0];
    }
    async translateStrings(strings, from, to) {
        return Promise.all(strings.map(async ({ key, value }) => {
            const { clean, replacements } = (0, matchers_1.replaceInterpolations)(value, this.interpolationMatcher);
            const [translationResult] = await this.translate.translate(clean, {
                from: this.cleanLanguageCode(from),
                to: this.cleanLanguageCode(to),
            });
            return {
                key: key,
                value: value,
                translated: this.cleanResponse((0, matchers_1.reInsertInterpolations)(translationResult, replacements)),
            };
        }));
    }
}
exports.GoogleTranslate = GoogleTranslate;
