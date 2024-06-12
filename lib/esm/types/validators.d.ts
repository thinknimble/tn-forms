import { IValidator, IFormLevelValidator, IForm } from './interfaces'
export default class Validator<T = any> implements IValidator<T> {
  /**
   * Crete an instance of the validator.
   * @param {string} message - The error message to return if validation fails.
   * @param {string} code - The code to return with the thrown Error if validation fails.
   */
  message: string
  code: string
  isRequired: boolean
  constructor({
    message,
    code,
    isRequired,
  }?: {
    message?: string | undefined
    code?: string | undefined
    isRequired?: boolean | undefined
  })
  get enableValidate(): boolean
  /**
   * Perform validation on a given value.
   * @param {string|number|Array|Object} value - The error message to return if validation fails.
   */
  call(value: T): void
}
export declare class FormLevelValidator<T = any>
  extends Validator<T>
  implements IFormLevelValidator
{
  matcher: string | null
  private _matchingField
  constructor({
    message,
    code,
    isRequired,
    matcher,
  }?: {
    message?: string | undefined
    code?: string | undefined
    isRequired?: boolean | undefined
    matcher?: string | undefined
  })
  setMatchingField(form: IForm<any>): void
  get matchingVal(): any
}
export declare class RequiredValidator extends Validator {
  constructor({
    message,
    code,
    isRequired,
  }?: {
    message?: string | undefined
    code?: string | undefined
    isRequired?: boolean | undefined
  })
  call(value: any): void
}
export declare class MinLengthValidator extends Validator {
  minLength: number
  constructor({
    message,
    code,
    isRequired,
    minLength,
  }?: {
    message?: string | undefined
    code?: string | undefined
    isRequired?: boolean | undefined
    minLength?: number | undefined
  })
  call(value: any): void
}
export declare class MustMatchValidator extends FormLevelValidator implements IFormLevelValidator {
  call(value: any): void
}
export declare class EmailValidator extends Validator {
  constructor({
    message,
    code,
    isRequired,
  }?: {
    message?: string | undefined
    code?: string | undefined
    isRequired?: boolean | undefined
  })
  call(value: any): void
}
export declare class MinDateValidator extends Validator {
  min: any
  constructor({
    message,
    code,
    isRequired,
    min,
  }?: {
    message?: string | undefined
    code?: string | undefined
    isRequired?: boolean | undefined
    min?: Date | undefined
  })
  call(value: any): void
}
export declare class MaxDateValidator extends Validator {
  max: any
  constructor({
    message,
    code,
    isRequired,
    max,
  }?: {
    message?: string | undefined
    code?: string | undefined
    isRequired?: boolean | undefined
    max?: Date | undefined
  })
  call(value: any): void
}
export declare class MinimumValueValidator extends Validator {
  min: number
  constructor({
    message,
    code,
    isRequired,
    min,
  }?: {
    message?: string | undefined
    code?: string | undefined
    isRequired?: boolean | undefined
    min?: number | undefined
  })
  call(value: number | null): void
}
export declare class MaximumValueValidator extends Validator {
  max: number
  constructor({
    message,
    code,
    isRequired,
    max,
  }?: {
    message?: string | undefined
    code?: string | undefined
    isRequired?: boolean | undefined
    max?: number | undefined
  })
  call(value: any): void
}
export declare class PatternValidator extends Validator {
  pattern: RegExp
  constructor({
    message,
    code,
    isRequired,
    pattern,
  }?: {
    message?: string | undefined
    code?: string | undefined
    isRequired?: boolean | undefined
    pattern?: RegExp | undefined
  })
  call(value: any): void
}
export declare class UrlValidator extends PatternValidator {
  constructor({
    message,
    code,
    isRequired,
  }?: {
    message?: string | undefined
    code?: string | undefined
    isRequired?: boolean | undefined
  })
}
export declare class TrueFalseValidator extends Validator {
  truthy: boolean
  constructor({
    message,
    code,
    isRequired,
    truthy,
  }?: {
    message?: string | undefined
    code?: string | undefined
    isRequired?: boolean | undefined
    truthy?: boolean | undefined
  })
  call(value: any): void
}
//# sourceMappingURL=validators.d.ts.map
