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
    call(value: T | null): void;
}
export declare type TFormInstance<T> = {
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
export declare type TFormFieldTypeOpts<T> = {
    [K in keyof T]: T[K] extends IFormField<infer TField> ? IFormField<TField> : T[K] extends IFormArray<infer TForm, infer TValue> ? IFormArray<TForm, TValue> : never;
};
export declare type TArrayOfFormFieldValues<T> = TFormFieldTypeOpts<T>[keyof TFormFieldTypeOpts<T>][];
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
export declare type TForm<T> = {
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
    value: T | null;
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
export declare type TFormInstanceFields<T> = {
    [P in keyof T]: T[P];
};
declare type FormArrayMap<T> = {
    [K in keyof TFormFieldTypeOpts<T>]: TFormFieldTypeOpts<T>[K] extends IFormArray<infer TForm, infer TValue> ? IFormArray<TForm, TValue> : never;
};
declare type FormFieldMap<T> = {
    [K in keyof TFormFieldTypeOpts<T>]: TFormFieldTypeOpts<T>[K] extends IFormField<infer TValue> ? IFormField<TValue> : never;
};
export declare type TFormFieldTypeCombos<T> = {
    formArrays: FormArrayMap<T>[keyof FormArrayMap<T>][];
    formFields: FormFieldMap<T>[keyof FormFieldMap<T>][];
};
export declare type FormTypeUnion<T> = IFormField<T> & Record<keyof T, IFormField['value']>;
export declare type PickByValue<T, ValueType> = Pick<T, {
    [Key in keyof T]-?: T[Key] extends ValueType ? Key : never;
}[keyof T]>;
export declare type PickFormValue<T> = PickByValue<T, IFormField | IFormArray<any>>;
export declare type FormValue<T> = {
    [Property in keyof PickFormValue<T>]: T[Property] extends IFormField | IFormArray<any> ? T[Property]['value'] : never;
};
export declare type OptionalFormArgs<T> = Partial<FormValue<T>>;
export {};
//# sourceMappingURL=interfaces.d.ts.map