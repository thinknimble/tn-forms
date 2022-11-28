import { IValidator, IForm, IFormFieldError, IFormFieldKwargs, IFormField, TFormInstanceFields, IFormArray, IFormArrayKwargs, IFormLevelValidator, FormValue, OptionalFormArgs, TArrayOfFormFieldValues } from './interfaces';
export declare class FormField<T = any> implements IFormField<T> {
    #private;
    name: string;
    placeholder: string;
    type: string;
    id: string;
    constructor({ name, validators, errors, value, placeholder, type, id, isTouched, }?: IFormFieldKwargs);
    static create<TCreate>(data?: IFormFieldKwargs): FormField<TCreate>;
    validate(): void;
    get isValid(): boolean;
    get errors(): IFormFieldError[];
    set errors(error: IFormFieldError[]);
    set value(value: T | null);
    get value(): T | null;
    get validators(): IValidator<T>[];
    set validators(validator: IValidator<T>[]);
    get isTouched(): boolean;
    set isTouched(touched: boolean);
    addValidator(validator: IValidator<T>): void;
    replicate(): FormField<any>;
}
export declare class FormArray<T> implements IFormArray<T> {
    #private;
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
export default class Form<T> implements IForm<T> {
    #private;
    constructor(kwargs?: OptionalFormArgs<T>);
    static create<T>(kwargs?: OptionalFormArgs<T>): Form<T>;
    replicate(): Form<T>;
    get field(): TFormInstanceFields<T>;
    get fields(): TArrayOfFormFieldValues<T>;
    copy(opts?: {}): FormField<any>;
    copyArray<T>(opts: FormArray<T>): FormArray<T>;
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