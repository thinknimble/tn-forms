import { IValidator, IForm } from './interfaces';
export default class Validator<T = any> implements IValidator<T> {
    /**
     * Crete an instance of the validator.
     * @param {string} message - The error message to return if validation fails.
     * @param {string} code - The code to return with the thrown Error if validation fails.
     */
    message: string;
    code: string;
    constructor({ message, code }?: {
        message?: string | undefined;
        code?: string | undefined;
    });
    /**
     * Perform validation on a given value.
     * @param {string|number|Array|Object} value - The error message to return if validation fails.
     */
    call(value: T): void;
}
export declare class RequiredValidator extends Validator {
    constructor({ message, code }?: {
        message?: string | undefined;
        code?: string | undefined;
    });
    call(value: any): void;
}
export declare class MinLengthValidator extends Validator {
    minLength: number;
    constructor({ message, code, minLength, }?: {
        message?: string | undefined;
        code?: string | undefined;
        minLength?: number | undefined;
    });
    call(value: any): void;
}
export declare class MustMatchValidator extends Validator {
    #private;
    matcher: string | null;
    constructor({ message, code, matcher }?: {
        message?: string | undefined;
        code?: string | undefined;
        matcher?: string | undefined;
    });
    setMatchingField(form: IForm<any>): void;
    get matchingVal(): any;
    call(value: any): void;
}
export declare class EmailValidator extends Validator {
    constructor({ message, code }?: {
        message?: string | undefined;
        code?: string | undefined;
    });
    call(value: any): void;
}
export declare class MinDateValidator extends Validator {
    min: any;
    constructor({ message, code, min }?: {
        message?: string | undefined;
        code?: string | undefined;
        min?: Date | undefined;
    });
    call(value: any): void;
}
export declare class MaxDateValidator extends Validator {
    max: any;
    constructor({ message, code, max }?: {
        message?: string | undefined;
        code?: string | undefined;
        max?: Date | undefined;
    });
    call(value: any): void;
}
export declare class MinimumValueValidator<integer> extends Validator<integer> {
    min: number;
    constructor({ message, code, min }?: {
        message?: string | undefined;
        code?: string | undefined;
        min?: number | undefined;
    });
    call(value: integer | null): void;
}
export declare class MaximumValueValidator extends Validator {
    max: number;
    constructor({ message, code, max }?: {
        message?: string | undefined;
        code?: string | undefined;
        max?: number | undefined;
    });
    call(value: any): void;
}
export declare class PatternValidator extends Validator {
    pattern: RegExp;
    constructor({ message, code, pattern, }?: {
        message?: string | undefined;
        code?: string | undefined;
        pattern?: RegExp | undefined;
    });
    call(value: any): void;
}
export declare class UrlValidator extends PatternValidator {
    constructor({ message, code }?: {
        message?: string | undefined;
        code?: string | undefined;
    });
}
//# sourceMappingURL=validators.d.ts.map