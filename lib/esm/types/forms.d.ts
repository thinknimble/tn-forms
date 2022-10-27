import { IValidator, IForm, IFormFieldError, IFormFieldKwargs, IFormField, TFormInstanceFields, IFormArray, IFormArrayKwargs, TFormFieldTypeOpts, IFormLevelValidator } from './interfaces';
export declare class FormField implements IFormField {
    #private;
    name: string;
    placeholder: string;
    type: string;
    id: string;
    constructor({ name, validators, errors, value, placeholder, type, id, isTouched, }?: IFormFieldKwargs);
    static create(data?: IFormFieldKwargs): FormField;
    validate(): void;
    get isValid(): boolean;
    get errors(): IFormFieldError[];
    set errors(error: IFormFieldError[]);
    set value(value: any);
    get value(): any;
    get validators(): IValidator<any>[];
    set validators(validator: IValidator<any>[]);
    get isTouched(): boolean;
    set isTouched(touched: boolean);
    addValidator(validator: IValidator): void;
}
export declare class FormArray<T> implements IFormArray<T> {
    #private;
    name: string;
    constructor({ name, groups, FormClass }: IFormArrayKwargs<T>);
    get value(): Record<keyof T, any>[];
    get FormClass(): any;
    get groups(): IForm<T>[];
    set groups(group: IForm<T>[]);
    add(group?: IForm<T>): void;
    remove(index: number): void;
}
export default class Form<T> implements IForm<T> {
    #private;
    constructor(kwargs?: {
        [key: string]: any;
    });
    static create(kwargs?: {
        [key: string]: any;
    }): Form<unknown>;
    replicate(): Form<T>;
    get field(): TFormInstanceFields<T>;
    get fields(): TFormFieldTypeOpts<T>[];
    copy(opts?: {}): FormField;
    copyArray<T>(opts: FormArray<T>): FormArray<unknown>;
    _handleNoFieldErrors(fieldName: string): void;
    addFormLevelValidator(fieldName: string, validator: IFormLevelValidator): void;
    addValidator(fieldName: string, validator: IValidator): void;
    validate(): void;
    get errors(): any;
    set errors(errs: any);
    get value(): Record<keyof T, IFormField['value']>;
    get isValid(): boolean;
    set isValid(valid: boolean);
}
//# sourceMappingURL=forms.d.ts.map