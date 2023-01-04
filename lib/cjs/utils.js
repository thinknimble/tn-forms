"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldGetter = exports.isNumberOrFloat = exports.isNumber = exports.notNullOrUndefined = void 0;
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
