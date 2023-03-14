import { IForm } from './interfaces'
import { v4 } from 'uuid'
import { randomUUID } from 'expo-crypto'

export function notNullOrUndefined(value: any): boolean {
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

export function fieldGetter<FormInstance>(form: IForm<FormInstance>, name: string) {
  return form.field[name as keyof FormInstance]
}

export const getRandomUuid = () => {
  try {
    return v4()
  } catch {
    //we're in react-native land
    return randomUUID()
  }
}
