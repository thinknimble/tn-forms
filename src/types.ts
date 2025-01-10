import { IFormArray, IFormField } from "./interfaces";

export type ExtractFormFields<T> = {
    [K in keyof T]: T[K] extends IFormField<any> | IFormArray<any> ? T[K] : never;
  };
  