"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MustMatchValidator_matchingField;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlValidator = exports.PatternValidator = exports.MaximumValueValidator = exports.MinimumValueValidator = exports.MaxDateValidator = exports.MinDateValidator = exports.EmailValidator = exports.MustMatchValidator = exports.MinLengthValidator = exports.RequiredValidator = void 0;
const EmailValidatorObj = __importStar(require("email-validator"));
const luxon_1 = require("luxon");
const utils_1 = require("./utils");
class Validator {
    constructor({ message = 'Invalid value', code = 'invalid' } = {}) {
        /**
         * Crete an instance of the validator.
         * @param {string} message - The error message to return if validation fails.
         * @param {string} code - The code to return with the thrown Error if validation fails.
         */
        this.message = 'Invalid Value';
        this.code = 'invalid_validator';
        this.message = message;
        this.code = code;
    }
    /**
     * Perform validation on a given value.
     * @param {string|number|Array|Object} value - The error message to return if validation fails.
     */
    call(value) {
        throw new Error('Validator cannot be used directly, it must be overwritten in a subclass');
    }
}
exports.default = Validator;
class RequiredValidator extends Validator {
    constructor({ message = 'This is a required field', code = 'required' } = {}) {
        super({ message, code });
    }
    call(value) {
        if (!(0, utils_1.notNullOrUndefined)(value)) {
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
exports.RequiredValidator = RequiredValidator;
class MinLengthValidator extends Validator {
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
exports.MinLengthValidator = MinLengthValidator;
class MustMatchValidator extends Validator {
    constructor({ message = 'Value must match', code = 'mustMatch', matcher = '' } = {}) {
        super({ message, code });
        _MustMatchValidator_matchingField.set(this, void 0);
        this.matcher = matcher;
        // if (form) {
        //   this.#matchingField = form.field[this.matcher]
        // } else {
        //   this.#matchingField = null
        // }
    }
    setMatchingField(form) {
        console.log('testint field form ', form.value);
        if (this.matcher && form.field[this.matcher]) {
            __classPrivateFieldSet(this, _MustMatchValidator_matchingField, form.field[this.matcher], "f");
            return;
        }
        throw new Error('Matching Field does not exist on form');
    }
    get matchingVal() {
        return __classPrivateFieldGet(this, _MustMatchValidator_matchingField, "f") ? __classPrivateFieldGet(this, _MustMatchValidator_matchingField, "f").value : null;
    }
    call(value) {
        if (this.matchingVal !== value) {
            throw new Error(JSON.stringify({
                code: this.code,
                message: `${this.message}`,
            }));
        }
    }
}
exports.MustMatchValidator = MustMatchValidator;
_MustMatchValidator_matchingField = new WeakMap();
class EmailValidator extends Validator {
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
exports.EmailValidator = EmailValidator;
class MinDateValidator extends Validator {
    constructor({ message = 'Must meet minimum date', code = 'minDate', min = new Date() } = {}) {
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
        let min;
        let compare;
        try {
            min = luxon_1.DateTime.fromJSDate(this.min);
        }
        catch (e) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date for the minimum' }));
        }
        try {
            compare = luxon_1.DateTime.fromJSDate(value);
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
                message: `Please enter a date greater than ${luxon_1.DateTime.fromJSDate(min).toFormat('D')}`,
            }));
        }
    }
}
exports.MinDateValidator = MinDateValidator;
class MaxDateValidator extends Validator {
    constructor({ message = 'Must meet minimum date', code = 'maxDate', max = new Date() } = {}) {
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
        let max;
        let compare;
        try {
            max = luxon_1.DateTime.fromJSDate(this.max);
        }
        catch (e) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date for the maximum' }));
        }
        try {
            compare = luxon_1.DateTime.fromJSDate(value);
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
        if (luxon_1.DateTime.fromJSDate(value).startOf('day') > luxon_1.DateTime.fromJSDate(this.max).startOf('day')) {
            throw new Error(JSON.stringify({
                code: this.code,
                message: `Please enter a date greater than ${luxon_1.DateTime.fromJSDate(this.max).toFormat('D')}`,
            }));
        }
    }
}
exports.MaxDateValidator = MaxDateValidator;
class MinimumValueValidator extends Validator {
    constructor({ message = 'Must meet minimum value', code = 'invalidMinValue', min = 0 } = {}) {
        super({ message, code });
        this.min = min;
    }
    call(value) {
        if (!(0, utils_1.notNullOrUndefined)(value) || !(0, utils_1.isNumberOrFloat)(value)) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Number' }));
        }
        else {
            if (Number(value) < this.min) {
                throw new Error(JSON.stringify({ code: this.code, message: this.message }));
            }
        }
    }
}
exports.MinimumValueValidator = MinimumValueValidator;
class MaximumValueValidator extends Validator {
    constructor({ message = 'Must meet minimum value', code = 'invalidMaxValue', max = 10 } = {}) {
        super({ message, code });
        this.max = max;
    }
    call(value) {
        if (!(0, utils_1.notNullOrUndefined)(value) || !(0, utils_1.isNumberOrFloat)(value)) {
            throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Number' }));
        }
        else {
            if (Number(value) > this.max) {
                throw new Error(JSON.stringify({ code: this.code, message: this.message }));
            }
        }
    }
}
exports.MaximumValueValidator = MaximumValueValidator;
class PatternValidator extends Validator {
    constructor({ message = 'Value does not match pattern', code = 'invalidPattern', pattern = /./, } = {}) {
        super({ message, code });
        this.pattern = typeof pattern == 'string' ? new RegExp(pattern) : pattern;
    }
    call(value) {
        if (!(0, utils_1.notNullOrUndefined)(value)) {
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
exports.PatternValidator = PatternValidator;
class UrlValidator extends PatternValidator {
    constructor({ message = 'Please enter a valid url', code = 'invalidUrl' } = {}) {
        let pattern = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?$/;
        super({ message, code, pattern });
    }
}
exports.UrlValidator = UrlValidator;
