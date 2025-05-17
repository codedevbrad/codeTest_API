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
const express_1 = __importDefault(require("express"));
const core_1 = require("@babel/core");
const vm_1 = __importDefault(require("vm"));
const babelParser = __importStar(require("@babel/parser"));
const utils_1 = require("./utils");
const router = express_1.default.Router();
router.post("/", async (req, res) => {
    try {
        let { code, tests } = req.body;
        console.log("\n=========================");
        console.log("📥 Received code and tests for grading a function");
        console.log("=========================\n");
        // STEP 0: Try to auto-export the first declared function
        const ast = babelParser.parse(code, {
            sourceType: "module",
            plugins: ["jsx", "typescript"],
        });
        let firstFunctionName = null;
        (0, core_1.traverse)(ast, {
            FunctionDeclaration(path) {
                if (!firstFunctionName) {
                    firstFunctionName = path.node.id?.name ?? null;
                }
            },
            VariableDeclaration(path) {
                if (!firstFunctionName) {
                    const decl = path.node.declarations[0];
                    if (decl.id.type === "Identifier" &&
                        (decl.init?.type === "ArrowFunctionExpression" ||
                            decl.init?.type === "FunctionExpression")) {
                        firstFunctionName = decl.id.name;
                    }
                }
            },
        });
        if (!firstFunctionName) {
            throw new Error("No function declaration found in the submitted code.");
        }
        console.log(`✨ Detected function: ${firstFunctionName}`);
        code += `\n\nmodule.exports = { ${firstFunctionName} };`;
        // Step 1: Transpile the code
        const result = (0, core_1.transform)(code, {
            presets: ["@babel/preset-env"],
        });
        if (!result?.code) {
            throw new Error("Failed to transpile user code.");
        }
        const transpiled = result.code;
        // Step 2: Setup sandbox
        const sandbox = {
            module: { exports: {} },
            exports: {},
            console,
        };
        vm_1.default.createContext(sandbox);
        // Step 3: Run code inside sandbox
        new vm_1.default.Script(transpiled).runInContext(sandbox);
        const userExport = sandbox.module.exports || sandbox.exports;
        const exportedFuncName = Object.keys(userExport)[0];
        const userFunc = userExport[exportedFuncName];
        if (typeof userFunc !== "function") {
            throw new Error("No valid exported function found.");
        }
        console.log(`📦 Using exported function: ${exportedFuncName}\n`);
        // Step 4: Convert and run test cases
        const parsedTestCases = (0, utils_1.convertTestCases)(tests);
        const testResults = parsedTestCases.map((test, index) => {
            const testLabel = `Test #${index + 1}`;
            const { args, expected } = test;
            let output;
            let passed = false;
            let error;
            console.log(`--- 🧪 ${testLabel} ---`);
            console.log(`🔢 Input arguments:`, args.map((arg) => `${arg.type}: ${JSON.stringify(arg.value)}`));
            console.log(`🎯 Expected output: ${JSON.stringify(expected.value)} (${expected.type})`);
            try {
                const argValues = args.map((arg) => arg.value);
                output = userFunc(...argValues);
                passed = JSON.stringify(output) === JSON.stringify(expected.value);
                console.log(`📤 Actual output: ${JSON.stringify(output)}`);
                console.log(passed ? "✅ Test Passed" : "❌ Test Failed");
            }
            catch (err) {
                error = err.message || "Unknown error occurred";
                console.log("💥 Error during execution:", error);
            }
            if (!passed && !error) {
                console.log("🧠 Mismatch Explanation:");
                console.log(`→ Output:   ${JSON.stringify(output)}`);
                console.log(`→ Expected: ${JSON.stringify(expected.value)}\n`);
            }
            return {
                test: testLabel,
                input: args,
                expected,
                output,
                passed,
                error: error || undefined,
            };
        });
        const allPassed = testResults.every((t) => t.passed);
        console.log("\n🎓 Final Result:", allPassed ? "✅ All tests passed!" : "❌ Some tests failed.");
        if (allPassed) {
            const response = {
                success: true,
                message: "All tests passed!",
                results: testResults,
            };
            res.status(200).json(response);
        }
        else {
            const response = {
                success: false,
                message: "Some tests failed.",
                results: testResults,
            };
            res.status(200).json(response);
        }
    }
    catch (err) {
        console.error("❗ Server Error:", err.message || err);
        res.status(500).json({
            success: false,
            error: err.message || "Unexpected server error",
        });
    }
});
exports.default = router;
