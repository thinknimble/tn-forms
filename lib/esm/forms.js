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
        const currentField = fields[i];
        currentField instanceof FormArray ? formArrays.push(currentField) : null;
        currentField instanceof FormField ? formFields.push(currentField) : null;
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
    #isTouched;
    constructor({ name = '', validators = [], errors = [], value = '', placeholder = '', type = 'text', id = null, isTouched = false, } = {}) {
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
        this.id = id ? id : name ? name : 'field' + '-' + v4();
        this.#isTouched = isTouched;
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
        this.errors = errors;
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
    get isTouched() {
        return this.#isTouched;
    }
    set isTouched(touched) {
        this.#isTouched = touched;
    }
    addValidator(validator) {
        let validators = [...this.validators, validator];
        this.validators = validators;
    }
    replicate() {
        return new FormField({
            errors: [...this.errors],
            id: this.id,
            isTouched: this.isTouched,
            name: this.name,
            placeholder: this.placeholder,
            type: this.type,
            validators: [...this.validators],
            value: this.value,
        });
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
    add(group = this.#FormClass ? this.#FormClass.replicate() : null) {
        this.groups = group ? [...this.groups, group] : [...this.groups];
    }
    remove(index) {
        this.groups.splice(index, 1);
        //this.groups = this.groups
    }
    // static create(opts:IFormArrayKwargs<unknown> = {}) {
    //   return new this(opts)
    // }
    replicate() {
        return new FormArray({
            groups: this.groups.map((g) => g.replicate()),
            name: this.name,
            FormClass: this.FormClass,
        });
    }
}
export default class Form {
    #fields = {};
    #dynamicFormValidators = {};
    #errors = {};
    constructor(kwargs = {}) {
        /**
         * `this.constructor` has the static fields as keys. So here we're iterating over them to get the values from the child class and store them in the #fields private class field
         */
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
        /**
         * Iterates on keys of #fields.
         */
        for (const fieldName in this.#fields) {
            const fieldNameKey = fieldName;
            const field = this.#fields[fieldNameKey];
            /**
             * need to do this since we cannot make `kwargs` and `fieldNameKey` to match their types. We know they will have the same keys but could not find a direct way of match them at compile time
             */
            const unknownFieldNameKey = fieldName;
            const kwargsFieldNameKey = unknownFieldNameKey;
            if (field instanceof FormField) {
                setFormFieldValueFromKwargs(fieldName, field, kwargs[kwargsFieldNameKey]);
                // I think this is ts-ignored because this is where we rely on the static fields of the child form class
                //@ts-ignore
                this[fieldName] = field;
            }
            else if (field instanceof FormArray) {
                if (kwargs[kwargsFieldNameKey] && Array.isArray(kwargs[kwargsFieldNameKey])) {
                    for (let index = 0; index < kwargs[kwargsFieldNameKey].length; index++) {
                        if (index <= field.groups.length - 1) {
                            const group = field.groups[index];
                            let valuesObj = kwargs[kwargsFieldNameKey][index];
                            Object.keys(valuesObj).forEach((k) => {
                                group.field[k].value = valuesObj[k];
                            });
                        }
                        else {
                            let valuesObj = kwargs[kwargsFieldNameKey][index];
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
    replicate() {
        // ALERT there is a bug here for FormArrays the referenc is still attached PB
        let current = this;
        //@ts-ignore
        let newForm = new this.constructor(this.value);
        const formFieldOpts = Object.fromEntries(newForm.fields
            .map((f) => {
            if (f instanceof FormField) {
                let originalField = this.field[f.name];
                f.errors = [...originalField.errors];
                f.isTouched = originalField.isTouched;
                return [f.name, f];
            }
            if (!(f instanceof FormArray)) {
                console.error('f should either be FormField or FormArray');
                return;
            }
            let formGroups = f.groups.map((fg, i) => {
                let group = fg.replicate();
                return group;
            });
            f.groups = formGroups;
            return [f.name, f];
        })
            .filter(Boolean));
        newForm.#fields = formFieldOpts;
        newForm.errors = current.errors;
        return newForm;
    }
    get field() {
        let fields = {};
        for (let index = 0; index < this.fields.length; index++) {
            const field = this.fields[index];
            if (field instanceof FormField || field instanceof FormArray)
                fields[field.name] = field;
        }
        return fields;
    }
    get fields() {
        const result = Object.values(this.#fields);
        return result;
    }
    copy(opts = {}) {
        return new FormField(opts);
    }
    copyArray(opts) {
        let groups = opts.groups.map((g) => {
            return g.replicate();
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
