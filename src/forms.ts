import {
  FormFieldsRecord,
  FormValue,
  IDynamicFormValidators,
  IForm,
  IFormArray,
  IFormArrayKwargs,
  IFormField,
  IFormFieldError,
  IFormFieldKwargs,
  IFormLevelValidator,
  IValidator,
  OptionalFormArgs,
  TArrayOfFormFieldValues,
  TFormFieldTypeCombos,
  TFormFieldTypeOpts,
  TFormInstanceFields,
} from './interfaces'

import { isFormArray, isFormField } from './utils'

function setFormFieldValueFromKwargs<T, TName extends string = ''>(
  name: string,
  field: FormField<T, TName>,
  valueFromKwarg = undefined,
): IFormField<T, TName> {
  field.value = valueFromKwarg != undefined ? valueFromKwarg : field.value
  field.name = name as TName
  return field
}

function fields<T>(fields: TArrayOfFormFieldValues<T>): TFormFieldTypeCombos<T> {
  let formArrays: IFormArray<any, any>[] = []
  let formFields: IFormField<unknown>[] = []
  for (let i = 0; i < fields.length; i++) {
    const currentField = fields[i]
    currentField instanceof FormArray ? formArrays.push(currentField) : null
    currentField instanceof FormField ? formFields.push(currentField) : null
  }
  return {
    formArrays,
    formFields,
  } as TFormFieldTypeCombos<T>
}

export class FormField<T = string, TName extends string = ''> implements IFormField<T, TName> {
  private _value: T | undefined = undefined
  private _errors: IFormFieldError[] = []
  private _validators: IValidator<T>[] = []
  name: TName
  private _placeholder: string = ''
  type: string = ''
  id: string
  private _isTouched: boolean
  private _label: string = ''

  /**
   * For type-safety sake, please pass value and name, even if value is `null`.
   * Not passing value will result in it being empty string which could cause issues if you don't expect it.
   */
  constructor({
    name = '' as TName,
    validators = [],
    errors = [],
    value,
    placeholder = '',
    type = 'text',
    id = null,
    isTouched = false,
    label = '',
  }: IFormFieldKwargs<T, TName> = {}) {
    this.value = (
      Array.isArray(value)
        ? [...value]
        : value !== null && typeof value == 'object'
        ? { ...value }
        : value === undefined
        ? ''
        : value
    ) as T
    this.name = (name ? name : (String(Date.now()))) as TName
    this.errors = errors
    this.validators = validators
    this.placeholder = placeholder
    this.type = type
    this.id = id ? id : name ? name : 'field' + '-' + String(Date.now())
    this._isTouched = isTouched
    this.label = label
  }
  static create<TValue = string, TName extends string = ''>(
    data: IFormFieldKwargs<TValue, TName> = {},
  ): FormField<TValue, TName> {
    return new FormField<TValue, TName>(data)
  }
  validate() {
    let errors: IFormFieldError[] = []
    this._validators.forEach((validator) => {
      if (validator) {
        try {
          validator.call(this._value)
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
    this.errors = errors
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
    return this._errors
  }
  set errors(error) {
    this._errors = error
  }
  get placeholder() {
    return this._placeholder
  }
  set placeholder(placeholder) {
    this._placeholder = placeholder
  }
  get label() {
    return this._label
  }
  set label(label) {
    this._label = label
  }

  set value(value) {
    this._value = value
  }
  get value() {
    return this._value
  }
  get validators() {
    return this._validators
  }
  set validators(validator) {
    this._validators = validator
  }

  get isTouched(): boolean {
    return this._isTouched
  }
  set isTouched(touched: boolean) {
    this._isTouched = touched
  }

  addValidator(validator: IValidator<T>) {
    let validators = [...this.validators, validator]
    this.validators = validators
  }
  replicate() {
    return new FormField<T, TName>({
      errors: [...this.errors],
      id: this.id,
      isTouched: this.isTouched,
      name: this.name,
      placeholder: this.placeholder,
      type: this.type,
      validators: [...this.validators],
      value: this.value,
    })
  }
}

export class FormArray<T extends FormFieldsRecord> implements IFormArray<T> {
  private _groups: IForm<T>[] = []
  private _FormClass: { new (): Form<T> } | null = null
  name: string = ''

  constructor({ name = '', groups = [], FormClass = null }: IFormArrayKwargs<T>) {
    this.name = name
    this._FormClass = FormClass
    groups && Array.isArray(groups) && groups.length ? groups.map((group) => this.add(group)) : []
    if (!groups.length && !FormClass) {
      throw new Error(
        JSON.stringify(
          'Form type must be specified either add a new instance of the form or explicitly declare type',
        ),
      )
    }
    if (!this._FormClass && groups.length) {
      //@ts-ignore
      this._FormClass = groups[0].constructor
    }
  }
  get value() {
    return this._groups.map((form: IForm<T>) => {
      return form.value
    })
  }
  get FormClass(): any {
    return this._FormClass
  }
  get groups(): IForm<T>[] {
    return this._groups
  }
  set groups(group) {
    this._groups = group
  }

  add(group: IForm<T> | null = this._FormClass ? new this._FormClass() : null) {
    this.groups = group ? [...this.groups, group] : [...this.groups]
  }
  remove(index: number) {
    this.groups.splice(index, 1)
    //this.groups = this.groups
  }
  replicate() {
    return new FormArray({
      groups: this.groups.map((g) => g.replicate()),
      name: this.name,
      FormClass: this.FormClass,
    })
  }
}

export class Form<T extends FormFieldsRecord> implements IForm<T> {
  private _fields = {} as TFormFieldTypeOpts<T>
  private _dynamicFormValidators: IDynamicFormValidators = {}
  private _errors = {}

  constructor(kwargs: OptionalFormArgs<T> = {}) {
    /**
     * `this.constructor` has the static fields as keys. So here we're iterating over them to get the values from the child class and store them in the #fields private class field
     */
    for (const prop in this.constructor) {
      //@ts-expect-error cursed iteration on static fields
      if (this.constructor[prop] instanceof FormField) {
        //@ts-expect-error not sure how to type this correctly as of now
        this._fields[prop] = this.copy(this.constructor[prop])
      }
      //@ts-expect-error cursed iteration on static unknown fields
      if (this.constructor[prop] instanceof FormArray) {
        //@ts-expect-error not sure how to type this correctly as of now
        this._fields[prop] = this.copyArray(this.constructor[prop])
      }
      if (prop == 'dynamicFormValidators') {
        //@ts-expect-error cursed iteration on static fields
        this._dynamicFormValidators = this.constructor[prop]
      }
    }

    /**
     * Iterates on keys of #fields.
     */
    for (const fieldName in this._fields) {
      const fieldNameKey = fieldName
      const field = this._fields[fieldNameKey]
      /**
       * need to do this since we cannot make `kwargs` and `fieldNameKey` to match their types. We know they will have the same keys but could not find a direct way of match them at compile time
       */
      const unknownFieldNameKey: unknown = fieldName
      const kwargsFieldNameKey = unknownFieldNameKey as keyof typeof kwargs

      if (field instanceof FormField) {
        setFormFieldValueFromKwargs(fieldName, field, kwargs[kwargsFieldNameKey])
        // I think this is ts-ignored because this is where we rely on the static fields of the child form class
        //@ts-ignore
        this[fieldName] = field
      } else if (field instanceof FormArray) {
        if (kwargs[kwargsFieldNameKey] && Array.isArray(kwargs[kwargsFieldNameKey])) {
          for (let index = 0; index < kwargs[kwargsFieldNameKey].length; index++) {
            if (index <= field.groups.length - 1) {
              const group = field.groups[index]
              let valuesObj = kwargs[kwargsFieldNameKey][index]
              Object.keys(valuesObj).forEach((k: string) => {
                if (group) group.field[k].value = valuesObj[k]
              })
            } else {
              let valuesObj = kwargs[kwargsFieldNameKey][index]
              field.add(new field.FormClass(valuesObj))
            }
          }
        }
        field.name = fieldName
        //@ts-ignore
        this[fieldName] = field
      }
    }
    for (const [_field, _validators] of Object.entries(this._dynamicFormValidators)) {
      for (let i = 0; i < _validators.length; i++) {
        const validator = _validators[i]
        if (validator) {
          this.addFormLevelValidator(_field, validator)
        }
      }
    }
  }

  static create<T extends FormFieldsRecord>(kwargs: OptionalFormArgs<T> = {}): Form<T> {
    return new this(kwargs)
  }
  replicate(): Form<T> {
    // ALERT there is a bug here for FormArrays the referenc is still attached PB
    let current = this

    //@ts-ignore
    let newForm = new this.constructor(this.value) as Form<T>

    const formFieldOpts: unknown = Object.fromEntries(
      newForm.fields
        .map((f) => {
          if (isFormField(f)) {
            let originalField = this.field[f.name]
            // originalField should be a IFormField (else the code below would throw)
            if (!isFormField(originalField)) return undefined

            f.errors = [...originalField.errors]
            f.isTouched = originalField.isTouched
            return [f.name, f]
          }
          if (!(f instanceof FormArray)) {
            console.error('f should either be FormField or FormArray')
            return
          }
          let formGroups = f.groups.map((fg: IForm<T>, i: number) => {
            let group = fg.replicate()
            return group
          })
          f.groups = formGroups
          return [f.name, f]
        })
        .filter(Boolean) as [name: string, f: any],
    )
    newForm._fields = formFieldOpts as TFormFieldTypeOpts<T>
    newForm.errors = current.errors
    return newForm
  }

  get field(): TFormInstanceFields<T> {
    let fields: any = {}
    for (let index = 0; index < this.fields.length; index++) {
      const field = this.fields[index]
      if (field instanceof FormField || field instanceof FormArray) fields[field.name] = field
    }

    return fields
  }
  get fields(): TArrayOfFormFieldValues<T> {
    const result = Object.values(this._fields) as TArrayOfFormFieldValues<T>
    return result
  }
  copy<FormFieldType = any>(opts = {}): IFormField<FormFieldType> {
    return new FormField(opts)
  }

  copyArray<T extends FormFieldsRecord>(opts: FormArray<T>) {
    let groups = opts.groups.map((g) => {
      return g.replicate()
    })
    return new FormArray({
      ...opts,
      name: opts.name,
      FormClass: opts.FormClass,
      groups: [...groups],
    })
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
  addFormLevelValidator(fieldName: string, validator: IFormLevelValidator) {
    this._handleNoFieldErrors(fieldName)
    const currentField = this.field[fieldName]
    if (isFormArray(currentField)) {
      throw new Error(
        JSON.stringify({
          code: 'invalid_operation',
          message: `${fieldName} is a form array please attach validator to child form${fieldName} field`,
        }),
      )
    }
    const newValidator = validator
    newValidator.setMatchingField(this)

    if (this.field[fieldName] instanceof FormField && currentField) {
      currentField.addValidator(newValidator)
    }
  }
  addValidator(fieldName: string, validator: IValidator) {
    const currentField = this.field[fieldName]
    if (isFormArray(currentField)) {
      throw new Error(
        JSON.stringify({
          code: 'invalid_operation',
          message: `${fieldName} is a form array please attach validator to child form${fieldName} field`,
        }),
      )
    }
    this._handleNoFieldErrors(fieldName)
    currentField && currentField.addValidator(validator)
  }
  validate() {
    this.fields.forEach((f) => {
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
        if (!acc[curr.name]) {
          acc[curr.name] = invalidGroups
          return acc
        }
        acc[curr.name] = [...(acc[curr.name] ?? []), invalidGroups]
        return acc
      }
      return acc
    }, {} as Record<string, any[]>)

    let formFieldErrors = formFields.reduce((acc, curr) => {
      if (curr.isValid) return acc
      if (!acc[curr.name]) {
        acc[curr.name] = curr.errors
        return acc
      }
      acc[curr.name] = [...(acc[curr.name] ?? []), curr.errors]
      return acc
    }, {} as Record<string, any[]>)
    return { ...this._errors, ...formFieldErrors, ...formArrayErrors }
  }
  set errors(errs) {
    this._errors = errs
  }
  get value(): FormValue<T> {
    let { formArrays, formFields } = fields(this.fields)
    let formFieldValues = formFields.reduce<FormValue<T>>((acc, curr) => {
      //@ts-expect-error not sure how to type this.- FormValue<T> generic prevents this to be easily typed
      acc[curr.name] = curr.value
      return acc
    }, {} as FormValue<T>)

    let formArrayValues = formArrays.reduce<FormValue<T>>((acc, curr) => {
      //@ts-expect-error not sure how to type this.- FormValue<T> generic prevents this to be easily typed
      if (!acc[curr.name]) {
        //@ts-expect-error not sure how to type this.- FormValue<T> generic prevents this to be easily typed
        acc[curr.name] = curr.groups.map((formGroup) => formGroup.value)
      } else {
        //@ts-expect-error not sure how to type this.- FormValue<T> generic prevents this to be easily typed
        acc[curr.name] = [...acc[curr.name], curr.groups.map((formGroup) => formGroup.value)]
      }
      return acc
    }, {} as FormValue<T>)
    return { ...formFieldValues, ...formArrayValues }
  }
  get isValid(): boolean {
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
