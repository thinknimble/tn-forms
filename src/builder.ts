// I want to get a very basic version of this working and then we can start working on adding more and more functionality
// There are some methods and stuff in the original form class that I am not fully sure how useful they are for current users. From my use of the library most of them seem to be unnecessary. I will try to keep the API as simple as possible and only add features that are being used currently in the repos. The previous form will continue to live for sure but I want to get this exposed so that we can start tinkering with it.

import { FormField, FormFieldZod } from './forms'
import { IFormFieldZod, IFormFieldZodCreate } from './interfaces'

/**
 * A v2 of tn-forms that is based on a builder pattern and allows for better field discoverability and type safety
 */
export class FormBuilder<T extends Record<string, IFormFieldZod<any, any>> = {}> {
  fields: T = {} as T

  constructor(fields: T = {} as T) {
    this.fields = fields
  }

  addField = <TName extends string, TField extends IFormFieldZodCreate<any, TName>>(
    field: TField,
  ) => {
    this.fields = {
      ...this.fields,
      [field.name]: FormFieldZod.create(field),
    }
    return this as FormBuilder<T & Record<TField['name'], IFormFieldZod<TField['value'], TName>>>
  }

  setFieldValue<TFieldName extends keyof T>(fieldName: TFieldName, value: T[TFieldName]['value']) {
    this.fields[fieldName].value = value
  }

  replicate = () => new FormBuilder(this.fields)

  // addFormLevelValidator<TFieldName extends keyof T>(
  //   fieldName: TFieldName,
  //   validator: IFormLevelValidator,
  // ) {
  //   const currentField = this.fields[fieldName]
  //   const newValidator = validator
  //   newValidator.setMatchingField(this.fields)
  //   if (this.fields[fieldName] instanceof FormField) {
  //     currentField.addValidator(newValidator)
  //   }
  //   return this
  // }

  /**
   * Check all the validators on the fields.
   */
  validate() {
    for (const f of Object.values(this.fields)) {
      if (f instanceof FormField) {
        f.validate()
      }
    }
    return this
  }

  //TODO: This still has the same problem than the original tn-forms. We have no proper way of displaying the right type with the current system of validators. I'm thinking about moving away from these validators and instead provide a zod-like validators system where we just use either parse or safe parse and we get the valid value for real and that would be runtime and type checked.
  get value() {
    return Object.fromEntries(Object.entries(this.fields).map(([k, v]) => [k, v.value])) as {
      [K in keyof T]: T[K]['value']
    }
  }
}

export const createForm = () => new FormBuilder()
