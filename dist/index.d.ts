interface IDynamicFormValidators {
    [key: string]: IFormLevelValidator[];
}
interface IFormLevelValidator<T = any> extends IValidator<T> {
    setMatchingField(form: IForm<any>): void;
}
interface IValidator<T = any> {
    message: string;
    code: string;
    isRequired: boolean;
    get enableValidate(): boolean;
    call(value: T | undefined): void;
}
type TFormInstance<T> = {
    [P in keyof T]: T[P];
};
interface IFormArrayKwargs<T extends FormFieldsRecord> {
    name: string;
    groups: IForm<T>[];
    FormClass?: any;
}
interface IFormArray<TFormFields extends FormFieldsRecord, TValue = any> {
    name: string;
    get FormClass(): any;
    get value(): TValue[];
    get groups(): IForm<TFormFields>[];
    set groups(group: IForm<TFormFields>[]);
    add(group: IForm<TFormFields>): void;
    remove(index: number): void;
    replicate(): IFormArray<TFormFields, TValue>;
}
type TFormFieldTypeOpts<T> = {
    [K in keyof T]: T[K] extends IFormField<infer TField, infer TName> ? IFormField<TField, TName> : T[K] extends IFormArray<infer TForm, infer TValue> ? IFormArray<TForm, TValue> : never;
};
type TArrayOfFormFieldValues<T> = TFormFieldTypeOpts<T>[keyof TFormFieldTypeOpts<T>][];
type FormFieldsRecord = Record<string, IFormField<any, any> | IFormArray<any>>;
interface IForm<T extends FormFieldsRecord> {
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
interface IFormFieldError {
    code: string;
    message: string;
}
interface IFormFieldKwargs<TValue = string, TName extends string = ''> {
    readonly name?: TName;
    validators?: IValidator[];
    errors?: IFormFieldError[];
    value?: TValue;
    id?: string | null;
    placeholder?: string;
    type?: string;
    isTouched?: boolean;
    label?: string;
}
interface IFormField<T = any, TName extends string = ''> {
    value: T | undefined;
    errors: IFormFieldError[];
    validators: IValidator[];
    readonly name: TName;
    placeholder: string;
    type: string;
    id: string;
    label: string;
    get isValid(): boolean;
    set isValid(value: boolean);
    validate(): void;
    get isTouched(): boolean;
    set isTouched(touched: boolean);
    replicate(): IFormField<T, TName>;
    addValidator(validator: IValidator<T>): void;
}
interface IFormInstance {
    [key: string]: IFormField;
}
type TFormInstanceFields<T extends FormFieldsRecord> = {
    [P in keyof T]: T[P];
};
type FormArrayMap<T> = {
    [K in keyof TFormFieldTypeOpts<T>]: TFormFieldTypeOpts<T>[K] extends IFormArray<infer TForm, infer TValue> ? IFormArray<TForm, TValue> : never;
};
type FormFieldMap<T> = {
    [K in keyof TFormFieldTypeOpts<T>]: TFormFieldTypeOpts<T>[K] extends IFormField<infer TValue> ? IFormField<TValue> : never;
};
type TFormFieldTypeCombos<T> = {
    formArrays: FormArrayMap<T>[keyof FormArrayMap<T>][];
    formFields: FormFieldMap<T>[keyof FormFieldMap<T>][];
};
type FormTypeUnion<T> = IFormField<T> & Record<keyof T, IFormField['value']>;
type PickByValue<T, ValueType> = Pick<T, {
    [Key in keyof T]-?: T[Key] extends ValueType ? Key : never;
}[keyof T]>;
type PickFormValue<T> = PickByValue<T, IFormField | IFormArray<any>>;
type FormValue<T> = {
    [Property in keyof PickFormValue<T>]: T[Property] extends IFormField | IFormArray<any> ? T[Property]['value'] : never;
};
type OptionalFormArgs<T> = Partial<FormValue<T>>;
type GetFormFieldNames<T extends FormFieldsRecord> = {
    [K in keyof T]: T[K] extends IFormField<any, infer TName> ? TName : '';
}[keyof T];
type GetFormFieldKeys<T extends FormFieldsRecord> = keyof T;

declare class FormField<T = string, TName extends string = ''> implements IFormField<T, TName> {
    private _value;
    private _errors;
    private _validators;
    name: TName;
    private _placeholder;
    type: string;
    id: string;
    private _isTouched;
    private _label;
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
    get placeholder(): string;
    set placeholder(placeholder: string);
    get label(): string;
    set label(label: string);
    set value(value: T | undefined);
    get value(): T | undefined;
    get validators(): IValidator<T>[];
    set validators(validator: IValidator<T>[]);
    get isTouched(): boolean;
    set isTouched(touched: boolean);
    addValidator(validator: IValidator<T>): void;
    replicate(): FormField<T, TName>;
}
declare class FormArray<T extends FormFieldsRecord> implements IFormArray<T> {
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
declare class Form<T extends FormFieldsRecord> implements IForm<T> {
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

declare function notNullOrUndefined(value: any): boolean;
declare function isNumber(message?: string): (value: unknown) => void;
declare function isNumberOrFloat(value: unknown): boolean;
declare function fieldGetter<FormInstance extends FormFieldsRecord>(form: IForm<FormInstance>, name: string): TFormInstanceFields<FormInstance>[keyof FormInstance];
declare const isFormArray: (input: unknown) => input is IFormArray<any>;
declare const isFormField: (input: unknown) => input is IFormField<any>;

declare class Validator<T = any> implements IValidator<T> {
    /**
     * Crete an instance of the validator.
     * @param {string} message - The error message to return if validation fails.
     * @param {string} code - The code to return with the thrown Error if validation fails.
     */
    message: string;
    code: string;
    isRequired: boolean;
    constructor({ message, code, isRequired }?: {
        message?: string | undefined;
        code?: string | undefined;
        isRequired?: boolean | undefined;
    });
    get enableValidate(): boolean;
    /**
     * Perform validation on a given value.
     * @param {string|number|Array|Object} value - The error message to return if validation fails.
     */
    call(value: T): void;
}
declare class FormLevelValidator<T = any> extends Validator<T> implements IFormLevelValidator {
    matcher: string | null;
    private _matchingField;
    constructor({ message, code, isRequired, matcher, }?: {
        message?: string | undefined;
        code?: string | undefined;
        isRequired?: boolean | undefined;
        matcher?: string | undefined;
    });
    setMatchingField(form: IForm<any>): void;
    get matchingVal(): any;
}
declare class RequiredValidator extends Validator {
    constructor({ message, code, isRequired }?: {
        message?: string | undefined;
        code?: string | undefined;
        isRequired?: boolean | undefined;
    });
    call(value: any): void;
}
declare class MinLengthValidator extends Validator {
    minLength: number;
    constructor({ message, code, isRequired, minLength, }?: {
        message?: string | undefined;
        code?: string | undefined;
        isRequired?: boolean | undefined;
        minLength?: number | undefined;
    });
    call(value: any): void;
}
declare class MustMatchValidator extends FormLevelValidator implements IFormLevelValidator {
    call(value: any): void;
}
declare class EmailValidator extends Validator {
    constructor({ message, code, isRequired, }?: {
        message?: string | undefined;
        code?: string | undefined;
        isRequired?: boolean | undefined;
    });
    call(value: any): void;
}
declare class MinDateValidator extends Validator {
    min: any;
    constructor({ message, code, isRequired, min, }?: {
        message?: string | undefined;
        code?: string | undefined;
        isRequired?: boolean | undefined;
        min?: Date | undefined;
    });
    call(value: any): void;
}
declare class MaxDateValidator extends Validator {
    max: any;
    constructor({ message, code, isRequired, max, }?: {
        message?: string | undefined;
        code?: string | undefined;
        isRequired?: boolean | undefined;
        max?: Date | undefined;
    });
    call(value: any): void;
}
declare class DynamicMinDateValidator extends FormLevelValidator implements IFormLevelValidator {
    call(value: any): void;
}
declare class MinimumValueValidator extends Validator {
    min: number;
    constructor({ message, code, isRequired, min, }?: {
        message?: string | undefined;
        code?: string | undefined;
        isRequired?: boolean | undefined;
        min?: number | undefined;
    });
    call(value: number | null): void;
}
declare class MaximumValueValidator extends Validator {
    max: number;
    constructor({ message, code, isRequired, max, }?: {
        message?: string | undefined;
        code?: string | undefined;
        isRequired?: boolean | undefined;
        max?: number | undefined;
    });
    call(value: any): void;
}
declare class PatternValidator extends Validator {
    pattern: RegExp;
    constructor({ message, code, isRequired, pattern, }?: {
        message?: string | undefined;
        code?: string | undefined;
        isRequired?: boolean | undefined;
        pattern?: RegExp | undefined;
    });
    call(value: any): void;
}
declare class UrlValidator extends PatternValidator {
    constructor({ message, code, isRequired, }?: {
        message?: string | undefined;
        code?: string | undefined;
        isRequired?: boolean | undefined;
    });
}
declare class TrueFalseValidator extends Validator {
    truthy: boolean;
    constructor({ message, code, isRequired, truthy, }?: {
        message?: string | undefined;
        code?: string | undefined;
        isRequired?: boolean | undefined;
        truthy?: boolean | undefined;
    });
    call(value: any): void;
}
declare class PhoneNumberValidator extends Validator {
    constructor({ message, code, isRequired, }: {
        message: string;
        code: string;
        isRequired: boolean;
    });
    call(value: string): void;
}

export { DynamicMinDateValidator, EmailValidator, Form, FormArray, FormField, type FormFieldsRecord, FormLevelValidator, type FormTypeUnion, type FormValue, type GetFormFieldKeys, type GetFormFieldNames, type IDynamicFormValidators, type IForm, type IFormArray, type IFormArrayKwargs, type IFormField, type IFormFieldError, type IFormFieldKwargs, type IFormInstance, type IFormLevelValidator, type IValidator, MaxDateValidator, MaximumValueValidator, MinDateValidator, MinLengthValidator, MinimumValueValidator, MustMatchValidator, type OptionalFormArgs, PatternValidator, PhoneNumberValidator, type PickByValue, type PickFormValue, RequiredValidator, type TArrayOfFormFieldValues, type TFormFieldTypeCombos, type TFormFieldTypeOpts, type TFormInstance, type TFormInstanceFields, TrueFalseValidator, UrlValidator, Validator, fieldGetter, isFormArray, isFormField, isNumber, isNumberOrFloat, notNullOrUndefined };
