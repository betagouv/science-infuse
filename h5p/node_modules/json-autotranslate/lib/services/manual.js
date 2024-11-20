"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualTranslation = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const matchers_1 = require("../matchers");
class ManualTranslation {
    interpolationMatcher;
    name = 'Manual Translation';
    async initialize(config, interpolationMatcher) {
        this.interpolationMatcher = interpolationMatcher;
    }
    supportsLanguage() {
        return true;
    }
    async translateStrings(strings, from, to) {
        const results = [];
        if (strings.length === 0) {
            return [];
        }
        console.log();
        console.log(`├─┌── Translatable strings:`);
        for (const { key, value } of strings) {
            const { replacements } = (0, matchers_1.replaceInterpolations)(value, this.interpolationMatcher);
            process.stdout.write('│ ├── ');
            const result = await inquirer_1.default.prompt([
                {
                    name: 'result',
                    message: `[${from} -> ${to}] ${key !== value ? `(${key}) ` : ''}"${value}":`,
                },
            ]);
            results.push({
                key,
                value,
                translated: (0, matchers_1.reInsertInterpolations)(result.result, replacements),
            });
        }
        process.stdout.write(`│ └── Done`);
        return results;
    }
}
exports.ManualTranslation = ManualTranslation;
