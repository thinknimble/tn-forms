declare module 'email-validator' {
  export function validate(email: string): boolean
  export function validate_async(email: string, callback: AsyncCallback): void
  export interface AsyncCallback {
    (err: any, isValideEmail: boolean): any
  }
}
