import { v4 } from 'uuid';
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
export class FormField {
    #value = null;
    #errors = [];
    #validators = [];
    name = '';
    placeholder = '';
    type = '';
    id;
    constructor({ name = '', validators = [], errors = [], value = '', placeholder = '', type = 'text', id = null, } = {}) {
        this.value = Array.isArray(value)
            ? [...value]
            : typeof value !== null && typeof value == 'object'
                ? { ...value }
                : value;
        this.name = name ? name : v4();
        this.errors = errors;
        this.validators = validators;
        this.placeholder = placeholder;
        this.type = type;
        this.id = id ? id : name + '-' + v4();
    }
    static create(data = {}) {
        return new FormField(data);
    }
    validate() {
        let errors = [];
        this.#validators.forEach((validator) => {
            if (validator) {
                try {
                    validator.call(this.#value);
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
        return this.#errors;
    }
    set errors(error) {
        this.#errors = error;
    }
    set value(value) {
        this.#value = value;
    }
    get value() {
        return this.#value;
    }
    get validators() {
        return this.#validators;
    }
    set validators(validator) {
        this.#validators = validator;
    }
    addValidator(validator) {
        let validators = [...this.validators, validator];
        this.validators = validators;
    }
}
export class FormArray {
    #groups = [];
    #FormClass = null;
    name = '';
    constructor({ name = '', groups = [], FormClass = null }) {
        this.name = name;
        this.#FormClass = FormClass;
        groups && Array.isArray(groups) && groups.length ? groups.map((group) => this.add(group)) : [];
        if (!groups.length && !FormClass) {
            throw new Error(JSON.stringify('Form type must be specified either add a new instance of the form or explicitly declare type'));
        }
        if (!this.#FormClass && groups.length) {
            //@ts-ignore
            this.#FormClass = groups[0].constructor;
        }
    }
    get value() {
        return this.#groups.map((form) => {
            return form.value;
        });
    }
    get FormClass() {
        return this.#FormClass;
    }
    get groups() {
        return this.#groups;
    }
    set groups(group) {
        this.#groups = group;
    }
    //@ts-ignore
    add(group = new this.#FormClass()) {
        this.groups = [...this.groups, group];
    }
    remove(index) {
        this.groups.splice(index, 1);
        //this.groups = this.groups
    }
}
export default class Form {
    #fields = [];
    #dynamicFormValidators = {};
    #errors = {};
    constructor(kwargs = {}) {
        for (const prop in this.constructor) {
            if (this.constructor[prop] instanceof FormField) {
                this.#fields[prop] = this.copy(this.constructor[prop]);
            }
            if (this.constructor[prop] instanceof FormArray) {
                this.#fields[prop] = this.copyArray(this.constructor[prop]);
            }
            if (prop == 'dynamicFormValidators') {
                this.#dynamicFormValidators = this.constructor[prop];
            }
        }
        for (const fieldName in this.#fields) {
            const field = this.#fields[fieldName];
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
        for (const [_field, _validators] of Object.entries(this.#dynamicFormValidators)) {
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
        for (const fieldName in this.#fields) {
            arr.push(this.#fields[fieldName]);
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
        return new FormArray({
            ...opts,
            name: opts.name,
            FormClass: opts.FormClass,
            groups: [...groups],
        });
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
        return { ...this.#errors, ...formFieldErrors, ...formArrayErrors };
    }
    set errors(errs) {
        this.#errors = errs;
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
        return { ...formFieldVals, ...formArrayVals };
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
