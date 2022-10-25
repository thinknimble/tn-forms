"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _FormField_value, _FormField_errors, _FormField_validators, _FormArray_groups, _FormArray_FormClass, _Form_fields, _Form_dynamicFormValidators, _Form_errors;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormArray = exports.FormField = void 0;
const uuid_1 = require("uuid");
function setFormFieldValueFromKwargs(name, field, valueFromKwarg = undefined) {
    field.value = valueFromKwarg != undefined ? valueFromKwarg : field.value;
    field.name = name;
    return field;
}
function setValidatorProps(form, validator, kwargs) {
    let props = {};
    for (const prop in validator) {
        props[prop] = validator[prop];
    }
    props['form'] = form;
    for (const [k, v] of Object.entries(kwargs)) {
        props[k] = v;
    }
    return validator.constructor(props);
}
function fields(fields) {
    let formArrays = [];
    let formFields = [];
    for (let i = 0; i < fields.length; i++) {
        fields[i] instanceof FormArray ? formArrays.push(fields[i]) : null;
        fields[i] instanceof FormField ? formFields.push(fields[i]) : null;
    }
    return {
        formArrays,
        formFields,
    };
}
class FormField {
    constructor({ name = '', validators = [], errors = [], value = '', placeholder = '', type = 'text', id = null, } = {}) {
        _FormField_value.set(this, null);
        _FormField_errors.set(this, []);
        _FormField_validators.set(this, []);
        this.name = '';
        this.placeholder = '';
        this.type = '';
        this.value = Array.isArray(value)
            ? [...value]
            : typeof value !== null && typeof value == 'object'
                ? Object.assign({}, value) : value;
        this.name = name ? name : (0, uuid_1.v4)();
        this.errors = errors;
        this.validators = validators;
        this.placeholder = placeholder;
        this.type = type;
        this.id = id ? id : name + '-' + (0, uuid_1.v4)();
    }
    static create(data = {}) {
        return new FormField(data);
    }
    validate() {
        let errors = [];
        __classPrivateFieldGet(this, _FormField_validators, "f").forEach((validator) => {
            if (validator) {
                try {
                    validator.call(__classPrivateFieldGet(this, _FormField_value, "f"));
                }
                catch (e) {
                    const err = JSON.parse(e.message);
                    errors.push(err);
                }
            }
            else {
                throw new Error(JSON.stringify({
                    message: 'Please use a valid validator of type Validator',
                    code: 'invalid_validator',
                }));
            }
        });
    }
    get isValid() {
        try {
            this.validators.forEach((validator) => {
                validator.call(this.value);
            });
        }
        catch (e) {
            return false;
        }
        return true;
    }
    get errors() {
        return __classPrivateFieldGet(this, _FormField_errors, "f");
    }
    set errors(error) {
        __classPrivateFieldSet(this, _FormField_errors, error, "f");
    }
    set value(value) {
        __classPrivateFieldSet(this, _FormField_value, value, "f");
    }
    get value() {
        return __classPrivateFieldGet(this, _FormField_value, "f");
    }
    get validators() {
        return __classPrivateFieldGet(this, _FormField_validators, "f");
    }
    set validators(validator) {
        __classPrivateFieldSet(this, _FormField_validators, validator, "f");
    }
    addValidator(validator) {
        let validators = [...this.validators, validator];
        this.validators = validators;
    }
}
exports.FormField = FormField;
_FormField_value = new WeakMap(), _FormField_errors = new WeakMap(), _FormField_validators = new WeakMap();
class FormArray {
    constructor({ name = '', groups = [], FormClass = null }) {
        _FormArray_groups.set(this, []);
        _FormArray_FormClass.set(this, null);
        this.name = '';
        this.name = name;
        __classPrivateFieldSet(this, _FormArray_FormClass, FormClass, "f");
        groups && Array.isArray(groups) && groups.length ? groups.map((group) => this.add(group)) : [];
        if (!groups.length && !FormClass) {
            throw new Error(JSON.stringify('Form type must be specified either add a new instance of the form or explicitly declare type'));
        }
        if (!__classPrivateFieldGet(this, _FormArray_FormClass, "f") && groups.length) {
            //@ts-ignore
            __classPrivateFieldSet(this, _FormArray_FormClass, groups[0].constructor, "f");
        }
    }
    get value() {
        return __classPrivateFieldGet(this, _FormArray_groups, "f").map((form) => {
            return form.value;
        });
    }
    get FormClass() {
        return __classPrivateFieldGet(this, _FormArray_FormClass, "f");
    }
    get groups() {
        return __classPrivateFieldGet(this, _FormArray_groups, "f");
    }
    set groups(group) {
        __classPrivateFieldSet(this, _FormArray_groups, group, "f");
    }
    //@ts-ignore
    add(group = new (__classPrivateFieldGet(this, _FormArray_FormClass, "f"))()) {
        this.groups = [...this.groups, group];
    }
    remove(index) {
        this.groups.splice(index, 1);
        //this.groups = this.groups
    }
}
exports.FormArray = FormArray;
_FormArray_groups = new WeakMap(), _FormArray_FormClass = new WeakMap();
class Form {
    constructor(kwargs = {}) {
        _Form_fields.set(this, []);
        _Form_dynamicFormValidators.set(this, {});
        _Form_errors.set(this, {});
        for (const prop in this.constructor) {
            if (this.constructor[prop] instanceof FormField) {
                __classPrivateFieldGet(this, _Form_fields, "f")[prop] = this.copy(this.constructor[prop]);
            }
            if (this.constructor[prop] instanceof FormArray) {
                __classPrivateFieldGet(this, _Form_fields, "f")[prop] = this.copyArray(this.constructor[prop]);
            }
            if (prop == 'dynamicFormValidators') {
                __classPrivateFieldSet(this, _Form_dynamicFormValidators, this.constructor[prop], "f");
            }
        }
        for (const fieldName in __classPrivateFieldGet(this, _Form_fields, "f")) {
            const field = __classPrivateFieldGet(this, _Form_fields, "f")[fieldName];
            if (field instanceof FormField) {
                setFormFieldValueFromKwargs(fieldName, field, kwargs[fieldName]);
                //@ts-ignore
                this[fieldName] = field;
            }
            else if (field instanceof FormArray) {
                if (kwargs[fieldName] && Array.isArray(kwargs[fieldName])) {
                    for (let index = 0; index < kwargs[fieldName].length; index++) {
                        if (index <= field.groups.length - 1) {
                            const group = field.groups[index];
                            let valuesObj = kwargs[fieldName][index];
                            Object.keys(valuesObj).forEach((k) => {
                                group.field[k].value = valuesObj[k];
                            });
                        }
                        else {
                            let valuesObj = kwargs[fieldName][index];
                            field.add(new field.FormClass(valuesObj));
                        }
                    }
                }
                field.name = fieldName;
                //@ts-ignore
                this[fieldName] = field;
            }
        }
        for (const [_field, _validators] of Object.entries(__classPrivateFieldGet(this, _Form_dynamicFormValidators, "f"))) {
            for (let i = 0; i < _validators.length; i++) {
                this.addFormLevelValidator(_field, _validators[i]);
            }
        }
    }
    static create(kwargs = {}) {
        return new this(kwargs);
    }
    get field() {
        let fields = {};
        for (let index = 0; index < this.fields.length; index++) {
            const field = this.fields[index];
            fields[field.name] = field;
        }
        return fields;
    }
    get fields() {
        let arr = [];
        for (const fieldName in __classPrivateFieldGet(this, _Form_fields, "f")) {
            arr.push(__classPrivateFieldGet(this, _Form_fields, "f")[fieldName]);
        }
        return arr;
    }
    copy(opts = {}) {
        return new FormField(opts);
    }
    copyArray(opts) {
        //@ts-ignore
        let groups = opts.groups.map((g) => {
            //@ts-ignore
            return new g.constructor();
        });
        return new FormArray(Object.assign(Object.assign({}, opts), { name: opts.name, FormClass: opts.FormClass, groups: [...groups] }));
    }
    _handleNoFieldErrors(fieldName) {
        try {
            let field = this.field[fieldName];
            if (!field) {
                throw new Error(JSON.stringify({
                    code: 'no_field',
                    message: `${this.constructor.name} does not contain ${fieldName} field`,
                }));
            }
        }
        catch (e) {
            throw e;
        }
    }
    addFormLevelValidator(fieldName, validator) {
        this._handleNoFieldErrors(fieldName);
        if (this.field[fieldName] instanceof FormArray) {
            throw new Error(JSON.stringify({
                code: 'invalid_operation',
                message: `${fieldName} is a form array please attach validator to child form${fieldName} field`,
            }));
        }
        const newValidator = validator;
        newValidator.setMatchingField(this);
        if (this.field[fieldName] instanceof FormField) {
            this.field[fieldName].addValidator(newValidator);
        }
    }
    addValidator(fieldName, validator) {
        if (this.field[fieldName] instanceof FormArray) {
            throw new Error(JSON.stringify({
                code: 'invalid_operation',
                message: `${fieldName} is a form array please attach validator to child form${fieldName} field`,
            }));
        }
        this._handleNoFieldErrors(fieldName);
        if (this.field[fieldName] instanceof FormField) {
            this.field[fieldName].addValidator(validator);
        }
    }
    validate() {
        this.fields.forEach((f) => {
            if (f instanceof FormField) {
                f.validate();
            }
            else if (f instanceof FormArray) {
                f.groups.forEach((fg) => {
                    fg.validate();
                });
            }
        });
    }
    get errors() {
        let { formArrays, formFields } = fields(this.fields);
        let formArrayErrors = formArrays.reduce((acc, curr) => {
            let invalidGroups = curr.groups
                .filter((group) => group.isValid)
                .map((invalidGroup) => invalidGroup.errors);
            if (invalidGroups.length) {
                acc[curr.name]
                    ? (acc[curr.name] = [...acc[curr.name], invalidGroups])
                    : (acc[curr.name] = invalidGroups);
                return acc;
            }
            return acc;
        }, {});
        let formFieldErrors = formFields.reduce((acc, curr) => {
            if (!curr.isValid) {
                !acc[curr.name]
                    ? (acc[curr.name] = curr.errors)
                    : (acc[curr.name] = [...acc[curr.name], curr.errors]);
                return acc;
            }
            return acc;
        }, {});
        return Object.assign(Object.assign(Object.assign({}, __classPrivateFieldGet(this, _Form_errors, "f")), formFieldErrors), formArrayErrors);
    }
    set errors(errs) {
        __classPrivateFieldSet(this, _Form_errors, errs, "f");
    }
    get value() {
        let { formArrays, formFields } = fields(this.fields);
        //@ts-ignore
        let formFieldVals = formFields.reduce((acc, curr) => {
            acc[curr.name] = curr.value;
            return acc;
        }, {});
        let formArrayVals = formArrays.reduce((acc, curr) => {
            if (!acc[curr.name]) {
                acc[curr.name] = curr.groups.map((formGroup) => formGroup.value);
            }
            else {
                acc[curr.name] = [...acc[curr.name], curr.groups.map((formGroup) => formGroup.value)];
            }
            return acc;
        }, {});
        return Object.assign(Object.assign({}, formFieldVals), formArrayVals);
    }
    get isValid() {
        try {
            let { formArrays, formFields } = fields(this.fields);
            formFields.forEach((field) => {
                if (!field.isValid) {
                    throw new Error(`${field.name} is invalid`);
                }
            });
            formArrays.forEach((formArray) => {
                formArray.groups.forEach((form) => {
                    if (!form.isValid) {
                        throw new Error(`A member of ${formArray.name} is invalid`);
                    }
                });
            });
            return true;
        }
        catch (e) {
            return false;
        }
    }
    set isValid(valid) {
        this.isValid = valid;
    }
}
exports.default = Form;
_Form_fields = new WeakMap(), _Form_dynamicFormValidators = new WeakMap(), _Form_errors = new WeakMap();
