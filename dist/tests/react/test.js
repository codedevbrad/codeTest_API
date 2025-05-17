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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformCodeToCommonJS = transformCodeToCommonJS;
exports.default = runReactTests;
// src/utils/runReactTests.ts
const vm_1 = __importDefault(require("vm"));
const jsdom_1 = require("jsdom");
const react_1 = __importDefault(require("react"));
const server_1 = __importDefault(require("react-dom/server"));
const babel = __importStar(require("@babel/core"));
function transformCodeToCommonJS(code) {
    const { code: transpiled } = babel.transformSync(code, {
        presets: ['@babel/preset-env', '@babel/preset-react'],
        plugins: ['@babel/plugin-transform-modules-commonjs'], // 👈 Converts import/export to CommonJS
        filename: 'student.jsx',
    });
    return transpiled;
}
function runReactTests(code, testCases, globalValidations) {
    const sandbox = {
        module: { exports: {} },
        exports: {},
        require,
        console,
        React: react_1.default,
    };
    vm_1.default.createContext(sandbox);
    const transpiledCode = transformCodeToCommonJS(code);
    vm_1.default.runInContext(transpiledCode, sandbox);
    const Component = sandbox.module.exports.default || sandbox.exports.default;
    if (typeof Component !== 'function') {
        throw new Error('Submitted code does not export a valid React component.');
    }
    const results = testCases.map((testCase, index) => {
        const props = testCase.props;
        const element = react_1.default.createElement(Component, props);
        const html = server_1.default.renderToStaticMarkup(element);
        const dom = new jsdom_1.JSDOM(html);
        const { document } = dom.window;
        const passedValidations = [];
        // Merge global validations with per-test overrides
        const validations = {
            ...globalValidations,
            ...testCase.validations,
        };
        console.log(`\n--- 🧪 React Test #${index + 1} ---`);
        console.log("📦 Props:", JSON.stringify(props, null, 2));
        console.log("🧾 Rendered HTML:\n", html);
        // Tag Validations
        if (validations.tags) {
            validations.tags.forEach((tagItem) => {
                const tag = typeof tagItem === "string" ? tagItem : tagItem.tag;
                const expectedToPass = typeof tagItem === "string" ? true : tagItem.expectedToPass !== false;
                const found = !!document.querySelector(tag);
                const passed = found === expectedToPass;
                passedValidations.push({
                    type: "tag",
                    tag,
                    found,
                    expectedToPass,
                    passed,
                });
                console.log(`🔖 Tag <${tag}> expected: ${expectedToPass} → found: ${found} → ${passed ? "✅" : "❌"}`);
            });
        }
        // Text Validations
        if (validations.includesText) {
            validations.includesText.forEach((textItem) => {
                const text = typeof textItem === "string" ? textItem : textItem.text;
                const expectedToPass = typeof textItem === "string" ? true : textItem.expectedToPass !== false;
                const found = html.includes(text);
                const passed = found === expectedToPass;
                passedValidations.push({
                    type: "text",
                    text,
                    found,
                    expectedToPass,
                    passed,
                });
                console.log(`🔤 Text "${text}" expected: ${expectedToPass} → found: ${found} → ${passed ? "✅" : "❌"}`);
            });
        }
        // Prop Type Validations (always from global only)
        if (globalValidations.props) {
            globalValidations.props.forEach((expectedProp) => {
                const actual = props[expectedProp.name];
                const actualType = typeof actual;
                const passed = actualType === expectedProp.type;
                passedValidations.push({
                    type: "propType",
                    name: expectedProp.name,
                    expected: expectedProp.type,
                    actual: actualType,
                    passed,
                });
                console.log(`🔧 Prop "${expectedProp.name}" type check: expected ${expectedProp.type}, got ${actualType} → ${passed ? "✅" : "❌"}`);
            });
        }
        const testPassed = passedValidations.every((v) => v.passed);
        console.log(testPassed ? "✅ Test Passed" : "❌ Test Failed");
        return {
            props,
            html,
            validations: passedValidations,
            passed: testPassed,
        };
    });
    const overallPassed = results.every((r) => r.passed);
    console.log("\n🎓 Final Result:", overallPassed ? "✅ All tests passed!" : "❌ Some tests failed.");
    return {
        overallPassed,
        results,
    };
}
