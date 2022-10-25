import { IValidator } from './interfaces';
export default class Validator implements IValidator {
    /**
     * Crete an instance of the validator.
     * @param {string} message - The error message to return if validation fails.
     * @param {string} code - The code to return with the thrown Error if validation fails.
     */
    message: string;
    code: string;
    constructor({ message, code }?: {
        message?: string;
        code?: string;
    });
    /**
     * Perform validation on a given value.
     * @param {string|number|Array|Object} value - The error message to return if validation fails.
     */
    call(value: any): void;
}
export declare class RequiredValidator extends Validator {
    constructor({ message, code }?: {
        message?: string;
        code?: string;
    });
    call(value: any): void;
}
export declare class MinLengthValidator extends Validator {
    minLength: number;
    constructor({ message, code, minLength, }?: {
        message?: string;
        code?: string;
        minLength?: number;
    });
    call(value: any): void;
}
export declare class MustMatchValidator extends Validator {
    #private;
    matcher: string;
    constructor({ message, code, matcher, form, }?: {
        message?: string;
        code?: string;
        matcher?: any;
        form?: any;
    });
    get matchingVal(): any;
    call(value: any): void;
}
export declare class EmailValidator extends Validator {
    constructor({ message, code }?: {
        message?: string;
        code?: string;
    });
    call(value: any): void;
}
export declare class MinDateValidator extends Validator {
    min: any;
    constructor({ message, code, min }?: {
        message?: string;
        code?: string;
        min?: Date;
    });
    call(value: any): void;
}
export declare class MaxDateValidator extends Validator {
    max: any;
    constructor({ message, code, max }?: {
        message?: string;
        code?: string;
        max?: Date;
    });
    call(value: any): void;
}
export declare class MinimumValueValidator extends Validator {
    min: number;
    constructor({ message, code, min }?: {
        message?: string;
        code?: string;
        min?: number;
    });
    call(value: any): void;
}
export declare class MaximumValueValidator extends Validator {
    max: number;
    constructor({ message, code, max }?: {
        message?: string;
        code?: string;
        max?: number;
    });
    call(value: any): void;
}
export declare class PatternValidator extends Validator {
    pattern: RegExp;
    constructor({ message, code, pattern, }?: {
        message?: string;
        code?: string;
        pattern?: RegExp;
    });
    call(value: any): void;
}
export declare class UrlValidator extends PatternValidator {
    constructor({ message, code }?: {
        message?: string;
        code?: string;
    });
}
