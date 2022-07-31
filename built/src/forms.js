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
var _FormField_value, _FormField_errors, _FormField_validators, _FormArray_value, _FormArray_errors, _FormArray_groups, _Form_fields, _Form_dynamicFormValidators;
class FormField {
    constructor({ name = '', validators = [], errors = [], value = '', placeholder = '', type = 'text', id = null } = {}) {
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
        this.name = name ? name : Math.floor((Math.random() * 10)).toString();
        this.errors = errors;
        this.validators = validators;
        this.placeholder = placeholder;
        this.type = type;
        this.id = id ? id : this.name + '-' + Math.floor((Math.random() * 10));
    }
    static create(data = {}) {
        return new FormField(data);
    }
    validate() {
        let errors = [];
        __classPrivateFieldGet(this, _FormField_validators, "f").forEach(validator => {
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
                throw new Error(JSON.stringify({ message: "Please use a valid validator of type Validator", code: "invalid_validator" }));
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
_FormField_value = new WeakMap(), _FormField_errors = new WeakMap(), _FormField_validators = new WeakMap();
export class FormArray {
    constructor({ name = '', groups = [new Form()], value = [] } = {}) {
        _FormArray_value.set(this, []);
        _FormArray_errors.set(this, []);
        _FormArray_groups.set(this, []);
        this.name = '';
        this.name = name;
        this.groups = groups;
        this.value = value;
    }
    get value() {
        return __classPrivateFieldGet(this, _FormArray_groups, "f").map((form) => {
            return form.value;
        });
    }
    set value(value) {
        __classPrivateFieldSet(this, _FormArray_value, value, "f");
    }
    get groups() {
        return __classPrivateFieldGet(this, _FormArray_groups, "f");
    }
    set groups(group) {
        __classPrivateFieldSet(this, _FormArray_groups, group, "f");
    }
    add(group = new Form()) {
        this.groups = [...this.groups, group];
    }
    remove(index) {
        this.groups.splice(index, 1);
        //this.groups = this.groups
    }
}
_FormArray_value = new WeakMap(), _FormArray_errors = new WeakMap(), _FormArray_groups = new WeakMap();
export default class Form {
    constructor(kwargs = {}) {
        _Form_fields.set(this, {});
        _Form_dynamicFormValidators.set(this, {});
        for (const prop in this.constructor) {
            if (this.constructor[prop] instanceof FormField) {
                // create a copy of the new Field instance as they point to the same object in memory
                __classPrivateFieldGet(this, _Form_fields, "f")[prop] = this.copy(this.constructor[prop]);
            }
            /*
            CUT OUT FORMARRY FOR NOW
            if (this.constructor[prop] instanceof FormArray) {
              // create a copy of the new FieldArray instance as they point to the same object in memory
              this.#fields[prop] = this.copyArray(this.constructor[prop])
            }
            */
            if (prop == 'dynamicFormValidators') {
                // adds form level validators to fields
                __classPrivateFieldSet(this, _Form_dynamicFormValidators, this.constructor[prop], "f");
            }
        }
        for (const fieldName in __classPrivateFieldGet(this, _Form_fields, "f")) {
            const field = __classPrivateFieldGet(this, _Form_fields, "f")[fieldName];
            if (field instanceof FormField) {
                // Optionally set the value of the field either from the constructor of the instance
                // or the constructor of the parent form class latest priority first
                field.value =
                    kwargs[fieldName] && !(kwargs[fieldName] instanceof FormField)
                        ? kwargs[fieldName]
                        : field.value;
                field.name = fieldName;
                this[fieldName] = field;
            }
            /*
      CUT OUT FORMARRY FOR NOW
      
      else if (field instanceof FormArray) {
        this[fieldName] = field
      }
      */
        }
        for (const [_field, _validators] of Object.entries(__classPrivateFieldGet(this, _Form_dynamicFormValidators, "f"))) {
            for (let i = 0; i < _validators.length; i++) {
                this.addValidator(_field, _validators[i]);
            }
        }
    }
    static create(kwargs = {}) {
        return new this(kwargs);
    }
    get field() {
        // helper getter to return the fields
        // users can access fields with xxx.field['fieldName']
        return __classPrivateFieldGet(this, _Form_fields, "f");
    }
    get fields() {
        let arr = [];
        for (const fieldName in __classPrivateFieldGet(this, _Form_fields, "f")) {
            // return an array of fields for easier loop access
            arr.push(__classPrivateFieldGet(this, _Form_fields, "f")[fieldName]);
        }
        return arr;
    }
    copy(opts = {}) {
        return new FormField(opts);
    }
    /*
    copyArray<T>(opts:FormArray<T> = new FormArray()) {
      let groups = opts.groups.map((g:<T>) => g.create(g))
      return new FormArray({ ...opts, name: opts.name, groups: [...groups] })
    }
    */
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
    /*
      addToArray(formArrayName, form) {
        this._handleNoFieldErrors(formArrayName)
        if (this.field[formArrayName] instanceof FormArray) {
          this.field[formArrayName].add(form)
        }
      }
    
      */
    /*
     removeFromArray(formArrayName, index) {
     
    
        this._handleNoFieldErrors(formArrayName)
    
        if (this.field[formArrayName] instanceof FormArray) {
          this.field[formArrayName].remove(index)
        }
      }
      */
    addValidator(fieldName, validator, extraArgs = null) {
        /** Add Validators on the fly to certain fields
         * @fieldName required string the field name to attach a validator to
         * @validator the validator as a new instance
         * @extraArgs if a field is a form array pass in the fieldName of its field
         * Note for formArrays all instances will receive the validator
         */
        this._handleNoFieldErrors(fieldName);
        let props = {};
        for (const prop in validator) {
            props[prop] = validator[prop];
        }
        props['form'] = this;
        let updatedValidatorWithForm = new validator.constructor(props);
        /*
        
           if (this.field[fieldName] instanceof FormArray && extraArgs) {
             this.field[fieldName].groups.forEach((g) => {
               if (g.field[extraArgs]) {
                 g.field[extraArgs].addValidator(updatedValidatorWithForm)
               }
             })
           } else
           
         */
        if (this.field[fieldName] instanceof FormField) {
            this.field[fieldName].addValidator(updatedValidatorWithForm);
        }
    }
    validate() {
        this.fields.forEach((f) => {
            if (f instanceof FormField) {
                f.validate();
                /*  if (!f.isValid) return (this.isValid = false)
                  else return (this.isValid = true) */
            }
            else if (f instanceof FormArray) {
                f.groups.forEach((fg) => {
                    fg.validate();
                });
            }
        });
    }
    get errors() {
        /** Returns an array of field errors in the format name:string, value:string, errors:str[]*/
        try {
            return this.fields.reduce((acc, curr) => {
                /* if (curr instanceof FormArray) {
                  let groupErrors = curr.groups.reduce((groupAcc, groupCurr) => {
                    if (!groupCurr.isValid || groupCurr.errors.length > 0) {
                      if (!groupAcc) {
                        groupAcc = []
                      }
                      groupAcc.push({
                        value: curr.value,
                        errors: groupCurr.errors,
                      })
        
                      return groupAcc
                    }
                  }, [])
                  if (groupErrors && groupErrors.length > 0) {
                    let errorObj = { [curr.name]: groupErrors }
                    acc.push(errorObj)
                  }
                } */
                if (curr instanceof FormField) {
                    if (!curr.isValid || curr.errors.length > 0) {
                        acc.push({ name: curr.name, value: curr.value, errors: curr.errors });
                        return acc;
                    }
                }
                return acc;
            }, []);
        }
        catch (e) {
            return e;
        }
    }
    set errors(errs) {
        if (Array.isArray(errs)) {
            this.errors = errs;
        }
        else {
            this.errors = [errs];
        }
    }
    get value() {
        return this.fields.reduce((acc, curr) => {
            acc[curr.name] = curr.value;
            return acc;
        }, {});
    }
    get isValid() {
        try {
            this.fields.forEach((f) => {
                if (f instanceof FormField) {
                    if (!f.isValid) {
                        throw new Error(`${f.name} is invalid`);
                    }
                }
                /*
                else if (f instanceof FormArray) {
                  f.groups.forEach((fg) => {
                    if (!fg.isValid) {
                      throw new Error()
                    }
                    return true
                  })
                } else {
                  return this.isValid
                }
                */
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
_Form_fields = new WeakMap(), _Form_dynamicFormValidators = new WeakMap();
