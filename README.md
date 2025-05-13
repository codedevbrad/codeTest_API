# 🧪 codeTest\_API

A sandboxed API system for grading JavaScript functions and React components.
Designed for use in bootcamps, learning platforms, and automated assessments.

---

## 📦 Features

* 🔐 Secure VM-based execution
* 🧠 Auto-detects exported functions
* ⚛️ Validates React components via SSR
* ✅ Supports multiple test case types
* 📊 Detailed pass/fail breakdowns

---

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://god.gw.postman.com/run-collection/26546434-10114a3a-e3ae-4bd9-b82e-da7b09b13921?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D26546434-10114a3a-e3ae-4bd9-b82e-da7b09b13921%26entityType%3Dcollection%26workspaceId%3Db69cebcc-6cbf-4e00-8cbd-9db4089513ed)

## 📁 Routes Overview

| Endpoint       | Method | Purpose                           |
| -------------- | ------ | --------------------------------- |
| `/grade/js`    | POST   | Grade a plain JavaScript function |
| `/grade/react` | POST   | Grade a React component rendering |

Each use case involves:

* Submitting `code` and test structure
* Executing it in a secure VM
* Returning JSON with grading results (success, detailed test breakdown, and error messages if any)

---

<details>
<summary><strong>🔧 JavaScript Grading (`/grade/js`)</strong></summary>

### 📅 Purpose

Grading vanilla or TypeScript JavaScript functions. The system auto-detects the first defined function in the code block and evaluates it against structured test cases.

### 🧪 Tech Stack Used

| Tool           | Purpose                            |
| -------------- | ---------------------------------- |
| `@babel/core`  | Transpile submitted JS to CommonJS |
| `vm` (Node.js) | Execute code safely in a sandbox   |
| TypeScript     | Define request/response contracts  |

### 📥 Request Body

```ts
interface GradeRequestBody {
  code: string;
  tests: RawTestCase[];
}

interface RawTestCase {
  args: Argument[];
  expected: Expected;
}

interface Argument {
  value: string;
  type: ExpectedType;
}

interface Expected {
  value: string;
  type: ExpectedType;
}

type ExpectedType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "null"
  | "undefined";
```

### 📄 Example Request

```json
{
    "code": "function addNumbers(a, b) {\n  return a + b;\n}",
    "tests": [
        {
            "args": [
                {
                    "value": "2",
                    "type": "number"
                },
                {
                    "value": "3",
                    "type": "number"
                }
            ],
            "expected": {
                "value": "5",
                "type": "number"
            }
        },
        {
            "args": [
                {
                    "value": "-1",
                    "type": "number"
                },
                {
                    "value": "1",
                    "type": "number"
                }
            ],
            "expected": {
                "value": "0",
                "type": "number"
            }
        },
        {
            "args": [
                {
                    "value": "0",
                    "type": "number"
                },
                {
                    "value": "0",
                    "type": "number"
                }
            ],
            "expected": {
                "value": "0",
                "type": "number"
            }
        }
    ]
}
```

📝 **Explanation**:

* The function `multiply` is extracted and run with `3` and `4`.
* Expected output is `12`.
* The API returns pass/fail and the actual result.

### ✅ Response

```ts
{
    "success": true,
    "message": "All tests passed!",
    "results": [
        {
            "test": "Test #1",
            "input": [
                {
                    "value": 2,
                    "type": "number"
                },
                {
                    "value": 3,
                    "type": "number"
                }
            ],
            "expected": {
                "value": 5,
                "type": "number"
            },
            "output": 5,
            "passed": true
        },
        {
            "test": "Test #2",
            "input": [
                {
                    "value": -1,
                    "type": "number"
                },
                {
                    "value": 1,
                    "type": "number"
                }
            ],
            "expected": {
                "value": 0,
                "type": "number"
            },
            "output": 0,
            "passed": true
        },
        {
            "test": "Test #3",
            "input": [
                {
                    "value": 0,
                    "type": "number"
                },
                {
                    "value": 0,
                    "type": "number"
                }
            ],
            "expected": {
                "value": 0,
                "type": "number"
            },
            "output": 0,
            "passed": true
        }
    ]
}
```

</details>

---

<details>
<summary><strong>⚛️ React Grading (`/grade/react`)</strong></summary>

### 📅 Purpose

Evaluates a submitted React component by rendering it with given props and checking for:

* HTML tags
* Presence of text
* Prop type validity

### 🧪 Tech Stack Used

| Tool                         | Purpose                                   |
| ---------------------------- | ----------------------------------------- |
| `@babel/core`                | Transpile JSX and ES6 to CommonJS         |
| `react` & `react-dom/server` | Render component to static HTML           |
| `jsdom`                      | Parse and inspect rendered HTML in memory |
| `vm` (Node.js)               | Safe execution of compiled React code     |
| TypeScript                   | Type-checking and interfaces              |

### 📥 Request Body

```ts
export interface TagValidation {
    tag: string;
    expectedToPass?: boolean; // defaults to true if omitted
}

export interface TextValidation {
    text: string;
    expectedToPass?: boolean; // defaults to true if omitted
}

export interface PropTypeValidation {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'undefined' | 'function';
}

export interface TestValidations {
    tags?: (string | TagValidation)[];
    includesText?: (string | TextValidation)[];
}

export interface GlobalValidations extends TestValidations {
    props?: PropTypeValidation[];
}

export interface TestCase {
    props: Record<string, any>;
    validations?: TestValidations;
}

export interface ReactTestSuite {
    title: string;
    testCases: TestCase[];
    validations?: GlobalValidations;
}
```

### 📄 Example Request

```json

{
  "code": "import React from 'react';\n\nexport default function ConditionalMessage({ show }) {\n  return (\n    <div>\n      {show && <p>You can see me!</p>}\n    </div>\n  );\n}",
  "tests": {
    "tests": [
      {
        "props": { "show": true },
        "validations": {
          "tags": [
            { "tag": "p", "expectedToPass": true }
          ],
          "includesText": [
            { "text": "You can see me!", "expectedToPass": true }
          ]
        }
      },
      {
        "props": { "show": false },
        "validations": {
          "tags": [
            { "tag": "p", "expectedToPass": false }
          ],
          "includesText": [
            { "text": "You can see me!", "expectedToPass": false }
          ]
        }
      }
    ],
    "validations": {
      "props": [
        { "name": "show", "type": "boolean" }
      ]
    }
  }
}
```

📝 **Explanation**:

* Component renders: `<p>Hello Brad!</p>`
* HTML is checked for presence of `<p>` and text `Hello Brad!`
* Also validates `name` prop is of type `string`
* Returns success and validation results

### ✅ Response

```ts
{
  "success": true,
  "message": "",
  "results": [
    {
      "props": { "show": true },
      "html": "<div><p>You can see me!</p></div>",
      "validations": [
        {
          "type": "tag",
          "tag": "p",
          "found": true,
          "expectedToPass": true,
          "passed": true
        },
        {
          "type": "text",
          "text": "You can see me!",
          "found": true,
          "expectedToPass": true,
          "passed": true
        },
        {
          "type": "propType",
          "name": "show",
          "expected": "boolean",
          "actual": "boolean",
          "passed": true
        }
      ],
      "passed": true
    },
    {
      "props": { "show": false },
      "html": "<div></div>",
      "validations": [
        {
          "type": "tag",
          "tag": "p",
          "found": false,
          "expectedToPass": false,
          "passed": true
        },
        {
          "type": "text",
          "text": "You can see me!",
          "found": false,
          "expectedToPass": false,
          "passed": true
        },
        {
          "type": "propType",
          "name": "show",
          "expected": "boolean",
          "actual": "boolean",
          "passed": true
        }
      ],
      "passed": true
    }
  ]
}
```

</details>

------

## 📄 License

MIT License © [codedevbrad](https://github.com/codedevbrad)
