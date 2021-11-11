<template></template>

<script>
import { MinLengthValidator, MustMatchValidator, RequiredValidator, EmailValidator } from '../index'
import Form, { FormField } from '../index'

export class UserAddressForm extends Form {
  static street = new FormField({ validators: [] })
  static city = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })
}

export class UserForm extends Form {
  static firstName = new FormField({ validators: [new RequiredValidator()] })
  static lastName = new FormField({
    validators: [new RequiredValidator()],
  })
  static email = new FormField({
    validators: [new EmailValidator()],
  })
  static address = new FormArray({
    name: 'address',
    groups: [new UserAddressForm()],
  })
  static password = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })
  static confirmPassword = new FormField({
    validators: [new MinLengthValidator({ minLength: 5 })],
  })
}

export default {
  name: 'FormComponent',

  data: function () {
    return {
      User1: new User({ firstName: 'paris', age: 'wert' }),
      User2: new User({ firstName: 'paris2', age: 20 }),
      userForm: new UserForm({ firstName: 'parisssss' }),
      userForm2: new UserForm({ firstName: 'parisds', password: 'asdasdasd' }),
    }
  },
  created() {
    this.userForm.addValidator(
      'confirmPassword',
      new MustMatch({
        matcher: this.userForm.field['password'],
        message: 'Passwords do not match',
      }),
    )
    this.userForm.addValidator('address', new MinLengthValidator({ minLength: 10 }), 'street')
  },

  methods: {
    submitFormGroup() {
      console.log(this.userForm.value)
    },
    addAddress() {
      this.userForm.addToArray('address', new UserAddressForm())
    },
  },
}
</script>

<style lang="scss" scoped>
.user-form {
  display: flex;
  flex-direction: column;
}
</style>
