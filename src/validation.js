/**
 * @module       validation
 * @description  Helper functions for model field validation.
 *
 * @author  William Huster <william@thinknimble.com>
 */
export default {
  notNullOrUndefined,
  isNumber,
  NumberValidator,
  MustMatchValidator,
}

/**
 * Validator base class that other class-based validators will extend from.
 */
class Validator {
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
    if (!Number.isInteger(value)) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}
export class MustMatchValidator extends Validator {
  constructor({ message = 'Value must match', code = 'mustMatch', matcher = null } = {}) {
    super({ message, code })
    this._matcher = matcher
  }
  get matchingVal() {
    return this._matcher.value
  }

  call(value) {
    //this.matchingVal = extraArgs
    if (this.matchingVal && this.matchingVal !== value) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}

export class RequiredValidator extends Validator {
  constructor({ message = 'This is a required field', code = 'required' }) {
    super({ message, code })
  }
  call(value) {
    if (typeof value === 'object') {
      throw new Error('Invalid value supplied')
    }
    if (value.length < this.minLength) {
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
    if (typeof value === 'object') {
      throw new Error('Invalid value supplied')
    }
    if (value.length < this.minLength) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}

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
