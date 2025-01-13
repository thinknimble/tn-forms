import { FormArray, FormField } from './forms'
import { FormFieldsRecord, IForm, IFormArray, IFormField } from './interfaces'

export function notNullOrUndefined(value: any): boolean {
  return value !== null && typeof value !== 'undefined'
}

export function isNumber(message = 'Value must be a number') {
  return function (value: unknown) {
    if (!Number.isInteger(value)) {
      throw new Error(message)
    }
  }
}

export function isNumberOrFloat(value: unknown) {
  let val = Number(value)
  return typeof Number(val) == 'number' && !isNaN(val)
}

export function fieldGetter<FormInstance extends FormFieldsRecord>(
  form: IForm<FormInstance>,
  name: string,
) {
  return form.field[name as keyof FormInstance]
}

export const isFormArray = (input: unknown): input is IFormArray<any> => {
  return input instanceof FormArray
}
export const isFormField = (input: unknown): input is IFormField<any> => {
  return input instanceof FormField
}
