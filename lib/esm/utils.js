import { FormArray, FormField } from './forms'
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
export function isNumberOrFloat(value) {
  let val = Number(value)
  return typeof Number(val) == 'number' && !isNaN(val)
}
export function fieldGetter(form, name) {
  return form.field[name]
}
export const isFormArray = (input) => {
  return input instanceof FormArray
}
export const isFormField = (input) => {
  return input instanceof FormField
}
