import { IForm } from '../dist';
export declare function notNullOrUndefined(value: any): boolean;
export declare function isNumber(message?: string): (value: any) => void;
export declare function isNumberOrFloat(value: any): boolean;
export declare function fieldGetter<FormInstance>(form: IForm<FormInstance>, name: string): import("../dist").TFormInstanceFields<FormInstance>[keyof FormInstance];
//# sourceMappingURL=utils.d.ts.map