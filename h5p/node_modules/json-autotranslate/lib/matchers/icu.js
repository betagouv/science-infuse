"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchIcu = void 0;
const messageformat_parser_1 = require("messageformat-parser");
const matchIcu = (input, replacer) => {
    const writeTokens = (part) => {
        if (typeof part !== 'string' && part?.cases?.length) {
            return part.cases
                .map((partCase) => {
                return partCase.tokens.length
                    ? `(.*)${nestedIcuMatcher(partCase.tokens)}(.*)`
                    : '';
            })
                .join('');
        }
        else {
            return '(.*)';
        }
    };
    const nestedIcuMatcher = (parts) => {
        return (parts
            .map((part) => typeof part === 'string'
            ? part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            : writeTokens(part))
            .join('')
            // reduce replacement noise between replacements from nested tokens i.e. back to back (.*)(.*)
            .replace(/(\(\.\*\)){2,}/g, '(.*)'));
    };
    const parts = (0, messageformat_parser_1.parse)(input);
    const regex = new RegExp(nestedIcuMatcher(parts));
    const matches = input.match(regex);
    return (matches || []).slice(1).map((match, index) => ({
        from: match,
        to: replacer(index),
    }));
};
exports.matchIcu = matchIcu;
