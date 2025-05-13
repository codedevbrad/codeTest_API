## Tasks 

    [x] setup a basic endpoint to test that a user submitted code is correct.

    [ ] create a way to determine the many code tasks we have / what task the 
        student is attempting / the task data / outcome. 

    [ ] setup a docker file for the api.

    [ ] deploy the dokerised container.



# 🧠 `runReactTests.ts` — Technical Summary

## 🧰 What This Utility Does

The `runReactTests` function is a test runner designed to:

- 🔒 Safely execute submitted **React component code** inside a `vm` sandbox
- 🧪 **Render the component** using `ReactDOMServer.renderToStaticMarkup`
- ✅ Apply **validation logic** to the resulting HTML
- 📦 Return detailed, structured **test results** including pass/fail summaries


## ✅ Major Features & Iterations Added

### 1. Safe Execution with `vm`

- Uses `vm.createContext()` to sandbox untrusted student code
- Transpiles JSX & ESModules → CommonJS with Babel so it works in the VM

### 2. Server-Side Rendering with `ReactDOMServer`

- Renders React components to **static HTML**
- Simulates browser DOM with `jsdom` for querying tags/text

### 3. Global & Per-Test Validations

- 🔄 Global validations apply to all tests (e.g., prop type checks)
- 🧪 Each test case can override validations for granular logic

### 4. Validation Types

| Type            | What It Does                                             |
|-----------------|----------------------------------------------------------|
| `tags`          | Checks for presence or absence of specific HTML tags     |
| `includesText`  | Checks for expected or forbidden text content            |
| `props`         | Validates prop **types** passed into the component       |

### 5. Per-Validation `expectedToPass` Support ✅

You can now define expectations on a **per-validation basis**, like so:

```json
"tags": [
  { "tag": "p", "expectedToPass": false }
],
"includesText": [
  { "text": "You can see me!", "expectedToPass": false }
]

## example 

```json
{
  "code": "import React from 'react';\n\nexport default function ConditionalMessage({ show }) {\n  return (\n    <div>\n      {show && <p>You can see me!</p>}\n    </div>\n  );\n}",
  "tests": {
    "title": "Conditional Rendering: Show message only if prop 'show' is true",
    "testCases": [
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


| Test # | `props`           | Tag Validation                | Text Validation                        | Expected Result |
|--------|-------------------|-------------------------------|----------------------------------------|-----------------|
| 1      | `{ show: true }`  | `<p>` should be rendered ✅    | `"You can see me!"` should be present ✅ | ✅ Pass    |
| 2      | `{ show: false }` | `<p>` should not be rendered ✅| `"You can see me!"` should not exist ✅ | ✅ Pass     |


