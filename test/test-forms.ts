import * as assert from 'assert'

import Form, { FormField } from '../src/forms2'
import { IFormField } from '../src/interfaces'
import { MinLengthValidator, MustMatchValidator, RequiredValidator } from '../src/validators2'

describe('Form Model', () => {
  class UserAddressForm extends Form<{ street: IFormField; city: IFormField }> {
    static street = new FormField({ validators: [] })
    static city = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })
  }

  interface IUserForm {
    firstName: IFormField
    password: IFormField
    confirmPassword: IFormField
  }

  type TUserForm = UserForm & IUserForm

  class UserForm extends Form<UserForm> {
    static firstName = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })
    /*     static address = new FormArray({
      name: 'address',
      groups: [new UserAddressForm()],
    }) */
    static password = new FormField({ validators: [new RequiredValidator()] })
    static confirmPassword = new FormField({
      validators: [new MinLengthValidator({ minLength: 5 })],
    })
  }

  describe('#constructor()', () => {
    const userForm = new UserForm({ firstName: 'pari' }) as TUserForm
    it('should have 3 fields for each static property defined', () => {
      assert.equal(userForm.fields.length, 3)
    })
    it('should have 3 fields with keys of firstName, address, password, confirmPassword', () => {
      assert.equal(userForm.fields[0].name, 'firstName')
      assert.equal(userForm.fields[1].name, 'password')
      assert.equal(userForm.fields[2].name, 'confirmPassword')
    })
    it('should set the default value of the userForm firstname to pari set on the instance creation', () => {
      assert.equal(userForm.field['firstName'].value, 'pari')
    })
    it('should set firstName, password and confirm password  to have validators (ignoring address for now)', () => {
      userForm.fields.forEach((field) => {
        if (field instanceof FormField) {
          assert.equal((userForm.fields[0] as FormField).validators.length, 1)
          assert.equal((userForm.fields[1] as FormField).validators.length, 1)
          assert.equal((userForm.fields[2] as FormField).validators.length, 1)
        }
      })
    })
    it('should add Validators to each form field', () => {
      assert.equal(userForm.field['firstName'].validators.length, 1)
    })
    it('should return isValid == false since pari is less than 5', () => {
      assert.equal(userForm.field['firstName'].value, 'pari')
      assert.equal(userForm.field['firstName'].isValid, false)
    })
    it('should return isValid == false since pari is less than 5', () => {
      // @ts-ignore
      assert.equal(userForm.firstName.value, 'pari')
      assert.equal(userForm.field['firstName'].isValid, false)
    })
  })
})
