import { FormFieldsRecord, IForm, IFormArray, IFormField } from './interfaces'
export declare function notNullOrUndefined(value: any): boolean
export declare function isNumber(message?: string): (value: any) => void
export declare function isNumberOrFloat(value: any): boolean
export declare function fieldGetter<FormInstance extends FormFieldsRecord>(
  form: IForm<FormInstance>,
  name: string,
): import('./interfaces').TFormInstanceFields<FormInstance>[keyof FormInstance]
export declare const isFormArray: (input: unknown) => input is IFormArray<any, any>
export declare const isFormField: (input: unknown) => input is IFormField<any, ''>
//# sourceMappingURL=utils.d.ts.map
