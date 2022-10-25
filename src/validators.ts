import { IDynamicFormValidators, IValidator, IFormLevelValidator, IForm } from './interfaces'
import * as EmailValidatorObj from 'email-validator'
import { DateTime } from 'luxon'
import { notNullOrUndefined, isNumber, isNumberOrFloat } from './utils'

export default class Validator<T = any> implements IValidator<T> {
  /**
   * Crete an instance of the validator.
   * @param {string} message - The error message to return if validation fails.
   * @param {string} code - The code to return with the thrown Error if validation fails.
   */
  message: string = 'Invalid Value'
  code: string = 'invalid_validator'
  constructor({ message = 'Invalid value', code = 'invalid' } = {}) {
    this.message = message
    this.code = code
  }

  /**
   * Perform validation on a given value.
   * @param {string|number|Array|Object} value - The error message to return if validation fails.
   */
  call(value: T) {
    throw new Error('Validator cannot be used directly, it must be overwritten in a subclass')
  }
}

export class RequiredValidator extends Validator {
  constructor({ message = 'This is a required field', code = 'required' } = {}) {
    super({ message, code })
  }
  call(value: any) {
    if (!notNullOrUndefined(value)) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    } else if (Array.isArray(value) && !value.length) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    } else if (!value.toString().length) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}

export class MinLengthValidator extends Validator {
  minLength: number

  constructor({
    message = 'Must meet minimum length requirements',
    code = 'minLength',
    minLength = 10,
  } = {}) {
    super({ message, code })
    this.minLength = minLength
  }

  call(value: any) {
    new RequiredValidator({ message: this.message, code: this.code }).call(value)
    if (!value || value.toString().length < this.minLength) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}

export class MustMatchValidator extends Validator {
  matcher: string | null
  #matchingField: any

  constructor({ message = 'Value must match', code = 'mustMatch', matcher = '' } = {}) {
    super({ message, code })
    this.matcher = matcher
    // if (form) {
    //   this.#matchingField = form.field[this.matcher]
    // } else {
    //   this.#matchingField = null
    // }
  }

  setMatchingField(form: IForm<any>) {
    if (this.matcher && form.field[this.matcher]) {
      this.#matchingField = form.field[this.matcher]
      return
    }
    throw new Error('Matching Field does not exist on form')
  }

  get matchingVal() {
    return this.#matchingField ? this.#matchingField.value : null
  }

  call(value: any) {
    if (this.matchingVal !== value) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}

export class EmailValidator extends Validator {
  constructor({ message = 'Please Enter a Valid Email', code = 'invalidEmail' } = {}) {
    super({ message, code })
  }

  call(value: any) {
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
  constructor({ message = 'Must meet minimum date', code = 'minDate', min = new Date() } = {}) {
    super({ message, code })
    this.min = min
  }

  call(value: any) {
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
        JSON.stringify({ code: this.code, message: 'Please enter a valid Date for the maximum' }),
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
  constructor({ message = 'Must meet minimum date', code = 'maxDate', max = new Date() } = {}) {
    super({ message, code })
    this.max = max
  }

  call(value: any) {
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

export class MinimumValueValidator<integer> extends Validator<integer> {
  min: number
  constructor({ message = 'Must meet minimum value', code = 'invalidMinValue', min = 0 } = {}) {
    super({ message, code })
    this.min = min
  }

  call(value: integer | null) {
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
  constructor({ message = 'Must meet minimum value', code = 'invalidMaxValue', max = 10 } = {}) {
    super({ message, code })
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
    pattern = /./,
  } = {}) {
    super({ message, code })
    this.pattern = typeof pattern == 'string' ? new RegExp(pattern) : pattern
  }
  call(value: any) {
    if (!notNullOrUndefined(value)) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    } else if (typeof value != 'string' && typeof value != 'number') {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    } else if (!this.pattern.test(value as string)) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}

export class UrlValidator extends PatternValidator {
  constructor({ message = 'Please enter a valid url', code = 'invalidUrl' } = {}) {
    let pattern =
      /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?$/
    super({ message, code, pattern })
  }
}
