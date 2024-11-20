"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DryRun = void 0;
const chalk_1 = __importDefault(require("chalk"));
class DryRun {
    name = 'Dry Run';
    async initialize() { }
    supportsLanguage() {
        return true;
    }
    async translateStrings(strings) {
        console.log();
        if (strings.length > 0) {
            console.log(`├─┌── Translatable strings:`);
            for (const { key, value } of strings) {
                console.log(`│ ├──── ${key !== value ? `(${key}) ` : ''}${value}`);
            }
            process.stdout.write((0, chalk_1.default) `│ └── {green.bold Done}`);
        }
        else {
            process.stdout.write((0, chalk_1.default) `│ └── {green.bold None}`);
        }
        return [];
    }
}
exports.DryRun = DryRun;
