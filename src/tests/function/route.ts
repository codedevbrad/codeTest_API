import express, { Request, Response } from "express";
import { GradeFailureResponse, GradeRequestBody, GradeResponse, GradeSuccessResponse } from "./types"
import { transform, traverse } from "@babel/core"
import vm from "vm"
import * as babelParser from "@babel/parser"
import { convertTestCases } from "./utils";
const router = express.Router();


router.post("/", async (req: Request<{}, {}, GradeRequestBody>, res: Response<GradeResponse>) => {
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
  
      let firstFunctionName: string | null = null;
  
      traverse(ast, {
        FunctionDeclaration(path) {
          if (!firstFunctionName) {
            firstFunctionName = path.node.id?.name ?? null;
          }
        },
        VariableDeclaration(path) {
          if (!firstFunctionName) {
            const decl = path.node.declarations[0];
            if (
              decl.id.type === "Identifier" &&
              (decl.init?.type === "ArrowFunctionExpression" ||
                decl.init?.type === "FunctionExpression")
            ) {
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
      const result = transform(code, {
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
  
      vm.createContext(sandbox);
  
      // Step 3: Run code inside sandbox
      new vm.Script(transpiled).runInContext(sandbox);
  
      const userExport = sandbox.module.exports || sandbox.exports;
  
      const exportedFuncName = Object.keys(userExport)[0];
      const userFunc = (userExport as Record<string, Function>)[exportedFuncName];
  
      if (typeof userFunc !== "function") {
        throw new Error("No valid exported function found.");
      }
  
      console.log(`📦 Using exported function: ${exportedFuncName}\n`);
  
      // Step 4: Convert and run test cases
      const parsedTestCases = convertTestCases(tests);
  
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
        } catch (err: any) {
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
        const response: GradeSuccessResponse = {
          success: true,
          message: "All tests passed!",
          results: testResults,
        };
        res.status(200).json(response);
      } 
      else {
        const response: GradeFailureResponse = {
          success: false,
          message: "Some tests failed.",
          results: testResults,
        };
        res.status(200).json(response);
      }
      
    } 
    catch (err: any) {
      console.error("❗ Server Error:", err.message || err);
      res.status(500).json({
        success: false,
        error: err.message || "Unexpected server error",
      });
    }
  });
  
export default router;