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

  static firstName = new FormField()
  static password = new FormField()
  static address = new FormArray<IUserAddressForm>({
    name: 'address',
    groups: [],
    FormClass: UserAddressForm,
  })
  static confirmPassword = new FormField({
    validators: [],
  })
}

describe('Forms', () => {
  describe('# Form setup', () => {
    it('should replicate the form exactly', () => {
      // const values = {
      //   password: 'testing',
      //   confirmPassword: 'testin',
      // }


    // it('should replicate the form exactly using formarray', () => {
    //   let userForm = new UserForm({ firstName: 'pari' }) as TUserForm
    //   userForm.address.add(new UserAddressForm({ street: 'test' }))
    //   assert.equal(userForm.address.groups.length, 1)
    //   let addressForm = userForm.address.groups[0] as TUserAddressForm
    //   addressForm.validate()
    //   assert.equal(addressForm.city.errors.length, 1)

    //   let duplicate = userForm.replicate() as TUserForm
    //   assert.equal(duplicate.address.groups.length, 1)
    //   let duplicateAddressForm = userForm.address.groups[0] as TUserAddressForm
    //   assert.equal(duplicateAddressForm.city.errors.length, 1)
    //   assert.equal(duplicateAddressForm.street.value, addressForm.street.value)
    //   //addressForm.street.value = 'testing123'
    //   //assert.notEqual(duplicateAddressForm.street.value, addressForm.street.value)
    // })
  })
})
