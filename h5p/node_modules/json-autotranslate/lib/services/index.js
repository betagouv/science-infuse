"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceMap = void 0;
const google_translate_1 = require("./google-translate");
const deepl_1 = require("./deepl");
const dry_run_1 = require("./dry-run");
const azure_translator_1 = require("./azure-translator");
const manual_1 = require("./manual");
const amazon_translate_1 = require("./amazon-translate");
exports.serviceMap = {
    'google-translate': new google_translate_1.GoogleTranslate(),
    deepl: new deepl_1.DeepL(false),
    'deepl-free': new deepl_1.DeepL(true),
    'dry-run': new dry_run_1.DryRun(),
    azure: new azure_translator_1.AzureTranslator(),
    manual: new manual_1.ManualTranslation(),
    'amazon-translate': new amazon_translate_1.AmazonTranslate(),
};
