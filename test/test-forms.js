import assert from 'assert'

import Form, { FormField } from '../src/forms'
import { MinLengthValidator, MustMatchValidator } from '../src/index'

describe('Form Model', () => {
  class UserAddressForm extends Form {
    static street = new FormField({ validators: [] })
    static city = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })
  }

  class UserForm extends Form {
    static firstName = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })
    /*     static address = new FormArray({
      name: 'address',
      groups: [new UserAddressForm()],
    }) */
    static password = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })
    static confirmPassword = new FormField({
      validators: [new MinLengthValidator({ minLength: 5 })],
    })
  }

  describe('#constructor()', () => {
    const userForm = new UserForm({ firstName: 'pari' })
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
      assert.equal(userForm.fields[0].validators.length, 1)
      assert.equal(userForm.fields[1].validators.length, 1)
      assert.equal(userForm.fields[2].validators.length, 1)
    })
    it('should  add a validator on the fly to confirmPassword', () => {
      userForm.addValidator(
        'confirmPassword',
        new MustMatchValidator({
          message: 'This Field Must Match The Password Field',
          matcher: userForm.field['password'],
        }),
      )
      assert.equal(
        userForm.field['confirmPassword'].validators[1] instanceof MustMatchValidator,
        true,
      )
    })
    it('should throw an error if a field accessed does not exist', () => {
      //assert.throws(userForm._handleNoFieldErrors.bind(userForm, 'confirmPassword'), Error)
      assert.throws(
        function () {
          userForm._handleNoFieldErrors('confirmPassword')
        },
        Error,
        /Error thrown/,
      )
    })
  })
})
