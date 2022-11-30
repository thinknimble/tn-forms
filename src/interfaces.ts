export interface IDynamicFormValidators {
  [key: string]: IFormLevelValidator[]
}
export interface IFormLevelValidator extends IValidator {
  setMatchingField(form: IForm<any>): void
}

export interface IValidator<T = any> {
  message: string
  code: string
  call(value: T): void
}

export type TFormInstance<T> = {
  [P in keyof T]: T[P]
}

export interface IFormArrayKwargs<T> {
  name: string
  groups: IForm<T>[]
  FormClass?: any
}
export interface IFormArray<T> {
  name: string
  get FormClass(): any
  get value(): any[]
  get groups(): IForm<T>[]
  set groups(group: IForm<T>[])
  add(group: IForm<T>): void
  remove(index: number): void
}

export interface IForm<T> {
  get field(): TFormInstanceFields<T>
  get fields(): TFormFieldTypeOpts<T>[]
  get errors(): any[]
  set errors(errors: any[])
  get value(): FormValue<T>
  get isValid(): boolean
  set isValid(valid: boolean)

  copy(value: IFormField<T>): IFormField<T>
  _handleNoFieldErrors(fieldName: string): any
  addValidator(fieldName: string, validator: IValidator): any
  validate(): void
  replicate(): IForm<T>
}
export type TForm<T> = {
  get field(): TFormInstanceFields<T>
  get fields(): TFormFieldTypeOpts<T>[]
  get errors(): any[]
  set errors(errors: any[])
  get value(): FormValue<T>
  get isValid(): boolean
  set isValid(valid: boolean)

  copy(value: IFormField<T>): IFormField<T>
  _handleNoFieldErrors(fieldName: string): any
  addValidator(fieldName: string, validator: IValidator): any
  validate(): void
  replicate(): IForm<T>
} & T

export interface IFormFieldError {
  code: string
  message: string
}

export interface IFormFieldKwargs {
  name?: string
  validators?: IValidator[]
  errors?: IFormFieldError[]
  value?: any
  id?: string | null
  placeholder?: string
  type?: string
  isTouched?: boolean
  label?: string
}

export interface IFormField<T = any> {
  value: T
  errors: IFormFieldError[]
  validators: IValidator[]
  name: string
  placeholder: string
  type: string
  id: string
  label: string

  get isValid(): boolean
  set isValid(value: boolean)
  validate(): void
  get isTouched(): boolean
  set isTouched(touched: boolean)
}

export interface IFormInstance {
  [key: string]: IFormField
}

export type TFormInstanceFields<T> = {
  [P in keyof T]: T[P]
}

export type TFormFieldTypeCombos<T> = {
  formArrays: IFormArray<T>[]
  formFields: IFormField[]
}

export type TFormFieldTypeOpts<T = any> = IFormField | IFormArray<T>

export type FormTypeUnion<T> = IFormField<T> & Record<keyof T, IFormField['value']>

export type PickByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? Key : never }[keyof T]
>

export type PickFormValue<T> = PickByValue<T, IFormField | IFormArray<any>>

// export type FormArgs<T> = {
//   [Property in keyof PickFormValue<T>]: T[Property] extends IFormField | IFormArray<any>
//     ? T[Property]
//     : never
// }
export type FormValue<T> = {
  [Property in keyof PickFormValue<T>]: T[Property] extends IFormField | IFormArray<any>
    ? T[Property]['value']
    : never
}
export type OptionalFormArgs<T> = Partial<FormValue<T>>
