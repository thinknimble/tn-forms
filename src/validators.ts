import * as EmailValidatorObj from 'email-validator'
import { isPossiblePhoneNumber } from 'libphonenumber-js'
import { DateTime } from 'luxon'
import { IFormLevelValidator, IValidator } from './interfaces'
import { isNumberOrFloat, notNullOrUndefined } from './utils'

export class Validator<T = any> implements IValidator<T> {
  /**
   * Crete an instance of the validator.
   * @param {string} message - The error message to return if validation fails.
   * @param {string} code - The code to return with the thrown Error if validation fails.
   */
  message: string = 'Invalid Value'
  code: string = 'invalid_validator'
  isRequired: boolean = true
  constructor({ message = 'Invalid value', code = 'invalid', isRequired = true } = {}) {
    this.message = message
    this.code = code
    this.isRequired = isRequired
  }

  get enableValidate() {
    return this.isRequired
  }

  /**
   * Perform validation on a given value.
   * @param {string|number|Array|Object} value - The error message to return if validation fails.
   */
  call(value: T) {
    throw new Error('Validator cannot be used directly, it must be overwritten in a subclass')
  }
}

export class FormLevelValidator<T = any> extends Validator<T> implements IFormLevelValidator {
  matcher: string | null
  private _matchingField: any

  constructor({
    message = 'Value must match',
    code = 'mustMatch',
    isRequired = true,
    matcher = '',
  } = {}) {
    super({ message, code, isRequired })
    this.matcher = matcher
  }

  setMatchingField(formFields: Record<string, any>) {
    if (this.matcher && formFields[this.matcher]) {
      this._matchingField = formFields[this.matcher]
      return
    }
    throw new Error('Matching Field does not exist on form')
  }

  get matchingVal() {
    return this._matchingField ? this._matchingField.value : null
  }
}

export class RequiredValidator<T> extends Validator<T> {
  constructor({ message = 'This is a required field', code = 'required', isRequired = true } = {}) {
    super({ message, code, isRequired })
  }
  call(value: T) {
    if (!this.enableValidate && !notNullOrUndefined(value)) {
      return
    }
    if (!notNullOrUndefined(value)) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
    if (Array.isArray(value) && !value.length) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
    if (value && !value.toString().length) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}

export class MinLengthValidator<T> extends Validator<T> {
  minLength: number

  constructor({
    message = 'Must meet minimum length requirements',
    code = 'minLength',
    isRequired = true,
    minLength = 10,
  } = {}) {
    super({ message, code, isRequired })
    this.minLength = minLength
  }

  call(value: T) {
    if (!this.enableValidate && !notNullOrUndefined(value)) {
      return
    }
    new RequiredValidator<T>({ message: this.message, code: this.code }).call(value)
    if (!value || value.toString().length < this.minLength) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}

export class MustMatchValidator extends FormLevelValidator implements IFormLevelValidator {
  call(value: any) {
    if (!this.enableValidate && !notNullOrUndefined(value)) {
      return
    }
    if (this.matchingVal !== value) {
      throw new Error(
        JSON.stringify({
          code: this.code,
          message: `${this.message}`,
        }),
      )
    }
  }
}

export class EmailValidator extends Validator {
  constructor({
    message = 'Please Enter a Valid Email',
    code = 'invalidEmail',
    isRequired = true,
  } = {}) {
    super({ message, code, isRequired })
  }

  call(value: any) {
    if (!this.enableValidate && !notNullOrUndefined(value)) {
      return
    }
    try {
      const res = EmailValidatorObj.validate(value)
      if (!res) {
        throw new Error(JSON.stringify({ code: this.code, message: this.message }))
      }
    } catch {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}

export class MinDateValidator extends Validator {
  min: any
  constructor({
    message = 'Must meet minimum date',
    code = 'minDate',
    isRequired = true,
    min = new Date(),
  } = {}) {
    super({ message, code, isRequired })
    this.min = min
  }

  call(value: any) {
    if (!this.enableValidate && !notNullOrUndefined(value)) {
      return
    }
    if (!value) {
      throw new Error(
        JSON.stringify({
          code: this.code,
          message: `Please enter a valid date`,
        }),
      )
    }
    let min
    let compare
    try {
      min = DateTime.fromJSDate(this.min)
    } catch (e) {
      throw new Error(
        JSON.stringify({ code: this.code, message: 'Please enter a valid Date for the minimum' }),
      )
    }
    try {
      compare = DateTime.fromJSDate(value)
    } catch (e) {
      throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date' }))
    }
    if (!min || !min.isValid) {
      throw new Error(
        JSON.stringify({ code: this.code, message: 'Please enter a valid Date for the minimum' }),
      )
    }
    if (!compare || !compare.isValid) {
      throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date' }))
    }

    if (compare.startOf('day') < min.startOf('day')) {
      throw new Error(
        JSON.stringify({
          code: this.code,
          message: `Please enter a date greater than ${DateTime.fromJSDate(min).toFormat('D')}`,
        }),
      )
    }
  }
}

export class MaxDateValidator extends Validator {
  max: any
  constructor({
    message = 'Must meet minimum date',
    code = 'maxDate',
    isRequired = true,
    max = new Date(),
  } = {}) {
    super({ message, code, isRequired })
    this.max = max
  }

  call(value: any) {
    if (!this.enableValidate && !notNullOrUndefined(value)) {
      return
    }
    if (!value) {
      throw new Error(
        JSON.stringify({
          code: this.code,
          message: `Please enter a valid date`,
        }),
      )
    }
    let max
    let compare
    try {
      max = DateTime.fromJSDate(this.max)
    } catch (e) {
      throw new Error(
        JSON.stringify({ code: this.code, message: 'Please enter a valid Date for the maximum' }),
      )
    }
    try {
      compare = DateTime.fromJSDate(value)
    } catch (e) {
      throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date' }))
    }
    if (!max || !max.isValid) {
      throw new Error(
        JSON.stringify({ code: this.code, message: 'Please enter a valid Date for the maximum' }),
      )
    }
    if (!compare || !compare.isValid) {
      throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date' }))
    }
    if (DateTime.fromJSDate(value).startOf('day') > DateTime.fromJSDate(this.max).startOf('day')) {
      throw new Error(
        JSON.stringify({
          code: this.code,
          message: `Please enter a date greater than ${DateTime.fromJSDate(this.max).toFormat(
            'D',
          )}`,
        }),
      )
    }
  }
}

export class DynamicMinDateValidator extends FormLevelValidator implements IFormLevelValidator {
  call(value: any) {
    if (!this.enableValidate && !notNullOrUndefined(value)) {
      return
    }

    new MinDateValidator({
      message: this.message,
      code: this.code,
      min: this.matchingVal ? new Date(this.matchingVal) : undefined,
      isRequired: this.enableValidate,
    }).call(value ? new Date(value) : null)
  }
}

export class MinimumValueValidator extends Validator {
  min: number
  constructor({
    message = 'Must meet minimum value',
    code = 'invalidMinValue',
    isRequired = true,
    min = 0,
  } = {}) {
    super({ message, code, isRequired })
    this.min = min
  }

  call(value: number | null) {
    if (!notNullOrUndefined(value) || !isNumberOrFloat(value)) {
      throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Number' }))
    } else {
      if (Number(value) < this.min) {
        throw new Error(JSON.stringify({ code: this.code, message: this.message }))
      }
    }
  }
}
export class MaximumValueValidator extends Validator {
  max: number
  constructor({
    message = 'Must meet minimum value',
    code = 'invalidMaxValue',
    isRequired = true,
    max = 10,
  } = {}) {
    super({ message, code, isRequired })
    this.max = max
  }

  call(value: any) {
    if (!notNullOrUndefined(value) || !isNumberOrFloat(value)) {
      throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Number' }))
    } else {
      if (Number(value) > this.max) {
        throw new Error(JSON.stringify({ code: this.code, message: this.message }))
      }
    }
  }
}

export class PatternValidator extends Validator {
  pattern: RegExp
  constructor({
    message = 'Value does not match pattern',
    code = 'invalidPattern',
    isRequired = true,
    pattern = /./,
  } = {}) {
    super({ message, code, isRequired })
    this.pattern = typeof pattern == 'string' ? new RegExp(pattern) : pattern
  }
  call(value: any) {
    if (!value && !this.isRequired) return
    if (!notNullOrUndefined(value)) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
    if (typeof value != 'string' && typeof value != 'number') {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
    if (!this.pattern.test(value as string)) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}

export class UrlValidator extends PatternValidator {
  constructor({
    message = 'Please enter a valid url',
    code = 'invalidUrl',
    isRequired = true,
  } = {}) {
    let pattern =
      /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?$/
    super({ message, code, isRequired, pattern })
  }
}
export class TrueFalseValidator extends Validator {
  truthy: boolean
  constructor({
    message = 'Invalid option',
    code = 'invalidOption',
    isRequired = true,
    truthy = true,
  } = {}) {
    message = `Value should be ${truthy}`
    super({ message, code, isRequired })
    this.truthy = truthy
  }
  call(value: any) {
    if (!notNullOrUndefined(value)) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    } else if (!!value !== this.truthy) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}

export class PhoneNumberValidator extends Validator {
  constructor({
    message,
    code,
    isRequired,
  }: {
    message: string
    code: string
    isRequired: boolean
  }) {
    super({ message, code, isRequired })
  }

  call(value: string) {
    if (!this.enableValidate && !notNullOrUndefined(value)) return
    const isValid = isPossiblePhoneNumber(value)
    if (!isValid) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}
