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
  TrueFalseValidator,
} from '../src/validators'

interface IUserAddressForm {
  street: IFormField
  city: IFormField
}
interface IUserForm {
  firstName: IFormField<string>
  password: IFormField
  confirmPassword: IFormField
  dob: IFormField
  email: IFormField
  address: IFormArray<IUserAddressForm>
}

interface IFormNoAddress {
  address: FormArray<IUserAddressForm>
}

interface ICrossFieldForm {
  usersName: IFormField
  confirmName: IFormField<string>
}
type TCrossFieldForm = ICrossFieldForm & CrossFieldForm

type TUserForm = UserForm & IUserForm
type TUserAddressForm = UserAddressForm & IUserAddressForm

type TFormNoAddressInstance = IFormNoAddress & FormNoAddressInstance
class CrossFieldForm extends Form<ICrossFieldForm> {
  static dynamicFormValidators = {
    confirmName: [new MustMatchValidator({ matcher: 'usersName' })],
  }
  static usersName = new FormField()
  static confirmName = new FormField()
}
class UserAddressForm extends Form<IUserAddressForm> {
  static street = new FormField({ validators: [], value: 'this' })
  static city = new FormField({
    validators: [new MinLengthValidator({ minLength: 5 })],
  })
}
class FormNoAddressInstance extends Form<IFormNoAddress> {
  static address = new FormArray<IUserAddressForm>({
    name: 'address',
    groups: [],
    FormClass: FormNoAddressInstance,
  })
}

const firstNamePlaceholder = 'Input your first name...'
const firstNameLabel = 'First name'

class UserForm extends Form<IUserForm> {
  static firstName = new FormField({
    validators: [new MinLengthValidator({ minLength: 5 })],
    placeholder: firstNamePlaceholder,
    label: firstNameLabel,
  })
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
  describe('# Fields', () => {
    it('should create a new field', () => {
      let formField: IFormField = new FormField()
      assert.equal(formField instanceof FormField, true)
    })
  })
  describe('# Form setup', () => {
    const userForm = new UserForm({ firstName: 'pari' }) as TUserForm
    it('should have 6 fields for each static property defined', () => {
      assert.equal(userForm.fields.length, 6)
    })
    it('should have fields with keys of firstName', () => {
      assert.equal(
        userForm.fields.map((f: IFormField | IFormArray<any>) => f?.name).includes('firstName'),
        true,
      )
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
    it('should indicate that firstname has a validator', () => {
      assert.equal(userForm.field['firstName'].validators.length, 1)
      assert.equal(userForm.firstName.validators.length, 1)
    })
    it('should have a form array for address', () => {
      assert.equal(userForm.address.groups.length, 1)
    })
    it('should have a validator for address', () => {
      assert.equal(userForm.address.groups[0].field['city'].validators.length, 1)
    })
    it('should have a validator for address', () => {
      assert.equal((userForm.address.groups[0] as TUserAddressForm).city.validators.length, 1)
    })
    it('should have 2 user address entries', () => {
      userForm.address.add(new UserAddressForm())
      assert.equal(userForm.address.groups.length, 2)
    })
    it('should set two different forms that do not share values', () => {
      let userFormOriginal = new UserForm() as TUserForm
      const originalFormAddresses = userFormOriginal.address.groups as TUserAddressForm[]
      originalFormAddresses[0].street.value = 'testingoriginal'
      originalFormAddresses[0].city.value = 'testingoriginal'
      let userFormSecond = new UserForm() as TUserForm
      const secondUserFormAddresses = userFormSecond.address.groups as TUserAddressForm[]
      secondUserFormAddresses[0].street.value = 'testing'
      assert.notEqual(
        originalFormAddresses[0].street.value,
        secondUserFormAddresses[0].street.value,
      )
    })
    it('should create a form using the factory method', () => {
      const userFormFact = UserForm.create() as TUserForm
      assert.equal(userFormFact.fields.length, 6)
    })
    it('should load all the form array values and create a new instance for each using the FormClass type', () => {
      const values = {
        address: [{ street: 'testswdf', city: 'asdasdasdasd' }],
      }
      let testForm = new FormNoAddressInstance(values) as TFormNoAddressInstance
      assert.equal(testForm.address.groups.length, 1)
    })
    it('should replicate the form exactly', () => {
      const values = {
        usersName: 'test',
        confrimName: 'tests',
      }
      let testForm = new CrossFieldForm() as TCrossFieldForm
      testForm.usersName.value = 'testing123'
      testForm.confirmName.value = 'tiinngngngn'
      testForm.validate()
      assert.equal(testForm.confirmName.errors.length, 1)
      let duplicateForm = testForm.replicate() as TCrossFieldForm
      assert.equal(duplicateForm.confirmName.errors.length, 1)
      testForm.confirmName.value = 'testing123'
      testForm.validate()
      assert.equal(testForm.confirmName.errors.length, 0)
      assert.notEqual(testForm.confirmName.value, duplicateForm.confirmName.value)
      assert.equal(duplicateForm.confirmName.errors.length, 1)
      duplicateForm.validate()
      assert.equal(duplicateForm.confirmName.errors.length, 1)
      duplicateForm.confirmName.value = 'testing123'
      duplicateForm.validate()
      assert.equal(duplicateForm.confirmName.errors.length, 0)
    })
    it('should have label and placeholder on firstName field', () => {
      assert.equal(userForm.firstName.placeholder, firstNamePlaceholder)
      assert.equal(userForm.firstName.label, firstNameLabel)
    })
  })
  describe('# Form Validators', () => {
    const userForm = new UserForm({ firstName: 'par' }) as TUserForm
    it('should set the field to invalid as it is below the min length ', () => {
      assert.equal(userForm.firstName.isValid, false)
    })
    it('should set field to invalid as it is required', () => {
      assert.equal(userForm.password.isValid, false)
    })
    it('should set field to invalid as date < minimum', () => {
      userForm.dob.value = new Date('10/15/2022')
      assert.equal(userForm.dob.isValid, false)
    })
    it('should set field to invalid as date > minimum', () => {
      userForm.dob.value = new Date('10/25/2028')
      assert.equal(userForm.dob.isValid, false)
    })
    it('should set the field to invalid as it is not a valid email', () => {
      userForm.email.value = 'pb1636'
      assert.equal(userForm.email.isValid, false)
    })
    it('should set the field to valid as it is above the min length ', () => {
      userForm.firstName.value = 'Paribaker'
      assert.equal(userForm.firstName.isValid, true)
    })
    it('should set field to valid as it is required', () => {
      userForm.password.value = 'testing213'
      assert.equal(userForm.password.isValid, true)
    })
    it('should set field to valid as date < minimum', () => {
      userForm.dob.value = new Date('10/25/2022')
      assert.equal(userForm.dob.isValid, true)
    })
    it('should set field to valid as date > minimum', () => {
      userForm.dob.value = new Date('10/18/2025')
      assert.equal(userForm.dob.isValid, true)
    })
    it('should set the field to valid as it a valid email', () => {
      userForm.email.value = 'testing123@yahoo.com'
      assert.equal(userForm.email.isValid, true)
    })
  })

  describe('# Form entry & validation', () => {
    const defaultAddress = 'test street'
    const patchAddress = 'my street'
    class UserAddressForm2 extends UserAddressForm {
      static street = new FormField({ validators: [], value: defaultAddress })
    }
    it('should indicate the form is valid after entry', () => {
      const userForm = new UserForm() as TUserForm
      userForm.firstName.value = 'pariszcxczxczx'
      userForm.email.value = 'pasdaad@gmail.com'
      userForm.dob.value = new Date('10/26/2025')
      userForm.password.value = '123456'
      userForm.confirmPassword.value = '123456'
      const userAddressForm = userForm.address.groups[0] as TUserAddressForm
      userAddressForm.city.value = 'test1'
      userAddressForm.street.value = 'yes1'
      assert.equal(userForm.isValid, true)
    })
    let userAddressForm = new UserAddressForm() as TUserAddressForm
    it('should declare the form invalid initially', () => {
      assert.equal(userAddressForm.isValid, false)
    })
    it('should declare the form valid after entry', () => {
      userAddressForm = new UserAddressForm({
        street: 'decatur',
        city: 'Santa Clara',
      }) as TUserAddressForm
      assert.equal(userAddressForm.street.isValid, true)
      assert.equal(userAddressForm.city.isValid, true)
      assert.equal(userAddressForm.isValid, true)
    })

    it('should prefill city and street with default values', () => {
      const userAddressForm2 = new UserAddressForm2() as TUserAddressForm
      assert.equal(userAddressForm2.street.value, defaultAddress)
      assert.equal(
        JSON.stringify(userAddressForm2.value),
        JSON.stringify({ street: defaultAddress, city: '' }),
      )
    })
    it('should prefill values of form using patch value and override field default', () => {
      const userAddressForm2 = new UserAddressForm2() as TUserAddressForm
      userAddressForm2.street.value = patchAddress
      assert.equal(userAddressForm2.street.value, patchAddress)
      assert.equal(userAddressForm2.value.toString(), { street: patchAddress, city: '' }.toString())
    })
    it('should prefill values of form using ph value and override field default with formarrays', () => {
      let value = {
        firstName: 'lorem',
        email: 'test@formstofill.com',
        password: 'testing123',
        confirmPassword: 'testing123',
        dob: new Date('12/20/2022'),
        address: [
          { street: 'testing', city: 'testing' },
          { street: 'testing1', city: 'testing1' },
        ],
      }
      let userForm1 = new UserForm({ ...value }) as TUserForm
      userForm1.value.address
      assert.equal(JSON.stringify(userForm1.value), JSON.stringify(value))
    })
    it('should mark the field as invalid if the matching field is not the same', () => {
      const values = {
        usersName: 'pari',
        confirmName: 'baker',
      }
      let newForm = new CrossFieldForm(values) as TCrossFieldForm
      newForm.value.confirmName

      assert.equal(newForm.confirmName.isValid, false)
      newForm.validate()
      assert.equal(newForm.confirmName.errors.length, 1)
      newForm.confirmName.value = 'pari'
      assert.equal(newForm.confirmName.isValid, true)
    })
    it('should mark the field as invalid because TrueFalseValidator failed', () => {
      type TUserFormTrue = IUserForm & { trueVal: IFormField<boolean> } & UserForm
      class UserFormTrue extends UserForm {
        static trueVal = new FormField({
          value: true,
          validators: [new TrueFalseValidator({ truthy: false })],
        })
      }

      let userForm1 = new UserFormTrue() as TUserFormTrue
      assert.equal(userForm1.trueVal.isValid, false)
      userForm1.trueVal.value = false
      assert.equal(userForm1.trueVal.isValid, true)
    })
  })
  describe('# Form array functions', () => {
    it('should add another formgroup to the formarray', () => {
      let userAddressForm = new UserForm() as TUserForm
      userAddressForm.address.add(new UserAddressForm())
      assert.equal(userAddressForm.address.groups.length, 2)
    })
    it('should remove a formgroup from the formarray', () => {
      let userAddressForm = new UserForm() as TUserForm
      userAddressForm.address.remove(0)
      assert.equal(userAddressForm.address.groups.length, 0)
    })
  })
})
