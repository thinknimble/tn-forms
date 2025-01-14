// src/utils.ts
function notNullOrUndefined(value) {
  return value !== null && typeof value !== "undefined";
}
function isNumber(message = "Value must be a number") {
  return function(value) {
    if (!Number.isInteger(value)) {
      throw new Error(message);
    }
  };
}
function isNumberOrFloat(value) {
  let val = Number(value);
  return typeof Number(val) == "number" && !isNaN(val);
}
function fieldGetter(form, name) {
  return form.field[name];
}
var isFormArray = (input) => {
  return input instanceof FormArray;
};
var isFormField = (input) => {
  return input instanceof FormField;
};

// src/forms.ts
function setFormFieldValueFromKwargs(name, field, valueFromKwarg = void 0) {
  field.value = valueFromKwarg != void 0 ? valueFromKwarg : field.value;
  field.name = name;
  return field;
}
function fields(fields2) {
  let formArrays = [];
  let formFields = [];
  for (let i = 0; i < fields2.length; i++) {
    const currentField = fields2[i];
    currentField instanceof FormArray ? formArrays.push(currentField) : null;
    currentField instanceof FormField ? formFields.push(currentField) : null;
  }
  return {
    formArrays,
    formFields
  };
}
var FormField = class _FormField {
  _value = void 0;
  _errors = [];
  _validators = [];
  name;
  _placeholder = "";
  type = "";
  id;
  _isTouched;
  _label = "";
  /**
   * For type-safety sake, please pass value and name, even if value is `null`.
   * Not passing value will result in it being empty string which could cause issues if you don't expect it.
   */
  constructor({
    name = "",
    validators = [],
    errors = [],
    value,
    placeholder = "",
    type = "text",
    id = null,
    isTouched = false,
    label = ""
  } = {}) {
    this.value = Array.isArray(value) ? [...value] : value !== null && typeof value == "object" ? { ...value } : value === void 0 ? "" : value;
    this.name = name ? name : String(Date.now());
    this.errors = errors;
    this.validators = validators;
    this.placeholder = placeholder;
    this.type = type;
    this.id = id ? id : name ? name : "field-" + String(Date.now());
    this._isTouched = isTouched;
    this.label = label;
  }
  static create(data = {}) {
    return new _FormField(data);
  }
  validate() {
    let errors = [];
    this._validators.forEach((validator) => {
      if (validator) {
        try {
          validator.call(this._value);
        } catch (e) {
          const err = JSON.parse(e.message);
          errors.push(err);
        }
      } else {
        throw new Error(
          JSON.stringify({
            message: "Please use a valid validator of type Validator",
            code: "invalid_validator"
          })
        );
      }
    });
    this.errors = errors;
  }
  get isValid() {
    try {
      this.validators.forEach((validator) => {
        validator.call(this.value);
      });
    } catch (e) {
      return false;
    }
    return true;
  }
  get errors() {
    return this._errors;
  }
  set errors(error) {
    this._errors = error;
  }
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(placeholder) {
    this._placeholder = placeholder;
  }
  get label() {
    return this._label;
  }
  set label(label) {
    this._label = label;
  }
  set value(value) {
    this._value = value;
  }
  get value() {
    return this._value;
  }
  get validators() {
    return this._validators;
  }
  set validators(validator) {
    this._validators = validator;
  }
  get isTouched() {
    return this._isTouched;
  }
  set isTouched(touched) {
    this._isTouched = touched;
  }
  addValidator(validator) {
    let validators = [...this.validators, validator];
    this.validators = validators;
  }
  replicate() {
    return new _FormField({
      errors: [...this.errors],
      id: this.id,
      isTouched: this.isTouched,
      name: this.name,
      placeholder: this.placeholder,
      type: this.type,
      validators: [...this.validators],
      value: this.value
    });
  }
};
var FormArray = class _FormArray {
  _groups = [];
  _FormClass = null;
  name = "";
  constructor({ name = "", groups = [], FormClass = null }) {
    this.name = name;
    this._FormClass = FormClass;
    groups && Array.isArray(groups) && groups.length ? groups.map((group) => this.add(group)) : [];
    if (!groups.length && !FormClass) {
      throw new Error(
        JSON.stringify(
          "Form type must be specified either add a new instance of the form or explicitly declare type"
        )
      );
    }
    if (!this._FormClass && groups.length) {
      this._FormClass = groups[0].constructor;
    }
  }
  get value() {
    return this._groups.map((form) => {
      return form.value;
    });
  }
  get FormClass() {
    return this._FormClass;
  }
  get groups() {
    return this._groups;
  }
  set groups(group) {
    this._groups = group;
  }
  add(group = this._FormClass ? new this._FormClass() : null) {
    this.groups = group ? [...this.groups, group] : [...this.groups];
  }
  remove(index) {
    this.groups.splice(index, 1);
  }
  replicate() {
    return new _FormArray({
      groups: this.groups.map((g) => g.replicate()),
      name: this.name,
      FormClass: this.FormClass
    });
  }
};
var Form = class {
  _fields = {};
  _dynamicFormValidators = {};
  _errors = {};
  constructor(kwargs = {}) {
    for (const prop in this.constructor) {
      if (this.constructor[prop] instanceof FormField) {
        this._fields[prop] = this.copy(this.constructor[prop]);
      }
      if (this.constructor[prop] instanceof FormArray) {
        this._fields[prop] = this.copyArray(this.constructor[prop]);
      }
      if (prop == "dynamicFormValidators") {
        this._dynamicFormValidators = this.constructor[prop];
      }
    }
    for (const fieldName in this._fields) {
      const fieldNameKey = fieldName;
      const field = this._fields[fieldNameKey];
      const unknownFieldNameKey = fieldName;
      const kwargsFieldNameKey = unknownFieldNameKey;
      if (field instanceof FormField) {
        setFormFieldValueFromKwargs(fieldName, field, kwargs[kwargsFieldNameKey]);
        this[fieldName] = field;
      } else if (field instanceof FormArray) {
        if (kwargs[kwargsFieldNameKey] && Array.isArray(kwargs[kwargsFieldNameKey])) {
          for (let index = 0; index < kwargs[kwargsFieldNameKey].length; index++) {
            if (index <= field.groups.length - 1) {
              const group = field.groups[index];
              let valuesObj = kwargs[kwargsFieldNameKey][index];
              Object.keys(valuesObj).forEach((k) => {
                if (group) group.field[k].value = valuesObj[k];
              });
            } else {
              let valuesObj = kwargs[kwargsFieldNameKey][index];
              field.add(new field.FormClass(valuesObj));
            }
          }
        }
        field.name = fieldName;
        this[fieldName] = field;
      }
    }
    for (const [_field, _validators] of Object.entries(this._dynamicFormValidators)) {
      for (let i = 0; i < _validators.length; i++) {
        const validator = _validators[i];
        if (validator) {
          this.addFormLevelValidator(_field, validator);
        }
      }
    }
  }
  static create(kwargs = {}) {
    return new this(kwargs);
  }
  replicate() {
    let current = this;
    let newForm = new this.constructor(this.value);
    const formFieldOpts = Object.fromEntries(
      newForm.fields.map((f) => {
        if (isFormField(f)) {
          let originalField = this.field[f.name];
          if (!isFormField(originalField)) return void 0;
          f.errors = [...originalField.errors];
          f.isTouched = originalField.isTouched;
          return [f.name, f];
        }
        if (!(f instanceof FormArray)) {
          console.error("f should either be FormField or FormArray");
          return;
        }
        let formGroups = f.groups.map((fg, i) => {
          let group = fg.replicate();
          return group;
        });
        f.groups = formGroups;
        return [f.name, f];
      }).filter(Boolean)
    );
    newForm._fields = formFieldOpts;
    newForm.errors = current.errors;
    return newForm;
  }
  get field() {
    let fields2 = {};
    for (let index = 0; index < this.fields.length; index++) {
      const field = this.fields[index];
      if (field instanceof FormField || field instanceof FormArray) fields2[field.name] = field;
    }
    return fields2;
  }
  get fields() {
    const result = Object.values(this._fields);
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
      groups: [...groups]
    });
  }
  _handleNoFieldErrors(fieldName) {
    try {
      let field = this.field[fieldName];
      if (!field) {
        throw new Error(
          JSON.stringify({
            code: "no_field",
            message: `${this.constructor.name} does not contain ${fieldName} field`
          })
        );
      }
    } catch (e) {
      throw e;
    }
  }
  addFormLevelValidator(fieldName, validator) {
    this._handleNoFieldErrors(fieldName);
    const currentField = this.field[fieldName];
    if (isFormArray(currentField)) {
      throw new Error(
        JSON.stringify({
          code: "invalid_operation",
          message: `${fieldName} is a form array please attach validator to child form${fieldName} field`
        })
      );
    }
    const newValidator = validator;
    newValidator.setMatchingField(this);
    if (this.field[fieldName] instanceof FormField && currentField) {
      currentField.addValidator(newValidator);
    }
  }
  addValidator(fieldName, validator) {
    const currentField = this.field[fieldName];
    if (isFormArray(currentField)) {
      throw new Error(
        JSON.stringify({
          code: "invalid_operation",
          message: `${fieldName} is a form array please attach validator to child form${fieldName} field`
        })
      );
    }
    this._handleNoFieldErrors(fieldName);
    currentField && currentField.addValidator(validator);
  }
  validate() {
    this.fields.forEach((f) => {
      if (f instanceof FormField) {
        f.validate();
      } else if (f instanceof FormArray) {
        f.groups.forEach((fg) => {
          fg.validate();
        });
      }
    });
  }
  get errors() {
    let { formArrays, formFields } = fields(this.fields);
    let formArrayErrors = formArrays.reduce((acc, curr) => {
      let invalidGroups = curr.groups.filter((group) => group.isValid).map((invalidGroup) => invalidGroup.errors);
      if (invalidGroups.length) {
        if (!acc[curr.name]) {
          acc[curr.name] = invalidGroups;
          return acc;
        }
        acc[curr.name] = [...acc[curr.name] ?? [], invalidGroups];
        return acc;
      }
      return acc;
    }, {});
    let formFieldErrors = formFields.reduce((acc, curr) => {
      if (curr.isValid) return acc;
      if (!acc[curr.name]) {
        acc[curr.name] = curr.errors;
        return acc;
      }
      acc[curr.name] = [...acc[curr.name] ?? [], curr.errors];
      return acc;
    }, {});
    return { ...this._errors, ...formFieldErrors, ...formArrayErrors };
  }
  set errors(errs) {
    this._errors = errs;
  }
  get value() {
    let { formArrays, formFields } = fields(this.fields);
    let formFieldValues = formFields.reduce((acc, curr) => {
      acc[curr.name] = curr.value;
      return acc;
    }, {});
    let formArrayValues = formArrays.reduce((acc, curr) => {
      if (!acc[curr.name]) {
        acc[curr.name] = curr.groups.map((formGroup) => formGroup.value);
      } else {
        acc[curr.name] = [...acc[curr.name], curr.groups.map((formGroup) => formGroup.value)];
      }
      return acc;
    }, {});
    return { ...formFieldValues, ...formArrayValues };
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
    } catch (e) {
      return false;
    }
  }
  set isValid(valid) {
    this.isValid = valid;
  }
};

// src/validators.ts
import * as EmailValidatorObj from "email-validator";
import { DateTime } from "luxon";
import { isPossiblePhoneNumber } from "libphonenumber-js";
var Validator = class {
  /**
   * Crete an instance of the validator.
   * @param {string} message - The error message to return if validation fails.
   * @param {string} code - The code to return with the thrown Error if validation fails.
   */
  message = "Invalid Value";
  code = "invalid_validator";
  isRequired = true;
  constructor({ message = "Invalid value", code = "invalid", isRequired = true } = {}) {
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
    throw new Error("Validator cannot be used directly, it must be overwritten in a subclass");
  }
};
var FormLevelValidator = class extends Validator {
  matcher;
  _matchingField;
  constructor({
    message = "Value must match",
    code = "mustMatch",
    isRequired = true,
    matcher = ""
  } = {}) {
    super({ message, code, isRequired });
    this.matcher = matcher;
  }
  setMatchingField(form) {
    if (this.matcher && form.field[this.matcher]) {
      this._matchingField = form.field[this.matcher];
      return;
    }
    throw new Error("Matching Field does not exist on form");
  }
  get matchingVal() {
    return this._matchingField ? this._matchingField.value : null;
  }
};
var RequiredValidator = class extends Validator {
  constructor({ message = "This is a required field", code = "required", isRequired = true } = {}) {
    super({ message, code, isRequired });
  }
  call(value) {
    if (!this.enableValidate && !notNullOrUndefined(value)) {
      return;
    }
    if (!notNullOrUndefined(value)) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }));
    } else if (Array.isArray(value) && !value.length) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }));
    } else if (!value.toString().length) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }));
    }
  }
};
var MinLengthValidator = class extends Validator {
  minLength;
  constructor({
    message = "Must meet minimum length requirements",
    code = "minLength",
    isRequired = true,
    minLength = 10
  } = {}) {
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
};
var MustMatchValidator = class extends FormLevelValidator {
  call(value) {
    if (!this.enableValidate && !notNullOrUndefined(value)) {
      return;
    }
    if (this.matchingVal !== value) {
      throw new Error(
        JSON.stringify({
          code: this.code,
          message: `${this.message}`
        })
      );
    }
  }
};
var EmailValidator = class extends Validator {
  constructor({
    message = "Please Enter a Valid Email",
    code = "invalidEmail",
    isRequired = true
  } = {}) {
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
    } catch {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }));
    }
  }
};
var MinDateValidator = class extends Validator {
  min;
  constructor({
    message = "Must meet minimum date",
    code = "minDate",
    isRequired = true,
    min = /* @__PURE__ */ new Date()
  } = {}) {
    super({ message, code, isRequired });
    this.min = min;
  }
  call(value) {
    if (!this.enableValidate && !notNullOrUndefined(value)) {
      return;
    }
    if (!value) {
      throw new Error(
        JSON.stringify({
          code: this.code,
          message: `Please enter a valid date`
        })
      );
    }
    let minAsLuxonDateTime;
    let compare;
    try {
      minAsLuxonDateTime = DateTime.fromJSDate(this.min);
    } catch (e) {
      throw new Error(
        JSON.stringify({ code: this.code, message: "Please enter a valid Date for the minimum" })
      );
    }
    try {
      compare = DateTime.fromJSDate(value);
    } catch (e) {
      throw new Error(JSON.stringify({ code: this.code, message: "Please enter a valid Date" }));
    }
    if (!minAsLuxonDateTime || !minAsLuxonDateTime.isValid) {
      throw new Error(
        JSON.stringify({ code: this.code, message: "Please enter a valid Date for the minimum" })
      );
    }
    if (!compare || !compare.isValid) {
      throw new Error(JSON.stringify({ code: this.code, message: "Please enter a valid Date" }));
    }
    if (compare.startOf("day") < minAsLuxonDateTime.startOf("day")) {
      throw new Error(
        JSON.stringify({
          code: this.code,
          message: `Please enter a date greater than ${DateTime.fromJSDate(this.min).toFormat(
            "D"
          )}`
        })
      );
    }
  }
};
var MaxDateValidator = class extends Validator {
  max;
  constructor({
    message = "Must meet minimum date",
    code = "maxDate",
    isRequired = true,
    max = /* @__PURE__ */ new Date()
  } = {}) {
    super({ message, code, isRequired });
    this.max = max;
  }
  call(value) {
    if (!this.enableValidate && !notNullOrUndefined(value)) {
      return;
    }
    if (!value) {
      throw new Error(
        JSON.stringify({
          code: this.code,
          message: `Please enter a valid date`
        })
      );
    }
    let max;
    let compare;
    try {
      max = DateTime.fromJSDate(this.max);
    } catch (e) {
      throw new Error(
        JSON.stringify({ code: this.code, message: "Please enter a valid Date for the maximum" })
      );
    }
    try {
      compare = DateTime.fromJSDate(value);
    } catch (e) {
      throw new Error(JSON.stringify({ code: this.code, message: "Please enter a valid Date" }));
    }
    if (!max || !max.isValid) {
      throw new Error(
        JSON.stringify({ code: this.code, message: "Please enter a valid Date for the maximum" })
      );
    }
    if (!compare || !compare.isValid) {
      throw new Error(JSON.stringify({ code: this.code, message: "Please enter a valid Date" }));
    }
    if (DateTime.fromJSDate(value).startOf("day") > DateTime.fromJSDate(this.max).startOf("day")) {
      throw new Error(
        JSON.stringify({
          code: this.code,
          message: `Please enter a date greater than ${DateTime.fromJSDate(this.max).toFormat(
            "D"
          )}`
        })
      );
    }
  }
};
var DynamicMinDateValidator = class extends FormLevelValidator {
  call(value) {
    if (!this.enableValidate && !notNullOrUndefined(value)) {
      return;
    }
    new MinDateValidator({
      message: this.message,
      code: this.code,
      min: this.matchingVal ? new Date(this.matchingVal) : void 0,
      isRequired: this.enableValidate
    }).call(value ? new Date(value) : null);
  }
};
var MinimumValueValidator = class extends Validator {
  min;
  constructor({
    message = "Must meet minimum value",
    code = "invalidMinValue",
    isRequired = true,
    min = 0
  } = {}) {
    super({ message, code, isRequired });
    this.min = min;
  }
  call(value) {
    if (!notNullOrUndefined(value) || !isNumberOrFloat(value)) {
      throw new Error(JSON.stringify({ code: this.code, message: "Please enter a valid Number" }));
    } else {
      if (Number(value) < this.min) {
        throw new Error(JSON.stringify({ code: this.code, message: this.message }));
      }
    }
  }
};
var MaximumValueValidator = class extends Validator {
  max;
  constructor({
    message = "Must meet minimum value",
    code = "invalidMaxValue",
    isRequired = true,
    max = 10
  } = {}) {
    super({ message, code, isRequired });
    this.max = max;
  }
  call(value) {
    if (!notNullOrUndefined(value) || !isNumberOrFloat(value)) {
      throw new Error(JSON.stringify({ code: this.code, message: "Please enter a valid Number" }));
    } else {
      if (Number(value) > this.max) {
        throw new Error(JSON.stringify({ code: this.code, message: this.message }));
      }
    }
  }
};
var PatternValidator = class extends Validator {
  pattern;
  constructor({
    message = "Value does not match pattern",
    code = "invalidPattern",
    isRequired = true,
    pattern = /./
  } = {}) {
    super({ message, code, isRequired });
    this.pattern = typeof pattern == "string" ? new RegExp(pattern) : pattern;
  }
  call(value) {
    if (!value && !this.isRequired) return;
    if (!notNullOrUndefined(value)) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }));
    }
    if (typeof value != "string" && typeof value != "number") {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }));
    }
    if (!this.pattern.test(value)) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }));
    }
  }
};
var UrlValidator = class extends PatternValidator {
  constructor({
    message = "Please enter a valid url",
    code = "invalidUrl",
    isRequired = true
  } = {}) {
    let pattern = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?$/;
    super({ message, code, isRequired, pattern });
  }
};
var TrueFalseValidator = class extends Validator {
  truthy;
  constructor({
    message = "Invalid option",
    code = "invalidOption",
    isRequired = true,
    truthy = true
  } = {}) {
    message = `Value should be ${truthy}`;
    super({ message, code, isRequired });
    this.truthy = truthy;
  }
  call(value) {
    if (!notNullOrUndefined(value)) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }));
    } else if (!!value !== this.truthy) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }));
    }
  }
};
var PhoneNumberValidator = class extends Validator {
  constructor({
    message,
    code,
    isRequired
  }) {
    super({ message, code, isRequired });
  }
  call(value) {
    if (!this.enableValidate && !notNullOrUndefined(value)) return;
    const isValid = isPossiblePhoneNumber(value);
    if (!isValid) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }));
    }
  }
};
export {
  DynamicMinDateValidator,
  EmailValidator,
  Form,
  FormArray,
  FormField,
  FormLevelValidator,
  MaxDateValidator,
  MaximumValueValidator,
  MinDateValidator,
  MinLengthValidator,
  MinimumValueValidator,
  MustMatchValidator,
  PatternValidator,
  PhoneNumberValidator,
  RequiredValidator,
  TrueFalseValidator,
  UrlValidator,
  Validator,
  fieldGetter,
  isFormArray,
  isFormField,
  isNumber,
  isNumberOrFloat,
  notNullOrUndefined
};
