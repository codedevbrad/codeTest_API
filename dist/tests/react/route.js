"use strict";
/*
    Basic Level...
    [x] Render a Button: Must render a <button> element with a specific label.
    [x] Render Props: Must render text passed via props.
    [x] Conditional Rendering: Show a message only if a prop show is true.
    [x] List Rendering: Render an array of items from props.

    Intermediate with user interaction ...
    * Controlled Input: Create an input that updates internal state and displays the value.
    * Counter: Button increases count stored in state.
    * Toggle Component: Click a button to show/hide a paragraph.
    * Todo List: Add/remove items from an array in state.

    Advanced...
    * Form with Validation: Shows errors when fields are empty.
    * Custom Hook Usage: Create and use a custom hook (like useToggle()).
    * Effect Challenge: Fetch data from an API (mocked) and render it.
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
    determine props ( value , type , name of ).
    determine state ( value , type , name of ).
    determine render items.
*/
const express_1 = __importDefault(require("express"));
const test_1 = __importDefault(require("./test")); // adjust path if needed
const functionRouter = express_1.default.Router();
functionRouter.post("/", (req, res) => {
    const { code, tests } = req.body;
    console.log('hit api');
    if (!code || !tests) {
        return res.status(400).json({ error: "Missing code or challenge." });
    }
    try {
        console.log('running test');
        const data = (0, test_1.default)(code, tests.tests, tests.validations);
        res.json({
            success: data.overallPassed,
            message: '',
            results: data.results
        });
    }
    catch (err) {
        console.error("Error running test cases:", err.message);
        res.status(500).json({
            error: "Failed to run test cases.",
            details: err.message,
        });
    }
});
exports.default = functionRouter;
