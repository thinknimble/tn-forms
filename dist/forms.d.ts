import { IValidator, IForm, IFormFieldError, IFormFieldData, IFormField, TFormInstanceFields, IFormArray } from './interfaces';
export declare class FormField implements IFormField {
    #private;
    name: string;
    placeholder: string;
    type: string;
    id: string;
    constructor({ name, validators, errors, value, placeholder, type, id, }?: IFormFieldData);
    static create(data?: IFormFieldData): FormField;
    validate(): void;
    get isValid(): boolean;
    get errors(): IFormFieldError[];
    set errors(error: IFormFieldError[]);
    set value(value: any);
    get value(): any;
    get validators(): IValidator[];
    set validators(validator: IValidator[]);
    addValidator(validator: IValidator): void;
}
export declare class FormArray<T> implements IFormArray<T> {
    #private;
    name: string;
    constructor({ name, groups }?: {
        name?: string;
        groups?: any[];
    });
    get value(): any[];
    get groups(): IForm<T>[];
    set groups(group: IForm<T>[]);
    add(group: IForm<T>): void;
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
    get field(): TFormInstanceFields<T>;
    get fields(): IFormField[] | IFormArray<T>[];
    copy(opts?: {}): FormField;
    copyArray<T>(opts: FormArray<T>): FormArray<unknown>;
    _handleNoFieldErrors(fieldName: string): void;
    addFormLevelValidator(fieldName: string, validator: IValidator): void;
    addValidator(fieldName: string, validator: IValidator): void;
    validate(): void;
    get errors(): any;
    set errors(errs: any);
    get value(): {};
    get isValid(): boolean;
    set isValid(valid: boolean);
}
