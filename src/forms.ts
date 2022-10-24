import {
  IDynamicFormValidators,
  IValidator,
  IForm,
  IFormFieldError,
  IFormFieldKwargs,
  IFormField,
  TFormInstanceFields,
  IFormArray,
  IFormArrayKwargs,
  TFormFieldTypeCombos,
  TFormFieldTypeOpts,
} from './interfaces'

function setFormFieldValueFromKwargs(
  name: string,
  field: FormField,
  valueFromKwarg = undefined,
): IFormField {
  field.value = valueFromKwarg != undefined ? valueFromKwarg : field.value
  field.name = name
  return field
}
function setValidatorProps(validator: IValidator, kwargs: any): IValidator {
  let props = {}
  for (const prop in validator) {
    props[prop] = validator[prop]
  }
  props['form'] = this
  for (const [k, v] of Object.entries(kwargs)) {
    props[k] = v
  }
  return validator.constructor(props)
}

function fields<T>(fields: TFormFieldTypeOpts<T>[]): TFormFieldTypeCombos<T> {
  let formArrays = [] as FormArray<T>[]
  let formFields = [] as FormField[]
  for (let i = 0; i < fields.length; i++) {
    fields[i] instanceof FormArray ? formArrays.push(fields[i] as FormArray<T>) : null
    fields[i] instanceof FormField ? formFields.push(fields[i] as FormField) : null
  }
  return {
    formArrays,
    formFields,
  }
}

export class FormField implements IFormField {
  #value: any = null
  #errors: IFormFieldError[] = []
  #validators: IValidator[] = []
  name: string = ''
  placeholder: string = ''
  type: string = ''
  id: string

  constructor({
    name = '',
    validators = [],
    errors = [],
    value = '',
    placeholder = '',
    type = 'text',
    id = null,
  }: IFormFieldKwargs = {}) {
    this.value = Array.isArray(value)
      ? [...value]
      : typeof value !== null && typeof value == 'object'
      ? { ...value }
      : value
    this.name = name ? name : Math.floor(Math.random() * 10).toString()
    this.errors = errors
    this.validators = validators
    this.placeholder = placeholder
    this.type = type
    this.id = id ? id : this.name + '-' + Math.floor(Math.random() * 10)
  }
  static create(data: IFormFieldKwargs = {}): FormField {
    return new FormField(data)
  }
  validate() {
    let errors: IFormFieldError[] = []
    this.#validators.forEach((validator) => {
      if (validator) {
        try {
          validator.call(this.#value)
        } catch (e: any) {
          const err = JSON.parse(e.message)
          errors.push(err)
        }
      } else {
        throw new Error(
          JSON.stringify({
            message: 'Please use a valid validator of type Validator',
            code: 'invalid_validator',
          }),
        )
      }
    })
  }
  get isValid(): boolean {
    try {
      this.validators.forEach((validator) => {
        validator.call(this.value)
      })
    } catch (e) {
      return false
    }
    return true
  }
  get errors() {
    return this.#errors
  }
  set errors(error) {
    this.#errors = error
  }
  set value(value) {
    this.#value = value
  }
  get value() {
    return this.#value
  }
  get validators() {
    return this.#validators
  }
  set validators(validator) {
    this.#validators = validator
  }

  addValidator(validator: IValidator) {
    let validators = [...this.validators, validator]
    this.validators = validators
  }
}

export class FormArray<T> implements IFormArray<T> {
  #groups: IForm<T>[] = []
  name: string = ''

  constructor({ name = '', groups = [] }: IFormArrayKwargs<T>) {
    this.name = name
    groups && Array.isArray(groups) && groups.length ? groups.map((group) => this.add(group)) : []
  }
  get value() {
    return this.#groups.map((form: IForm<T>) => {
      return form.value
    })
  }
  get groups(): IForm<T>[] {
    return this.#groups
  }
  set groups(group) {
    this.#groups = group
  }

  add(group: IForm<T>) {
    this.groups = [...this.groups, group]
  }
  remove(index: number) {
    this.groups.splice(index, 1)
    //this.groups = this.groups
  }
}

export default class Form<T> implements IForm<T> {
  #fields: TFormInstanceFields<T> = {} as T
  #dynamicFormValidators: IDynamicFormValidators = {}
  #errors: {}

  constructor(kwargs: { [key: string]: any } = {}) {
    for (const prop in this.constructor) {
      if (this.constructor[prop] instanceof FormField) {
        this.#fields[prop] = this.copy(this.constructor[prop])
      }

      if (this.constructor[prop] instanceof FormArray) {
        this.#fields[prop] = this.copyArray(this.constructor[prop])
      }

      if (prop == 'dynamicFormValidators') {
        this.#dynamicFormValidators = this.constructor[prop]
      }
    }

    for (const fieldName in this.#fields) {
      const field = this.#fields[fieldName]
      if (field instanceof FormField) {
        setFormFieldValueFromKwargs(fieldName, field, kwargs[fieldName])
        //@ts-ignore
        this[fieldName] = field
      } else if (field instanceof FormArray) {
        for (let index = 0; index < field.groups.length; index++) {
          const group = field.groups[index]
          if (
            kwargs[fieldName] &&
            Array.isArray(kwargs[fieldName]) &&
            index <= kwargs[fieldName].length
          ) {
            console.log('here')
            let valuesObj = kwargs[fieldName][index]
            Object.keys(valuesObj).forEach((k: string) => {
              group.field[k].value = valuesObj[k]
            })
          }
        }
        //@ts-ignore
        this[fieldName] = field
      }
    }
    for (const [_field, _validators] of Object.entries(this.#dynamicFormValidators)) {
      for (let i = 0; i < _validators.length; i++) {
        this.addValidator(_field, _validators[i])
      }
    }
  }

  static create(kwargs: { [key: string]: any } = {}) {
    return new this(kwargs)
  }

  get field(): TFormInstanceFields<T> {
    return this.#fields
  }
  get fields(): TFormFieldTypeOpts<T>[] {
    let arr = []
    for (const fieldName in this.#fields) {
      arr.push(this.#fields[fieldName])
    }

    return arr
  }
  copy(opts = {}) {
    return new FormField(opts)
  }

  copyArray<T>(opts: FormArray<T>) {
    let groups = opts.groups.map((g: Form<T>) => {
      //@ts-ignore
      return new g.constructor()
    })
    return new FormArray({ ...opts, name: opts.name, groups: [...groups] })
  }

  _handleNoFieldErrors(fieldName: string) {
    try {
      let field = this.field[fieldName]
      if (!field) {
        throw new Error(
          JSON.stringify({
            code: 'no_field',
            message: `${this.constructor.name} does not contain ${fieldName} field`,
          }),
        )
      }
    } catch (e) {
      throw e
    }
  }
  addFormLevelValidator(fieldName: string, validator: IValidator) {
    this._handleNoFieldErrors(fieldName)
    if (this.field[fieldName] instanceof FormArray) {
      throw new Error(
        JSON.stringify({
          code: 'invalid_operation',
          message: `${fieldName} is a form array please attach validator to child form${fieldName} field`,
        }),
      )
    }
    const newValidator = setValidatorProps(validator, { form: this })

    if (this.field[fieldName] instanceof FormField) {
      this.field[fieldName].addValidator(newValidator)
    }
  }
  addValidator(fieldName: string, validator: IValidator) {
    if (this.field[fieldName] instanceof FormArray) {
      throw new Error(
        JSON.stringify({
          code: 'invalid_operation',
          message: `${fieldName} is a form array please attach validator to child form${fieldName} field`,
        }),
      )
    }
    this._handleNoFieldErrors(fieldName)
    if (this.field[fieldName] instanceof FormField) {
      this.field[fieldName].addValidator(validator)
    }
  }
  validate() {
    this.fields.forEach((f: IFormField | IFormArray<T>) => {
      if (f instanceof FormField) {
        f.validate()
      } else if (f instanceof FormArray) {
        f.groups.forEach((fg: IForm<T>) => {
          fg.validate()
        })
      }
    })
  }
  get errors(): any {
    let { formArrays, formFields } = fields(this.fields)
    let formArrayErrors = formArrays.reduce((acc, curr) => {
      let invalidGroups = curr.groups
        .filter((group) => group.isValid)
        .map((invalidGroup) => invalidGroup.errors)
      if (invalidGroups.length) {
        acc[curr.name]
          ? (acc[curr.name] = [...acc[curr.name], invalidGroups])
          : (acc[curr.name] = invalidGroups)
        return acc
      }
      return acc
    }, {})

    let formFieldErrors = formFields.reduce((acc, curr) => {
      if (!curr.isValid) {
        !acc[curr.name]
          ? (acc[curr.name] = curr.errors)
          : (acc[curr.name] = [...acc[curr.name], curr.errors])

        return acc
      }
      return acc
    }, {})
    return { ...this.#errors, ...formFieldErrors, ...formArrayErrors }
  }
  set errors(errs) {
    this.#errors = errs
  }
  get value() {
    let { formArrays, formFields } = fields(this.fields)
    let formFieldVals = formFields.reduce((acc: { [key: string]: FormField }, curr: FormField) => {
      acc[curr.name] = curr.value
      return acc
    }, {})
    let formArrayVals = formArrays.reduce((acc, curr) => {
      if (!acc[curr.name]) {
        acc[curr.name] = curr.groups.map((formGroup) => formGroup.value)
      } else {
        acc[curr.name] = [...acc[curr.name], curr.groups.map((formGroup) => formGroup.value)]
      }
      return acc
    }, {})
    return { ...formFieldVals, ...formArrayVals }
  }
  get isValid() {
    try {
      let { formArrays, formFields } = fields(this.fields)
      formFields.forEach((field) => {
        if (!field.isValid) {
          throw new Error(`${field.name} is invalid`)
        }
      })
      formArrays.forEach((formArray) => {
        formArray.groups.forEach((form) => {
          if (!form.isValid) {
            throw new Error(`A member of ${formArray.name} is invalid`)
          }
        })
      })
      return true
    } catch (e) {
      return false
    }
  }
  set isValid(valid) {
    this.isValid = valid
  }
}
