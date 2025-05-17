"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseValueByType = parseValueByType;
exports.convertTestCases = convertTestCases;
function parseValueByType(value, type) {
    try {
        switch (type) {
            case "number":
                return Number(value);
            case "boolean":
                return value === "true";
            case "array":
            case "object":
                return JSON.parse(value);
            case "string":
                return JSON.parse(value); // Parses quoted string like '"hello"'
            case "null":
                return null;
            case "undefined":
                return undefined;
            default:
                return value;
        }
    }
    catch {
        return value;
    }
}
function convertTestCases(rawCases) {
    return rawCases.map((test) => ({
        args: test.args.map((arg) => ({
            ...arg,
            value: parseValueByType(arg.value, arg.type),
        })),
        expected: {
            ...test.expected,
            value: parseValueByType(test.expected.value, test.expected.type),
        },
    }));
}
