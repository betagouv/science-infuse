"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reInsertInterpolations = exports.replaceInterpolations = exports.matcherMap = exports.matchNothing = exports.xmlStyleReplacer = void 0;
const icu_1 = require("./icu");
const i18next_1 = require("./i18next");
const sprintf_1 = require("./sprintf");
const xmlStyleReplacer = (index) => `<span translate="no">${index}</span>`;
exports.xmlStyleReplacer = xmlStyleReplacer;
const matchNothing = () => [];
exports.matchNothing = matchNothing;
exports.matcherMap = {
    none: exports.matchNothing,
    icu: icu_1.matchIcu,
    i18next: i18next_1.matchI18Next,
    sprintf: sprintf_1.matchSprintf,
};
const replaceInterpolations = (input, matcher = exports.matchNothing, replacer = exports.xmlStyleReplacer) => {
    const replacements = matcher(input, replacer);
    const clean = replacements.reduce((acc, cur) => acc.replace(cur.from, cur.to), input);
    return { clean, replacements };
};
exports.replaceInterpolations = replaceInterpolations;
const reInsertInterpolations = (clean, replacements) => replacements.reduce((acc, cur) => acc.replace(cur.to, cur.from), clean);
exports.reInsertInterpolations = reInsertInterpolations;
