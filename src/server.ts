const port = process.env.PORT || 5000;

import express, { Request, Response } from "express"
import cors from "cors"

import gradeFunction from "./tests/function/route"
import gradeReactComponent from "./tests/react/route"

// ==== Server Setup ====

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==== Grading Route ==== //

app.use( "/grade/js" , gradeFunction );
app.use( "/grade/react", gradeReactComponent );

// ==== Start Server ==== //

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});