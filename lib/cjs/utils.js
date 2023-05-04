"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFormField = exports.isFormArray = exports.fieldGetter = exports.isNumberOrFloat = exports.isNumber = exports.notNullOrUndefined = void 0;
const _1 = require(".");
function notNullOrUndefined(value) {
    return value !== null && typeof value !== 'undefined';
}
exports.notNullOrUndefined = notNullOrUndefined;
function isNumber(message = 'Value must be a number') {
    return function (value) {
        if (!Number.isInteger(value)) {
            throw new Error(message);
        }
    };
}
exports.isNumber = isNumber;
function isNumberOrFloat(value) {
    let val = Number(value);
    return typeof Number(val) == 'number' && !isNaN(val);
}
exports.isNumberOrFloat = isNumberOrFloat;
function fieldGetter(form, name) {
    return form.field[name];
}
exports.fieldGetter = fieldGetter;
const isFormArray = (input) => {
    return input instanceof _1.FormArray;
};
exports.isFormArray = isFormArray;
const isFormField = (input) => {
    return input instanceof _1.FormField;
};
exports.isFormField = isFormField;
