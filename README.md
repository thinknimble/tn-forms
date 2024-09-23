# TN Forms

## Installation

```
npm i -S @thinknimble/tn-forms
```

## Intro

Tn Forms was created to provide a consistent mechanism for creating forms in webapps within teams. By streamlining the form creation process the aim is to improve code cohesion and interoprability within a team. Anyone picking up the code base should be able to easily create and update forms with little thought beyond the how-to of these forms.
The library supports creating simple forms, dynamic forms (using form arrays) or using standalone fields. It also includes a rich set of validators that can be easily extended to create new validators on the fly.
The library is written in Typescript and exposes all of the types used to build the forms and can be used with pure JS

<details>
<summary>Sample Forms </summary>

```ts
import Form, { FormField, IFormField, RequiredValidator } from '@thinknimble/tn-forms'

/**
 * Step #1: Build the type annotation for the form inputs - this will be used to infer the value of the form
 * Important Note: Since the interface of the form fields is IFormField and value is not required any type will be automatically cast to <T>|Undefined
 *
 */
export type LoginFormInputs = {
  email: IFormField<string>
  password: IFormField<string>
}
/**
 * Step #2: Build the form, this should extend the BaseForm class and be given a the input types,
 * the input types declared in step one will be used to infer the form value's type
 *
 *
 */
export class LoginForm extends Form<LoginFormInputs> {
  static email = FormField.create({
    validators: [new EmailValidator({ message: 'Please enter a valid email address to login' })],
  })
  static password = FormField.create({
    validators: [new RequiredValidator({ message: 'Please enter a password to login' })],
  })
}
/**
 *
 * Step #3: Create a union type this is an optional step that enables dot method notation on your form to access fields directly
 * e.g const loginForm = new LoginForm() as TLoginForm
 *      loginForm.email
 *
 */
export type TLoginForm = LoginFormInputs & LoginForm
```

</details>

<details>
<summary>Standalone Fields</summary>

```ts
import Form, {
  FormField,
  MinLengthValidator,
  RequiredValidator,
  EmailValidator,
} from '@thinknimble/tn-forms'

let email: IFormField = new FormField({
  value: 'Init Value',
  validators: [new RequiredValidator()],
  name: 'email',
  id: 'my-field',
  label: 'email label',
})
// if and id or name are not provided one will be generated automatically
// All fields are optional

// get the value
email.value

// check if the field is valid (calls the validate method silently)
email.isValid

// validate the field this will trigger the error handler and add errors to the field
email.validate()

//get the errors (must call the validate method first)
email.errors
```

</details>

<details>
<summary> Sample User form with Cross Field Validation and Form Arrays </summary>

```ts
// Build the interface to retrieve th fields in dot notation
// optionally provide a type for the value of each field IFormField<type> any is used as a default

export type UserFormInputs = {
  firstName: IFormField<string>
  password: IFormField<string>
  confirmPassword: IFormField<string>
  dob: IFormField<string>
  email: IFormField<string>
  address: IFormArray<IUserAddressForm>
}

class UserForm extends Form<UserFormInputs> {
  static firstName = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })
  static email = new FormField({ validators: [new EmailValidator()], label: 'Email' })
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
  // collecttion of sub forms inside the main form -- see next example
  static address = new FormArray<IUserAddressForm>({
    name: 'address',
    groups: [new UserAddressForm()],
  })
  // add cross field validators to the dynamicFormValidators object
  // This implementation is a bit more complex for ReactJS and ReactNative (see the accompanying tn-forms-react module)
  static dynamicFormValidators = {
    confirmPassword: [new MustMatchValidator({ matcher: 'password' })],
  }
}
//initialize the form
const userForm = new UserForm()
// validate the form
userForm.validate()
// check if the form is valid
userForm.isValid
// get the value as an object
userForm.value
//get an individial value
userForm.value.firstName

//add a formfield to the input
```

```html
<!-- Vue.js -->
<label :for="userForm.firstName.label">{{userForm.firstName.label}}</label>
<input
  type="text"
  :name="userForm.firstName.name"
  :placeholder="userForm.firstName.name"
  v-model="userForm.firstName.value"
/>
```

To use shorthand field method (access a field with dot notation) you need to decalre a union type of the form and its interface

```ts
type TUserForm = UserForm & UserFormInputs
const userForm = new UserForm() as TUserForm
```

this will give you direct access to the fields as properties of the class

```html
<!-- Vue.js -->
<label :for="userForm.firstName.label">{{userForm.firstName.label}}</label>
<input
  type="text"
  :name="userForm.firstName.name"
  :placeholder="userForm.firstName.name"
  v-model="userForm.firstName.value"
/>
```

</details>

<details>
<summary>Dynamic Form with form arrays</summary>

```ts
export type UserAddressFormInputs = {
  street: IFormField
  city: IFormField
}

class UserAddressForm extends Form<UserAddressFormInputs> {
  static street = new FormField({ validators: [], value: 'this', label: 'Street' })
  static city = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })
}
```

```html
<!-- Vue.js -->
<label :for="userForm.firstName.label">{{userForm.firstName.label}}</label>
<input
  type="text"
  :name="userForm.firstName.name"
  :placeholder="userForm.firstName.name"
  v-model="userForm.firstName.value"
/>
<label :for="userForm.adress.groups[0].street.label"
  >{{userForm.adress.groups[0].street.label}}</label
>
<input
  type="text"
  :name="userForm.adress.groups[0].street.name"
  :placeholder="userForm.adress.groups[0].street.name"
  v-model="userForm.adress.groups[0].street.value"
/>
```

</details>

<details>
<summary> Add Dynamic validators on the fly </summary>

```ts
// This method is useful for adding dynamic validators on the fly in response to other fields

// Note for react this method is preferred to confrom to react's deep object mutability

type TUserForm = UserForm & UserFormInputs
const userForm = new UserForm() as TUserForm
userForm.addFormLevelValidator('firstName', new MinLengthValidator())
```

</details>

<details>
<summary>Javascript</summary>

## Stanalone Fields

```js
import {
  FormField,
  IFormField,
  RequiredValidator,
  FormArray,
  IFormArray,
  IFormField,
} from '@thinknimble/tn-forms'

let email = new FormField({
  value: 'Init Value',
  validators: [new RequiredValidator()],
  name: 'email',
  id: 'my-field',
  label: 'email label',
})
// if and id or name are not provided one will be generated automatically
// All fields are optional

// get the value
email.value

// check if the field is valid (calls the validate method silently)
email.isValid

// validate the field this will trigger the error handler and add errors to the field
email.validate()

//get the errors (must call the validate method first)
email.errors
```

## Basic Form

```js
// Build the interface to retrieve th fields in dot notation
// optionally provide a type for the value of each field IFormField<type> any is used as a default

class UserForm extends Form {
  static firstName = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })
  static email = new FormField({ validators: [new EmailValidator()], label: 'Email' })
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
  // collecttion of sub forms inside the main form -- see next example
  static address = new FormArray({
    name: 'address',
    groups: [new UserAddressForm()],
  })
  // add cross field validators to the dynamicFormValidators object
  static dynamicFormValidators = {
    confirmPassword: [new MustMatchValidator({ matcher: 'password' })],
  }
}
//initialize the form
const userForm = new UserForm()
// validate the form
userForm.validate()
// check if the form is valid
userForm.isValid
// get the value as an object
userForm.value
//get an individial value
userForm.value.firstName

//add a formfield to the input
```

```html
<!-- SEE NOTE FOR SHORHAND METHOD RECOMMENDED-->
<!-- Vue.js -->
<label :for="userForm.firstName.label">{{userForm.firstName.label}}</label>
<input
  type="text"
  :name="userForm.firstName.name"
  :placeholder="userForm.firstName.name"
  v-model="userForm.firstName.value"
/>
```

```js
const userForm = new UserForm()
```

```html
<!-- Vue.js -->
<label :for="userForm.firstName.label">{{userForm.firstName.label}}</label>
<input
  type="text"
  :name="userForm.firstName.name"
  :placeholder="userForm.firstName.name"
  v-model="userForm.firstName.value"
/>
```

## Dynamic Form with form arrays

```js
class UserAddressForm extends Form {
  static street = new FormField({ validators: [], value: 'this', label: 'Street' })
  static city = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })
}
```

```html
<!-- Vue.js -->
<label :for="userForm.firstName.label">{{userForm.firstName.label}}</label>
<input
  type="text"
  :name="userForm.firstName.name"
  :placeholder="userForm.firstName.name"
  v-model="userForm.firstName.value"
/>
<label :for="userForm.adress.groups[0].street.label"
  >{{userForm.adress.groups[0].street.label}}</label
>
<input
  type="text"
  :name="userForm.adress.groups[0].street.name"
  :placeholder="userForm.adress.groups[0].street.name"
  v-model="userForm.adress.groups[0].street.value"
/>
```

## Add Dynamic validators on the fly

```js
// This method is useful for adding dynamic validators on the fly in response to other fields

// Note for react this method is preferred to confrom to react's deep object mutability

const userForm = new UserForm()
userForm.addFormLevelValidator('firstName', new MinLengthValidator())
```

</details>

## Validators

validators can be added to forms they all extend the base Validator class each validator can have its own additional variables plus 3 common ones.

`code` a unique code for the validator
`message` a unique message for the validator
`isRequired` isRequired will only validate a field if there is a value

**RequiredValidator**
Validates a field is not null, undefiend or empty

```
    new RequiredValidator()
```

**MinLengthValidator**
Validates a field has a certain minimum length (if the value of the field is an array it will check arary length)

```
    new MinLengthValidator({minLength: int})
```

**MinDateValidator/MaxDateValidator**
Validates a field has a certain minimum/maxium date (this is a static validator)

```
    new MinDateValidator/MaxDateValidator({min/max: str|date})
```

**MinimumValueValidator/MaximumValidator**
Validates a field has a certain minimum/maxium value (this is a static validator)

```
    new MinValueValidator/MaxValueValidator({min/max: str|int})
```

**PatternValidator**
Validates a field matches a pattern

```
    new PatternValidator({pattern:str/<Regex>})
```

**UrlValidator**
Validates a field has a link pattern (ftp/http/https)

```
    new UrlValidator()
```

**MustMatchValidator**
Validates a field matches another field

```
  new MustMatchValidator({matcher:<string-field-name>})
```

**TrueFalseValidator**
Validates a field is true or false depending on true false value

```
  new MustMatchValidator({truthy:boolean})
```

### Custom Validators

The validators class is easily extendable and allows you to create your own validators on the fly

**Simple Validator**

```
import {Validator, notNullOrUndefined} from '@thinknimble/tn-forms'


export class MyValidator extends Validator {
  // if you intend to override the default variables message & code define a constructor with a call to super
  // you can pass additional variables as well

  valueToEquals = null
  constructor({ message = 'This is a required field', code = 'required', isRequired=true, valueToEqual=null } = {}) {
    super({ message, code, isRequired })
    this.valueToEquals = valueToEqual
  }

  // override if needed
  get enableValidate() {
    return this.isRequired
  }

  // caller method that gets executed by the validate method
  call(value: any) {
    if (!this.enableValidate && !notNullOrUndefined(value)) {
      return
    }
    // you can use any of the provided utility functions
    if (!notNullOrUndefined(value)) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    } else if (value !== valueToEqual) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}
```

**_Dynamic Validator_**

```
export class MustMatchValidator extends Validator {
  matcher: string | null
  #matchingField: any

  constructor({ message = 'Value must match', code = 'mustMatch', isRequired=true, matcher = '' } = {}) {
    super({ message, code, isRequired })
    this.matcher = matcher
  }

  // override if needed
  // set matching field is required to set dynamically follow the matching field's value
  setMatchingField(form: IForm<any>) {
    if (this.matcher && form.field[this.matcher]) {
      this.#matchingField = form.field[this.matcher]
      return
    }
    throw new Error('Matching Field does not exist on form')
  }
  // override if needed
  get matchingVal() {
    return this.#matchingField ? this.#matchingField.value : null
  }

  // override if needed
  get enableValidate() {
    return this.isRequired
  }

  call(value: any) {
    if (!this.enableValidate && !notNullOrUndefined(value)) {
      return
    }

    if (this.matchingVal !== value) {
      throw new Error(
        JSON.stringify({
          code: this.code,
          message: `${this.message}`,
        }),
      )
    }
  }
}
```

## Future Enhancments

- Add Dynamic validator types to the form class to handle on its own
- Make dynamic versions of min/max value/date validators
- Add async validators
- Add field accessor (to reduce verbosity) formInstance.formField should act as formInstance.field.formField
- Add additional options for form fields (placeholder, id, type, etc) to let users loop over formInstance.fields accessor
- add reset form function which re-applies initial value from form class to instance
- (optional) Add vue and react directives (framework)
- (optional) Add vue and react components (framework)

# Change Log

#### v3.2.0 release date _06/12/2024_

- Fix missing export issue

#### v3.1.92 release date _06/12/2024_

- Always try to convert to real date

#### v3.1.91 release date _06/12/2024_

- Fix exports bug

#### v3.1.9 release date _06/12/2024_

- Dynamic Minimum Date Validator was added.

#### v3.1.8 release date _08/21/2023_

- Export FormLevelValidator class.

#### v3.1.7 release date _08/21/2023_

- Bump package versions to address security issues in dependencies.

#### v3.1.1 release date _01/04/2023_

- Prevent value to be null rather allow it to be undefined, so that we don't force users to coalesce their values when assigning to inputs

#### v3.1.0 release date _01/04/2023_

- Removed es7 private variables to accomodate Vue3 Proxies

#### v3.0.0 release date _01/04/2023_

- TN-Forms built with typescript
- Removed adding dynamic validators to formarrays

#### v1.0.7 release date _06/13/2021_

- Dynamic Validators can now be added to the form with the static variable dynamicFormValidators
- dynamicFormValidators is a reserved keyword for dynamic form level validators

#### v1.0.8 release date _07/13/2021_

- Update to class copy method for bugfix array values in memory

#### v1.0.9 release date _07/13/2021_

- Bugfix for v1.0.8

#### v1.0.10 release date _07/13/2021_

- Issue with building new code

#### v2.0 release date _07/13/2021_

- Moved tn-validators to this package

#### v2.0.1 & v2.0.2 & v2.0.3 release date _11/11/2021_

- Re-organized files

#### v2.0.4 release date _11/11/2021_

- Added Url and Pattern validators

#### v2.0.5 release date _11/11/2021_

- fields as direct properties

#### v2.0.6 release date _11/11/2021_

- bug in max/min value validator fixed

#### v2.0.7 release date _11/15/2021_

- bug in field value was incorrectly being set for FormArrays. Error was triggered because kwargs will now contain direct assignment of field (this error was pre-existing but did not trigger)

#### v2.0.8 release date _11/30/2021_

- bug error for value fixed

#### v2.0.9 release date _11/30/2021_

- bug error for value fixed

#### v2.0.0 release date _07/13/2021_

- Moved tn-validators to this package

#### v2.1.0 release date _06/14/2022_

- Changed from momentjs to luxon
- Updated babel and webpack to resolve chokidar security vuln.
