"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomUuid = exports.fieldGetter = exports.isNumberOrFloat = exports.isNumber = exports.notNullOrUndefined = void 0;
const uuid_1 = require("uuid");
const expo_crypto_1 = require("expo-crypto");
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
const getRandomUuid = () => {
    try {
        return (0, uuid_1.v4)();
    }
    catch (_a) {
        //we're in react-native land
        return (0, expo_crypto_1.randomUUID)();
    }
};
exports.getRandomUuid = getRandomUuid;
