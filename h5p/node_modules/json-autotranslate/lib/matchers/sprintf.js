"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchSprintf = void 0;
const matchSprintf = (input, replacer) => {
    const matches = input.match(/(%.)/g);
    return (matches || []).map((match, index) => ({
        from: match,
        to: replacer(index),
    }));
};
exports.matchSprintf = matchSprintf;
