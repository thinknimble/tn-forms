import * as EmailValidatorObj from 'email-validator';
import { DateTime } from 'luxon';
import { notNullOrUndefined, isNumberOrFloat } from './utils';
export default class Validator {
    /**
     * Crete an instance of the validator.
     * @param {string} message - The error message to return if validation fails.
     * @param {string} code - The code to return with the thrown Error if validation fails.
     */
    message = 'Invalid Value';
    code = 'invalid_validator';
    isRequired = true;
    constructor({ message = 'Invalid value', code = 'invalid', isRequired = true } = {}) {
        this.message = message;
        this.code = code;
        this.isRequired = isRequired;
    }
    get enableValidate() {
        return this.isRequired;
    }
    /**
     * Perform validation on a given value.
     * @param {string|number|Array|Object} value - The error message to return if validation fails.
     */
    call(value) {
        throw new Error('Validator cannot be used directly, it must be overwritten in a subclass');
    }
}
export class FormLevelValidator extends Validator {
    matcher;
    #matchingField;
    constructor({ message = 'Value must match', code = 'mustMatch', isRequired = true, matcher = '', } = {}) {
        super({ message, code, isRequired });
        this.matcher = matcher;
    }
    setMatchingField(form) {
        if (this.matcher && form.field[this.matcher]) {
            this.#matchingField = form.field[this.matcher];
            return;
        }
        throw new Error('Matching Field does not exist on form');
    }
    get matchingVal() {
        return this.#matchingField ? this.#matchingField.value : null;
    }
}
export class RequiredValidator extends Validator {
    constructor({ message = 'This is a required field', code = 'required', isRequired = true } = {}) {
        super({ message, code, isRequired });
    }
    call(value) {
        if (!this.enableValidate && !notNullOrUndefined(value)) {
            return;
        }
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
    minLength;
    constructor({ message = 'Must meet minimum length requirements', code = 'minLength', isRequired = true, minLength = 10, } = {}) {
        super({ message, code, isRequired });
        this.minLength = minLength;
    }
    call(value) {
        if (!this.enableValidate && !notNullOrUndefined(value)) {
            return;
        }
        new RequiredValidator({ message: this.message, code: this.code }).call(value);
        if (!value || value.toString().length < this.minLength) {
            throw new Error(JSON.stringify({ code: this.code, message: this.message }));
        }
    }
}
export class MustMatchValidator extends FormLevelValidator {
    call(value) {
        if (!this.enableValidate && !notNullOrUndefined(value)) {
            return;
        }
        if (this.matchingVal !== value) {
            throw new Error(JSON.stringify({
                code: this.code,
                message: `${this.message}`,
            }));
        }
    }
}
export class EmailValidator extends Validator {
    constructor({ message = 'Please Enter a Valid Email', code = 'invalidEmail', isRequired = true, } = {}) {
        super({ message, code, isRequired });
    }
    call(value) {
        if (!this.enableValidate && !notNullOrUndefined(value)) {
            return;
        }
        try {
            const res = EmailValidatorObj.validate(value);
            if (!res) {
                throw new Error(JSON.stringify({ code: this.code, message: this.message }));
            }
        }
        catch {
            throw new Error(JSON.stringify({ code: this.code, message: this.message }));
        }
    }
}
export class MinDateValidator extends Validator {
    min;
    constructor({ message = 'Must meet minimum date', code = 'minDate', isRequired = true, min = new Date(), } = {}) {
        super({ message, code, isRequired });
        this.min = min;
    }
    call(value) {
        if (!this.enableValidate && !notNullOrUndefined(value)) {
            return;
        }
        if (!value) {
            throw new Error(JSON.stringify({
                code: this.code,
                message: `Please enter a valid date`,
            }));
        }
        let min;
        let compare;
        try {
            min = DateTime.fromJSDate(this.min);
        }
        catch (e) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date for the minimum' }));
        }
        try {
            compare = DateTime.fromJSDate(value);
        }
        catch (e) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date' }));
        }
        if (!min || !min.isValid) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date for the maximum' }));
        }
        if (!compare || !compare.isValid) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date' }));
        }
        if (compare.startOf('day') < min.startOf('day')) {
            throw new Error(JSON.stringify({
                code: this.code,
                message: `Please enter a date greater than ${DateTime.fromJSDate(min).toFormat('D')}`,
            }));
        }
    }
}
export class MaxDateValidator extends Validator {
    max;
    constructor({ message = 'Must meet minimum date', code = 'maxDate', isRequired = true, max = new Date(), } = {}) {
        super({ message, code, isRequired });
        this.max = max;
    }
    call(value) {
        if (!this.enableValidate && !notNullOrUndefined(value)) {
            return;
        }
        if (!value) {
            throw new Error(JSON.stringify({
                code: this.code,
                message: `Please enter a valid date`,
            }));
        }
        let max;
        let compare;
        try {
            max = DateTime.fromJSDate(this.max);
        }
        catch (e) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date for the maximum' }));
        }
        try {
            compare = DateTime.fromJSDate(value);
        }
        catch (e) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date' }));
        }
        if (!max || !max.isValid) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date for the maximum' }));
        }
        if (!compare || !compare.isValid) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date' }));
        }
        if (DateTime.fromJSDate(value).startOf('day') > DateTime.fromJSDate(this.max).startOf('day')) {
            throw new Error(JSON.stringify({
                code: this.code,
                message: `Please enter a date greater than ${DateTime.fromJSDate(this.max).toFormat('D')}`,
            }));
        }
    }
}
export class MinimumValueValidator extends Validator {
    min;
    constructor({ message = 'Must meet minimum value', code = 'invalidMinValue', isRequired = true, min = 0, } = {}) {
        super({ message, code, isRequired });
        this.min = min;
    }
    call(value) {
        if (!notNullOrUndefined(value) || !isNumberOrFloat(value)) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Number' }));
        }
        else {
            if (Number(value) < this.min) {
                throw new Error(JSON.stringify({ code: this.code, message: this.message }));
            }
        }
    }
}
export class MaximumValueValidator extends Validator {
    max;
    constructor({ message = 'Must meet minimum value', code = 'invalidMaxValue', isRequired = true, max = 10, } = {}) {
        super({ message, code, isRequired });
        this.max = max;
    }
    call(value) {
        if (!notNullOrUndefined(value) || !isNumberOrFloat(value)) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Number' }));
        }
        else {
            if (Number(value) > this.max) {
                throw new Error(JSON.stringify({ code: this.code, message: this.message }));
            }
        }
    }
}
export class PatternValidator extends Validator {
    pattern;
    constructor({ message = 'Value does not match pattern', code = 'invalidPattern', isRequired = true, pattern = /./, } = {}) {
        super({ message, code, isRequired });
        this.pattern = typeof pattern == 'string' ? new RegExp(pattern) : pattern;
    }
    call(value) {
        if (!notNullOrUndefined(value)) {
            throw new Error(JSON.stringify({ code: this.code, message: this.message }));
        }
        else if (typeof value != 'string' && typeof value != 'number') {
            throw new Error(JSON.stringify({ code: this.code, message: this.message }));
        }
        else if (!this.pattern.test(value)) {
            throw new Error(JSON.stringify({ code: this.code, message: this.message }));
        }
    }
}
export class UrlValidator extends PatternValidator {
    constructor({ message = 'Please enter a valid url', code = 'invalidUrl', isRequired = true, } = {}) {
        let pattern = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?$/;
        super({ message, code, isRequired, pattern });
    }
}
export class TrueFalseValidator extends Validator {
    truthy;
    constructor({ message = 'Invalid option', code = 'invalidOption', isRequired = true, truthy = true, } = {}) {
        message = `Value should be ${truthy}`;
        super({ message, code, isRequired });
        this.truthy = truthy;
    }
    call(value) {
        if (!notNullOrUndefined(value)) {
            throw new Error(JSON.stringify({ code: this.code, message: this.message }));
        }
        else if (!!value !== this.truthy) {
            throw new Error(JSON.stringify({ code: this.code, message: this.message }));
        }
    }
}
