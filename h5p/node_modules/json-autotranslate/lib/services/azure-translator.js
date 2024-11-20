"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureTranslator = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const lodash_1 = require("lodash");
const html_entities_1 = require("html-entities");
const matchers_1 = require("../matchers");
const LANGUAGE_ENDPOINT = 'https://api.cognitive.microsofttranslator.com/languages?api-version=3.0';
const TRANSLATE_ENDPOINT = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0';
class AzureTranslator {
    name = 'Azure';
    apiKey;
    region;
    interpolationMatcher;
    supportedLanguages;
    decodeEscapes;
    async initialize(config, interpolationMatcher, decodeEscapes) {
        const [apiKey, region] = config.split(',');
        if (!apiKey)
            throw new Error(`Please provide an API key for Azure.`);
        this.apiKey = apiKey;
        this.region = region;
        this.interpolationMatcher = interpolationMatcher;
        this.supportedLanguages = await this.getAvailableLanguages();
        this.decodeEscapes = decodeEscapes;
    }
    async getAvailableLanguages() {
        const response = await (0, node_fetch_1.default)(LANGUAGE_ENDPOINT);
        const supported = (await response.json());
        const keys = Object.keys(supported.translation).map((k) => k.toLowerCase());
        // Some language codes can be simplified by using only the part before the dash
        const simplified = keys
            .filter((k) => k.includes('-'))
            .map((l) => l.split('-')[0]);
        return new Set(keys.concat(simplified));
    }
    supportsLanguage(language) {
        return this.supportedLanguages.has(language.toLowerCase());
    }
    async translateBatch(batch, from, to) {
        const toTranslate = batch.map(({ key, value }) => {
            const { clean, replacements } = (0, matchers_1.replaceInterpolations)(value, this.interpolationMatcher);
            return { key, value, clean, replacements };
        });
        const headers = {
            'Ocp-Apim-Subscription-Key': this.apiKey,
            'Content-Type': 'application/json; charset=UTF-8',
        };
        if (this.region) {
            headers['Ocp-Apim-Subscription-Region'] = this.region;
        }
        const response = await (0, node_fetch_1.default)(`${TRANSLATE_ENDPOINT}&from=${from}&to=${to}&textType=html`, {
            method: 'POST',
            headers,
            body: JSON.stringify(toTranslate.map((c) => ({ Text: c.clean }))),
        });
        if (!response.ok) {
            throw new Error('Azure Translation failed: ' + (await response.text()));
        }
        const data = (await response.json());
        return data.map((res, i) => {
            const translated = (0, matchers_1.reInsertInterpolations)(res.translations[0].text, toTranslate[i].replacements);
            return {
                key: toTranslate[i].key,
                value: toTranslate[i].value,
                translated: this.decodeEscapes ? (0, html_entities_1.decode)(translated) : translated,
            };
        });
    }
    async translateStrings(strings, from, to) {
        const batches = (0, lodash_1.chunk)(strings, 50);
        const results = await Promise.all(batches.map((batch) => this.translateBatch(batch, from, to)));
        return (0, lodash_1.flatten)(results);
    }
}
exports.AzureTranslator = AzureTranslator;
