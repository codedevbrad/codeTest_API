
// src/utils/runReactTests.ts
import vm from 'vm';
import { JSDOM } from 'jsdom';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import * as babel from '@babel/core';


export function transformCodeToCommonJS(code: string): string {
  const { code: transpiled } = babel.transformSync(code, {
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: ['@babel/plugin-transform-modules-commonjs'], // 👈 Converts import/export to CommonJS
    filename: 'student.jsx',
  })!;
  return transpiled!;
}


export default function runReactTests(code: string, testCases: any[], globalValidations: any) {
  const sandbox: any = {
    module: { exports: {} },
    exports: {},
    require,
    console,
    React,
  };

  vm.createContext(sandbox);

  const transpiledCode = transformCodeToCommonJS(code);
  vm.runInContext(transpiledCode, sandbox);

  const Component = sandbox.module.exports.default || sandbox.exports.default;

  if (typeof Component !== 'function') {
    throw new Error('Submitted code does not export a valid React component.');
  }

  const results = testCases.map((testCase: any, index: number) => {
    const props = testCase.props;
    const element = React.createElement(Component, props);
    const html = ReactDOMServer.renderToStaticMarkup(element);

    const dom = new JSDOM(html);
    const { document } = dom.window;

    const passedValidations: any[] = [];

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
      validations.tags.forEach((tagItem: any) => {
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
      validations.includesText.forEach((textItem: any) => {
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
      globalValidations.props.forEach((expectedProp: any) => {
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

        console.log(
          `🔧 Prop "${expectedProp.name}" type check: expected ${expectedProp.type}, got ${actualType} → ${passed ? "✅" : "❌"}`
        );
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
