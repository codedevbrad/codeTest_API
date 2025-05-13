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
  "code": "function multiply(a, b) { return a * b; }",
  "tests": [
    {
      "args": [
        { "value": "3", "type": "number" },
        { "value": "4", "type": "number" }
      ],
      "expected": { "value": "12", "type": "number" }
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
interface GradeTestResult {
  test: string;
  input: Argument[];
  expected: Expected;
  output: any;
  passed: boolean;
  error?: string;
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
interface ReactTestSuite {
  code: string;
  tests: {
    tests: TestCase[];
    validations?: GlobalValidations;
  };
}
```

### 📄 Example Request

```json
{
  "code": "export default function Greet({ name }) { return <p>Hello {name}!</p>; }",
  "tests": {
    "tests": [
      {
        "props": { "name": "Brad" },
        "validations": {
          "includesText": ["Hello Brad!"]
        }
      }
    ],
    "validations": {
      "tags": ["p"],
      "props": [
        { "name": "name", "type": "string" }
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
interface ReactTestResult {
  props: Record<string, any>;
  html: string;
  validations: {
    type: "tag" | "text" | "propType";
    passed: boolean;
    [key: string]: any;
  }[];
  passed: boolean;
}
```

</details>

------

## 🚀 Running Locally

```bash
# install dependencies
npm install

# start development server
npm run dev

# or with ts-node
npx ts-node src/index.ts
```

---

## 📄 License

MIT License © [codedevbrad](https://github.com/codedevbrad)
