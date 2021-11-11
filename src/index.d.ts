export class FormField {
    static create(data?: {}): FormField;
    constructor({ name, validators, errors, value }?: {
        name?: string;
        validators?: any[];
        errors?: any[];
        value?: string;
    });
    _value: any;
    _errors: any[];
    _validators: any[];
    validate(): void;
    set errors(arg: any[]);
    get errors(): any[];
    get isValid(): boolean;
    set value(arg: any);
    get value(): any;
    set validators(arg: any[]);
    get validators(): any[];
    addValidator(validator: any): void;
}
export default class Form {
    constructor(kwargs?: {});
    _fields: {};
    _dynamicFormValidators: any;
    get field(): {};
    get fields(): any[];
    copy(opts?: {}): FormField;
    copyArray(opts?: {}): FormArray;
    _handleNoFieldErrors(fieldName: any): void;
    addToArray(formArrayName: any, form: any): void;
    removeFromArray(formArrayName: any, index: any): void;
    addValidator(fieldName: any, validator: any, extraArgs?: any): void;
    validate(): void;
    set errors(arg: any);
    get errors(): any;
    _errors: any[];
    get value(): any;
    set isValid(arg: boolean);
    get isValid(): boolean;
}
export class FormArray {
    constructor({ name, groups, value }?: {
        name?: string;
        groups?: Form[];
        value?: any;
    });
    _value: any;
    _errors: any[];
    _groups: any[];
    set value(arg: any[]);
    get value(): any[];
    get groups(): any[];
    add(group?: Form): void;
    remove(index: any): void;
}