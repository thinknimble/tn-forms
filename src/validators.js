export default class Validator {
  /**
   * Crete an instance of the validator.
   * @param {string} message - The error message to return if validation fails.
   * @param {string} code - The code to return with the thrown Error if validation fails.
   */
  constructor({ message = 'Invalid value', code = 'invalid' } = {}) {
    Object.assign(this, { message, code })
  }

  /**
   * Perform validation on a given value.
   * @param {string|number|Array|Object} value - The error message to return if validation fails.
   */
  call(value) {
    throw new Error('Validator cannot be used directly, it must be overwritten in a subclass')
  }
}

export class NumberValidator extends Validator {
  constructor({ message = 'Value must be a number', code = 'invalid' } = {}) {
    super({ message, code })
  }

  call(value) {
    if (!notNullOrUndefined(value) || !Number.isInteger(parseFloat(value))) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}
export class MustMatchValidator extends Validator {
  constructor({
    message = 'Value must match',
    code = 'mustMatch',
    matcher = null,
    form = null,
  } = {}) {
    super({ message, code })
    this.matcher = matcher
    if (form) {
      this._matchingField = form.field[this.matcher]
    } else {
      this._matchingField = null
    }
  }

  get matchingVal() {
    return this._matchingField ? this._matchingField.value : null
  }

  call(value) {
    //this.matchingVal = extraArgs
    if (this.matchingVal !== value) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}

export class RequiredValidator extends Validator {
  constructor({ message = 'This is a required field', code = 'required' } = {}) {
    super({ message, code })
  }
  call(value) {
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
  constructor({
    message = 'Must meet minimum length requirements',
    code = 'minLength',
    minLength = 10,
  } = {}) {
    super({ message, code })
    this.minLength = minLength
  }

  call(value) {
    new RequiredValidator({ message: this.message, code: this.code }).call(value)
    if (!value || value.toString().length < this.minLength) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}
export class EmailValidator extends Validator {
  constructor({ message = 'Please Enter a Valid Email', code = 'invalidEmail' } = {}) {
    super({ message, code })
  }

  call(value) {
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
  constructor({ message = 'Must meet minimum date', code = 'minDate', min = moment() } = {}) {
    super({ message, code })
    this.min = min
  }

  call(value) {
    if (!value) {
      throw new Error(
        JSON.stringify({
          code: this.code,
          message: `Please enter a valid date`,
        }),
      )
    }
    try {
      moment(this.min)
    } catch (e) {
      console.log(e)
      throw new Error(
        JSON.stringify({ code: this.code, message: 'Please enter a valid Date for the minimum' }),
      )
    }
    try {
      moment(value)
    } catch (e) {
      throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date' }))
    }
    if (moment(value).isBefore(moment(this.min), 'day')) {
      throw new Error(
        JSON.stringify({
          code: this.code,
          message: `Please enter a date greater than ${moment(this.min).format('MM-DD-YYYY')}`,
        }),
      )
    }
  }
}

import * as EmailValidatorObj from 'email-validator'
import moment from 'moment'

export class MaxDateValidator extends Validator {
  constructor({ message = 'Must meet minimum date', code = 'maxDate', max = moment() } = {}) {
    super({ message, code })
    this.max = max
  }

  call(value) {
    if (!value) {
      throw new Error(
        JSON.stringify({
          code: this.code,
          message: `Please enter a valid date`,
        }),
      )
    }
    try {
      moment(this.max)
    } catch (e) {
      throw new Error(
        JSON.stringify({ code: this.code, message: 'Please enter a valid Date for the minimum' }),
      )
    }
    try {
      moment(value)
    } catch (e) {
      throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Date' }))
    }
    if (moment(value).isAfter(moment(this.max), 'day')) {
      throw new Error(
        JSON.stringify({
          code: this.code,
          message: `Please enter a date greater than ${moment(this.max).format('MM-DD-YYYY')}`,
        }),
      )
    }
  }
}

export class MinimumValueValidator extends Validator {
  constructor({ message = 'Must meet minimum value', code = 'minValue', min = 0 } = {}) {
    super({ message, code })
    this.min = min
  }

  call(value) {
    if (!value || !Number.isInteger(parseFloat(value))) {
      throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Number' }))
    } else {
      if (value < this.min) {
        throw new Error(JSON.stringify({ code: this.code, message: this.message }))
      }
    }
  }
}
export class MaximumValueValidator extends Validator {
  constructor({ message = 'Must meet minimum value', code = 'maxValue', max = 10 } = {}) {
    super({ message, code })
    this.max = max
  }

  call(value) {
    if (!value || !Number.isInteger(parseFloat(value))) {
      throw new Error(JSON.stringify({ code: this.code, message: 'Please enter a valid Number' }))
    } else {
      if (value > this.max) {
        throw new Error(JSON.stringify({ code: this.code, message: this.message }))
      }
    }
  }
}
export class UrlValidator extends Validator {
    constructor({ message = 'Please enter a valid url', code = 'invalidUrl' } = {}) {
      super({ message, code })
    }
    call(value) {
      if (!value) {
        throw new Error(JSON.stringify({ code: this.code, message: this.message }))
      } else if (typeof value != 'string') {
        throw new Error(JSON.stringify({ code: this.code, message: this.message }))
      } else if (
        !/^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?$/.test(
          value,
        )
      ) {
        throw new Error(JSON.stringify({ code: this.code, message: this.message }))
      }
    }
  }
  
 */
export function notNullOrUndefined(value) {
  return value !== null && typeof value !== 'undefined'
}

export function isNumber(message = 'Value must be a number') {
  return function (value) {
    if (!Number.isInteger(value)) {
      throw new Error(message)
    }
  }
}
