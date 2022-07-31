import * as EmailValidatorObj from 'email-validator';
import { DateTime } from 'luxon';
export default class Validator {
    /**
     * Crete an instance of the validator.
     * @param {string} message - The error message to return if validation fails.
     * @param {string} code - The code to return with the thrown Error if validation fails.
     */
    constructor({ message = 'Invalid value', code = 'invalid' } = {}) {
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
export class NumberValidator extends Validator {
    constructor({ message = 'Value must be a number', code = 'invalid' } = {}) {
        super({ message, code });
    }
    call(value) {
        if (!notNullOrUndefined(value) || !Number.isInteger(parseFloat(value))) {
            throw new Error(JSON.stringify({ code: this.code, message: this.message }));
        }
    }
}
export class MustMatchValidator extends Validator {
    constructor({ message = 'Value must match', code = 'mustMatch', matcher = null, form = null, } = {}) {
        super({ message, code });
        this.matcher = matcher;
        if (form) {
            this._matchingField = form.field[this.matcher];
        }
        else {
            this._matchingField = null;
        }
    }
    get matchingVal() {
        return this._matchingField ? this._matchingField.value : null;
    }
    call(value) {
        //this.matchingVal = extraArgs
        if (this.matchingVal !== value) {
            throw new Error(JSON.stringify({ code: this.code, message: this.message }));
        }
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
export class EmailValidator extends Validator {
    constructor({ message = 'Please Enter a Valid Email', code = 'invalidEmail' } = {}) {
        super({ message, code });
    }
    call(value) {
        try {
            const res = EmailValidatorObj.validate(value);
            if (!res) {
                throw new Error(JSON.stringify({ code: this.code, message: this.message }));
            }
        }
        catch (_a) {
            throw new Error(JSON.stringify({ code: this.code, message: this.message }));
        }
    }
}
export class MinDateValidator extends Validator {
    constructor({ message = 'Must meet minimum date', code = 'minDate', min = DateTime.local(new Date()), } = {}) {
        super({ message, code });
        this.min = min;
    }
    call(value) {
        if (!value) {
            throw new Error(JSON.stringify({
                code: this.code,
                message: `Please enter a valid date`,
            }));
        }
        let min = null;
        let compare = null;
        try {
            min = DateTime.local(this.min);
        }
        catch (e) {
            console.log(e);
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date for the minimum' }));
        }
        try {
            compare = DateTime.local(value);
        }
        catch (e) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date' }));
        }
        if (!min || !min.isValid) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date for the maximum' }));
        }
        if (!compare || !compare.isValid) {
            console.log('compare', compare);
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date' }));
        }
        if (compare.startOf('day') < min.startOf('day')) {
            throw new Error(JSON.stringify({
                code: this.code,
                message: `Please enter a date greater than ${DateTime.local(min).toFormat('D')}`,
            }));
        }
    }
}
export class MaxDateValidator extends Validator {
    constructor({ message = 'Must meet minimum date', code = 'maxDate', max = DateTime.local(new Date()), } = {}) {
        super({ message, code });
        this.max = max;
    }
    call(value) {
        if (!value) {
            throw new Error(JSON.stringify({
                code: this.code,
                message: `Please enter a valid date`,
            }));
        }
        let max = null;
        let compare = null;
        try {
            max = DateTime.local(this.max);
        }
        catch (e) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date for the maximum' }));
        }
        try {
            compare = DateTime.local(value);
        }
        catch (e) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date' }));
        }
        if (!max || !max.isValid) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date for the maximum' }));
        }
        if (!compare || !compare.isValid) {
            console.log('compare', compare);
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date' }));
        }
        if (DateTime.local(value).startOf('day') > DateTime.local(this.max).startOf('day')) {
            throw new Error(JSON.stringify({
                code: this.code,
                message: `Please enter a date greater than ${DateTime.local(this.max).toFormat('D')}`,
            }));
        }
    }
}
export class MinimumValueValidator extends Validator {
    constructor({ message = 'Must meet minimum value', code = 'invalidMinValue', min = 0 } = {}) {
        super({ message, code });
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
    constructor({ message = 'Must meet minimum value', code = 'invalidMaxValue', max = 10 } = {}) {
        super({ message, code });
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
    constructor({ message = 'Value does not match pattern', code = 'invalidPattern', pattern = '', } = {}) {
        super({ message, code });
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
    constructor({ message = 'Please enter a valid url', code = 'invalidUrl' } = {}) {
        let pattern = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?$/;
        super({ message, code, pattern });
    }
}
export function notNullOrUndefined(value) {
    return value !== null && typeof value !== 'undefined';
}
export function isNumber(message = 'Value must be a number') {
    return function (value) {
        if (!Number.isInteger(value)) {
            throw new Error(message);
        }
    };
}
export function isNumberOrFloat(value) {
    let val = Number(value);
    return typeof Number(val) == 'number' && !isNaN(val);
}
