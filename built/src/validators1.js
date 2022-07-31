function notNullOrUndefined(value) {
    return value !== null && typeof value !== 'undefined';
}
export default class Validator {
    constructor({ message = 'Invalid value', code = 'invalid' } = {}) {
        /**
         * Crete an instance of the validator.
         * @param {string} message - The error message to return if validation fails.
         * @param {string} code - The code to return with the thrown Error if validation fails.
         */
        this.message = 'Invalid Value';
        this.code = 'invalid_validator';
        Object.assign(this, { message, code });
    }
    /**
     * Perform validation on a given value.
     * @param {string|number|Array|Object} value - The error message to return if validation fails.
     */
    call(value) {
        throw new Error('Validator cannot be used directly, it must be overwritten in a subclass');
    }
}
export class RequiredValidator extends Validator {
    constructor({ message = 'This is a required field', code = 'required' } = {}) {
        super({ message, code });
    }
    call(value) {
        if (!notNullOrUndefined(value)) {
            throw new Error(JSON.stringify({ code: this.code, message: this.message }));
        }
        else if (Array.isArray(value) && !value.length) {
            throw new Error(JSON.stringify({ code: this.code, message: this.message }));
        }
        else if (!value.toString().length) {
            throw new Error(JSON.stringify({ code: this.code, message: this.message }));
        }
    }
}
export class MinLengthValidator extends Validator {
    constructor({ message = 'Must meet minimum length requirements', code = 'minLength', minLength = 10, } = {}) {
        super({ message, code });
        this.minLength = minLength;
    }
    call(value) {
        new RequiredValidator({ message: this.message, code: this.code }).call(value);
        if (!value || value.toString().length < this.minLength) {
            throw new Error(JSON.stringify({ code: this.code, message: this.message }));
        }
    }
}
