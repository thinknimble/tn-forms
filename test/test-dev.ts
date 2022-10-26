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
  static dynamicFormValidators = {
    confirmPassword: [new MustMatchValidator({ matcher: 'password' })],
  }

  static password = new FormField()
  static confirmPassword = new FormField({
    validators: [],
  })
}

describe('Forms', () => {
  describe('# Form setup', () => {
    it('should load all the form array values and create a new instance for each using the FormClass type', () => {
      const values = {
        password: 'testing',
        confirmPassword: 'testin',
      }
      let testForm = new UserForm(values) as TUserForm
      assert.equal(testForm.isValid, false)
      testForm.confirmPassword.value = 'testing'
      assert.equal(testForm.isValid, true)
    })
    it('contain a list of errors in the field errors list', () => {
      const values = {
        password: 'testing',
        confirmPassword: 'testin',
      }
      let testForm = new UserForm(values) as TUserForm
      assert.equal(testForm.isValid, false)
      testForm.validate()
      console.log(testForm.confirmPassword.errors)
      assert.equal(testForm.confirmPassword.errors.length, 1)
      testForm.confirmPassword.value = 'testing'
      assert.equal(testForm.isValid, true)
    })
  })
})
