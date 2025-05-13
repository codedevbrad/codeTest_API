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
