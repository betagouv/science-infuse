"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchI18Next = void 0;
const matchI18Next = (input, replacer) => {
    const matches = input.match(/(\{\{.+?\}\}|\$t\(.+?\)|\$\{.+?\})/g);
    return (matches || []).map((match, index) => ({
        from: match,
        to: replacer(index),
    }));
};
exports.matchI18Next = matchI18Next;
