import * as assert from 'assert'

import Form, { FormArray, FormField } from '../src/forms'
import { IFormArray, IFormField, TFormFieldTypeOpts } from '../src/interfaces'
import {
  EmailValidator,
  MaxDateValidator,
  MinDateValidator,
  MinLengthValidator,
  MustMatchValidator,
  RequiredValidator,
} from '../src/validators'

interface IUserAddressForm {
  street: IFormField
  city: IFormField
}
interface IUserForm {
  firstName: IFormField
  password: IFormField
  confirmPassword: IFormField
  dob: IFormField
  email: IFormField
  address: IFormArray<IUserAddressForm>
}

interface IFormNoAddress {
  address: FormArray<IUserAddressForm>
}

type TUserForm = UserForm & IUserForm
type TUserAddressForm = UserAddressForm & IUserAddressForm

class UserAddressForm extends Form<IUserAddressForm> {
  static street = new FormField({ validators: [], value: 'this' })
  static city = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })
}
class FormNoAddressInstance extends Form<IFormNoAddress> {
  static address = new FormArray<IUserAddressForm>({
    name: 'address',
    groups: [],
    FormClass: UserAddressForm,
  })
}

class UserForm extends Form<IUserForm> {
  static firstName = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })
  static email = new FormField({ validators: [new EmailValidator()] })
  static password = new FormField({ validators: [new RequiredValidator()] })
  static confirmPassword = new FormField({
    validators: [new MinLengthValidator({ minLength: 5 })],
  })
  static dob = new FormField({
    validators: [
      new MinDateValidator({ min: new Date('10/20/2022') }),
      new MaxDateValidator({ max: new Date('10/18/2026') }),
    ],
  })
  static address = new FormArray<IUserAddressForm>({
    name: 'address',
    groups: [new UserAddressForm()],
  })
}

describe('Forms', () => {
  describe('# Form setup', () => {
    it('should load all the form array values and create a new instance for each using the FormClass type', () => {
      const values = {
        address: [{ street: 'testswdf', city: 'asdasdasdasd' }],
      }
      let testForm = new FormNoAddressInstance(values)
      console.log(testForm.value)
    })
  })
})
