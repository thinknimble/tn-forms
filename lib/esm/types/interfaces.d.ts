export interface IDynamicFormValidators {
    [key: string]: IFormLevelValidator[];
}
export interface IFormLevelValidator<T = any> extends IValidator<T> {
    setMatchingField(form: IForm<any>): void;
}
export interface IValidator<T = any> {
    message: string;
    code: string;
    isRequired: boolean;
    get enableValidate(): boolean;
    call(value: T | undefined): void;
}
export type TFormInstance<T> = {
    [P in keyof T]: T[P];
};
export interface IFormArrayKwargs<T> {
    name: string;
    groups: IForm<T>[];
    FormClass?: any;
}
export interface IFormArray<TFormFields, TValue = any> {
    name: string;
    get FormClass(): any;
    get value(): TValue[];
    get groups(): IForm<TFormFields>[];
    set groups(group: IForm<TFormFields>[]);
    add(group: IForm<TFormFields>): void;
    remove(index: number): void;
    replicate(): IFormArray<TFormFields, TValue>;
}
export type TFormFieldTypeOpts<T> = {
    [K in keyof T]: T[K] extends IFormField<infer TField> ? IFormField<TField> : T[K] extends IFormArray<infer TForm, infer TValue> ? IFormArray<TForm, TValue> : never;
};
export type TArrayOfFormFieldValues<T> = TFormFieldTypeOpts<T>[keyof TFormFieldTypeOpts<T>][];
export interface IForm<T> {
    get field(): TFormInstanceFields<T>;
    get fields(): TArrayOfFormFieldValues<T>;
    get errors(): any[];
    set errors(errors: any[]);
    get value(): FormValue<T>;
    get isValid(): boolean;
    set isValid(valid: boolean);
    copy(value: IFormField<T>): IFormField<T>;
    _handleNoFieldErrors(fieldName: string): any;
    addValidator(fieldName: string, validator: IValidator): any;
    validate(): void;
    replicate(): IForm<T>;
}
export type TForm<T> = {
    get field(): TFormInstanceFields<T>;
    get fields(): TFormFieldTypeOpts<T>[];
    get errors(): any[];
    set errors(errors: any[]);
    get value(): FormValue<T>;
    get isValid(): boolean;
    set isValid(valid: boolean);
    copy(value: IFormField<T>): IFormField<T>;
    _handleNoFieldErrors(fieldName: string): any;
    addValidator(fieldName: string, validator: IValidator): any;
    validate(): void;
    replicate(): IForm<T>;
} & T;
export interface IFormFieldError {
    code: string;
    message: string;
}
export interface IFormFieldKwargs {
    name?: string;
    validators?: IValidator[];
    errors?: IFormFieldError[];
    value?: any;
    id?: string | null;
    placeholder?: string;
    type?: string;
    isTouched?: boolean;
    label?: string;
}
export interface IFormField<T = any> {
    value: T | undefined;
    errors: IFormFieldError[];
    validators: IValidator[];
    name: string;
    placeholder: string;
    type: string;
    id: string;
    label: string;
    get isValid(): boolean;
    set isValid(value: boolean);
    validate(): void;
    get isTouched(): boolean;
    set isTouched(touched: boolean);
    replicate(): IFormField<T>;
}
export interface IFormInstance {
    [key: string]: IFormField;
}
export type TFormInstanceFields<T> = {
    [P in keyof T]: T[P];
};
type FormArrayMap<T> = {
    [K in keyof TFormFieldTypeOpts<T>]: TFormFieldTypeOpts<T>[K] extends IFormArray<infer TForm, infer TValue> ? IFormArray<TForm, TValue> : never;
};
type FormFieldMap<T> = {
    [K in keyof TFormFieldTypeOpts<T>]: TFormFieldTypeOpts<T>[K] extends IFormField<infer TValue> ? IFormField<TValue> : never;
};
export type TFormFieldTypeCombos<T> = {
    formArrays: FormArrayMap<T>[keyof FormArrayMap<T>][];
    formFields: FormFieldMap<T>[keyof FormFieldMap<T>][];
};
export type FormTypeUnion<T> = IFormField<T> & Record<keyof T, IFormField['value']>;
export type PickByValue<T, ValueType> = Pick<T, {
    [Key in keyof T]-?: T[Key] extends ValueType ? Key : never;
}[keyof T]>;
export type PickFormValue<T> = PickByValue<T, IFormField | IFormArray<any>>;
export type FormValue<T> = {
    [Property in keyof PickFormValue<T>]: T[Property] extends IFormField | IFormArray<any> ? T[Property]['value'] : never;
};
export type OptionalFormArgs<T> = Partial<FormValue<T>>;
export {};
//# sourceMappingURL=interfaces.d.ts.map