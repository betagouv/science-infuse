"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateFilePath = exports.fixSourceInconsistencies = exports.loadTranslations = exports.detectFileType = exports.getAvailableLanguages = void 0;
const flat_1 = require("flat");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const getAvailableLanguages = (directory, directoryStructure) => {
    const directoryContent = fs.readdirSync(directory);
    switch (directoryStructure) {
        case 'default':
            return directoryContent
                .map((d) => path.resolve(directory, d))
                .filter((d) => fs.statSync(d).isDirectory())
                .map((d) => path.basename(d));
        case 'ngx-translate':
            return directoryContent
                .filter((f) => f.endsWith('.json'))
                .map((f) => f.slice(0, -5));
    }
};
exports.getAvailableLanguages = getAvailableLanguages;
const detectFileType = (json) => {
    const invalidKeys = Object.keys(json).filter((k) => typeof json[k] === 'string' && (k.includes('.') || k.includes(' ')));
    return invalidKeys.length > 0 ? 'natural' : 'key-based';
};
exports.detectFileType = detectFileType;
const loadTranslations = (directory, fileType = 'auto', withArrays = false) => fs
    .readdirSync(directory)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
    const json = require(path.resolve(directory, f));
    const type = fileType === 'auto' ? (0, exports.detectFileType)(json) : fileType;
    return {
        name: f,
        originalContent: json,
        type,
        content: type === 'key-based'
            ? (0, flat_1.flatten)(require(path.resolve(directory, f)), {
                safe: !withArrays,
            })
            : require(path.resolve(directory, f)),
    };
});
exports.loadTranslations = loadTranslations;
const fixSourceInconsistencies = (directory, cacheDir) => {
    const files = (0, exports.loadTranslations)(directory).filter((f) => f.type === 'natural');
    for (const file of files) {
        const fixedContent = Object.keys(file.content).reduce((acc, cur) => ({ ...acc, [cur]: cur }), {});
        fs.writeFileSync(path.resolve(directory, file.name), JSON.stringify(fixedContent, null, 2) + '\n');
        fs.writeFileSync(path.resolve(cacheDir, file.name), JSON.stringify(fixedContent, null, 2) + '\n');
    }
};
exports.fixSourceInconsistencies = fixSourceInconsistencies;
const evaluateFilePath = (directory, dirStructure, lang) => {
    switch (dirStructure) {
        case 'default':
            return path.resolve(directory, lang);
        case 'ngx-translate':
            return path.resolve(directory);
    }
};
exports.evaluateFilePath = evaluateFilePath;
