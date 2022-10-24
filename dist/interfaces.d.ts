export interface IDynamicFormValidators {
    [key: string]: IValidator[];
}
export interface IValidator {
    message: string;
    code: string;
    call(value: any): void;
}
export interface IFormLevelValidator extends IValidator {
    form: IForm<any>;
}
export declare type TFormInstance<T> = {
    [P in keyof T]: T[P];
};
export interface IFormArray<T> {
    name: string;
    get value(): any;
    get groups(): IForm<T>[];
    set groups(group: IForm<T>[]);
    add(group: IForm<T>): void;
    remove(index: number): void;
}
export interface IForm<T> {
    get field(): TFormInstanceFields<T>;
    get fields(): IFormField[] | IFormArray<T>[];
    get errors(): any[];
    set errors(errors: any[]);
    get value(): any;
    get isValid(): boolean;
    set isValid(valid: boolean);
    copy(value: any): any;
    _handleNoFieldErrors(fieldName: string): any;
    addValidator(fieldName: string, validator: IValidator): any;
    validate(): any;
}
export interface IFormFieldError {
    code: string;
    message: string;
}
export interface IFormFieldData {
    name?: string;
    validators?: IValidator[];
    errors?: IFormFieldError[];
    value?: any;
    id?: string | null;
    placeholder?: string;
    type?: 'text';
}
export interface IFormField {
    value: any;
    errors: IFormFieldError[];
    validators: IValidator[];
    name: string;
    placeholder: string;
    type: string;
    id: string;
    get isValid(): boolean;
}
export interface IFormInstance {
    [key: string]: IFormField;
}
export declare type TFormInstanceFields<T> = {
    [P in keyof T]: T[P];
};
