import { FormFieldsRecord, FormValue, IForm, IFormArray, IFormArrayKwargs, IFormField, IFormFieldError, IFormFieldKwargs, IFormLevelValidator, IValidator, OptionalFormArgs, TArrayOfFormFieldValues, TFormInstanceFields } from './interfaces';
export declare class FormField<T = string, TName extends string = ''> implements IFormField<T, TName> {
    private _value;
    private _errors;
    private _validators;
    name: TName;
    placeholder: string;
    type: string;
    id: string;
    private _isTouched;
    label: string;
    /**
     * For type-safety sake, please pass value and name, even if value is `null`.
     * Not passing value will result in it being empty string which could cause issues if you don't expect it.
     */
    constructor({ name, validators, errors, value, placeholder, type, id, isTouched, label, }?: IFormFieldKwargs<T, TName>);
    static create<TValue = string, TName extends string = ''>(data?: IFormFieldKwargs<TValue, TName>): FormField<TValue, TName>;
    validate(): void;
    get isValid(): boolean;
    get errors(): IFormFieldError[];
    set errors(error: IFormFieldError[]);
    set value(value: T | undefined);
    get value(): T | undefined;
    get validators(): IValidator<T>[];
    set validators(validator: IValidator<T>[]);
    get isTouched(): boolean;
    set isTouched(touched: boolean);
    addValidator(validator: IValidator<T>): void;
    replicate(): FormField<T, TName>;
}
export declare class FormArray<T extends FormFieldsRecord> implements IFormArray<T> {
    private _groups;
    private _FormClass;
    name: string;
    constructor({ name, groups, FormClass }: IFormArrayKwargs<T>);
    get value(): FormValue<T>[];
    get FormClass(): any;
    get groups(): IForm<T>[];
    set groups(group: IForm<T>[]);
    add(group?: IForm<T> | null): void;
    remove(index: number): void;
    replicate(): FormArray<T>;
}
export default class Form<T extends FormFieldsRecord> implements IForm<T> {
    private _fields;
    private _dynamicFormValidators;
    private _errors;
    constructor(kwargs?: OptionalFormArgs<T>);
    static create<T extends FormFieldsRecord>(kwargs?: OptionalFormArgs<T>): Form<T>;
    replicate(): Form<T>;
    get field(): TFormInstanceFields<T>;
    get fields(): TArrayOfFormFieldValues<T>;
    copy<FormFieldType = any>(opts?: {}): IFormField<FormFieldType>;
    copyArray<T extends FormFieldsRecord>(opts: FormArray<T>): FormArray<T>;
    _handleNoFieldErrors(fieldName: string): void;
    addFormLevelValidator(fieldName: string, validator: IFormLevelValidator): void;
    addValidator(fieldName: string, validator: IValidator): void;
    validate(): void;
    get errors(): any;
    set errors(errs: any);
    get value(): FormValue<T>;
    get isValid(): boolean;
    set isValid(valid: boolean);
}
//# sourceMappingURL=forms.d.ts.map