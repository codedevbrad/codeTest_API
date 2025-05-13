// ==== REQ Types ====

export type ExpectedType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "null"
  | "undefined";

export interface Argument {
  value: string;
  type: ExpectedType;
}

export interface Expected {
  value: string;
  type: ExpectedType;
}

export interface RawTestCase {
  args: Argument[];
  expected: Expected;
}

export interface ParsedTestCase {
  args: { value: any; type: ExpectedType }[];
  expected: { value: any; type: ExpectedType };
}

export interface GradeRequestBody {
  code: string;
  tests: RawTestCase[];
}

// ==== Response Types ====

export interface GradeTestResult {
  test: string;
  input: { value: any; type: ExpectedType }[];
  expected: { value: any; type: ExpectedType };
  output: any;
  passed: boolean;
  error?: string;
}

export interface GradeSuccessResponse {
  success: true;
  message: string;
  results: GradeTestResult[];
}

export interface GradeFailureResponse {
  success: false;
  message: string;
  results: GradeTestResult[];
}

export interface GradeErrorResponse {
  success: false;
  error: string;
}

export type GradeResponse =
  | GradeSuccessResponse
  | GradeFailureResponse
  | GradeErrorResponse;
