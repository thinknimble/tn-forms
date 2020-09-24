<template>
  <div>
    <h3>Form Group Validator</h3>

    <form class="user-form">
      <div class="form-group">
        <input
          @blur="userForm.field['firstName'].validate()"
          type="text"
          id="firstName"
          v-model="userForm.field['firstName'].value"
        />
        <div v-if="userForm.field['firstName'].errors" class="errors">
          <span
            :key="`${error.code}-${i}`"
            v-for="(error, i) in userForm.field['firstName'].errors"
          >
            {{ error.message }}
          </span>
        </div>
      </div>
      <div class="form-group">
        <input type="text" id="lastName" v-model="userForm.field['lastName'].value" />
        <div v-if="userForm.field['lastName'].errors" class="errors">
          <span :key="`${error.code}-${i}`" v-for="(error, i) in userForm.field['lastName'].errors">
            {{ error.message }}
          </span>
        </div>
      </div>
      <div class="form-group">
        <input type="text" id="password" v-model="userForm.field['password'].value" />
        <div v-if="userForm.field['password'].errors" class="errors">
          <span :key="`${error.code}-${i}`" v-for="(error, i) in userForm.field['password'].errors">
            {{ error.message }}
          </span>
        </div>
      </div>
      <div class="form-group">
        <input
          type="text"
          id="confirmPassword"
          v-model="userForm.field['confirmPassword'].value"
          @blur="userForm.field['confirmPassword'].validate()"
        />
        <div v-if="userForm.field['confirmPassword'].errors" class="errors">
          <span
            :key="`${error.code}-${i}`"
            v-for="(error, i) in userForm.field['confirmPassword'].errors"
          >
            {{ error.message }}
          </span>
        </div>
      </div>
      <div class="form-group">
        <h4>Address</h4>
        <template v-for="(group, index) in userForm.field['address'].groups">
          <div :key="index" :class="`address-${index}`">
            <div class="form-group">
              <input
                :key="`street-${index}`"
                @blur="group.field['street'].validate()"
                type="text"
                :id="`street-${index}`"
                v-model="group.field['street'].value"
              />
              <div v-if="group.field['street'].errors" class="errors">
                <span
                  :key="`${error.code}-${i}`"
                  v-for="(error, i) in group.field['street'].errors"
                >
                  {{ error.message }}
                </span>
              </div>
            </div>
            <div class="form-group">
              <input
                :key="`city-${index}`"
                @blur="group.field['city'].validate()"
                type="text"
                :id="`city-${index}`"
                v-model="group.field['city'].value"
              />
              <div v-if="group.field['city'].errors" class="errors">
                <span :key="`${error.code}-${i}`" v-for="(error, i) in group.field['city'].errors">
                  {{ error.message }}
                </span>
              </div>
            </div>

            <button :key="index" @click.prevent="userForm.removeFromArray('address', index)">
              Remove
            </button>
          </div>
        </template>
        <button @click.prevent="addAddress">Add New Field</button>
      </div>
    </form>

    <button @click="submitFormGroup" :disabled="!userForm.isValid">Submit</button>

    <br />
  </div>
</template>

<script>
import { MinLengthValidator, minLength, MustMatch } from '@thinknimble/tn-validators'
import FormField from '../FormField'
import Forms from '../index'

export class UserAddressForm extends Form {
  static street = new FormField({ validators: [] })
  static city = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })
}

export class UserForm extends Form {
  static firstName = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })
  static lastName = new FormField({
    validators: [new MinLengthValidator({ minLength: 5 })],
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
