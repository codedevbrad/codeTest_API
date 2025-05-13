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

/*
    determine props ( value , type , name of ).
    determine state ( value , type , name of ).
    determine render items.
*/

import express from "express";
import runReactTests from "./test"; // adjust path if needed

const functionRouter: express.Router = express.Router();

functionRouter.post("/", (req: any, res: any) => {
    const { code , tests } = req.body;
    console.log('hit api');
    if (!code || !tests) {
      return res.status(400).json({ error: "Missing code or challenge." });
    }

    try {
      console.log('running test');
      const data = runReactTests(
        code, 
        tests.tests, 
        tests.validations
      );

      res.json({
          success: data.overallPassed, 
          message: '',
          results: data.results
      });
    } 
    catch (err: any) {
      console.error("Error running test cases:", err.message);
      res.status(500).json({
        error: "Failed to run test cases.",
        details: err.message,
      });
    }
});

export default functionRouter;