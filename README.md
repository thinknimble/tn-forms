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
<summary>TypeScript</summary>

## Stanalone Fields 
```ts
import { FormField } from '../src/forms'
import { IFormField } from '../src/interfaces'
import {
  RequiredValidator,
} from '../src/validators'

let email:IFormField = new FormField({value:"Init Value", validators:[new RequiredValidator()], name:'email',id:"my-field",label:"email label"}) 
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
```ts

// Build the interface to retrieve th fields in dot notation
// optionally provide a type for the value of each field IFormField<type> any is used as a default

interface IUserForm {
  firstName: IFormField<string>
  password: IFormField
  confirmPassword: IFormField
  dob: IFormField
  email: IFormField
  address: IFormArray<IUserAddressForm>
}

class UserForm extends Form<IUserForm> {
  static firstName = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })
  static email = new FormField({ validators: [new EmailValidator()], label:"Email" })
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
<input type="text" :name="userForm.firstName.name" :placeholder="userForm.firstName.name" v-model="userForm.firstName.value" /> 
```
To use shorthand field method (access a field with dot notation) you need to decalre a union type of the form and its interface 

```ts
type TUserForm = UserForm & IUserForm
const userForm = new UserForm() as TUserForm 
```
this will give you direct access to the fields as properties of the class 

```html 

<!-- Vue.js -->
<label :for="userForm.firstName.label">{{userForm.firstName.label}}</label>
<input type="text" :name="userForm.firstName.name" :placeholder="userForm.firstName.name" v-model="userForm.firstName.value" /> 
```


## Dynamic Form with form arrays
```ts 
interface IUserAddressForm {
  street: IFormField
  city: IFormField
}

class UserAddressForm extends Form<IUserAddressForm> {
  static street = new FormField({ validators: [], value: 'this', label:"Street" })
  static city = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })

}
```

```html 

<!-- Vue.js -->
<label :for="userForm.firstName.label">{{userForm.firstName.label}}</label>
<input type="text" :name="userForm.firstName.name" :placeholder="userForm.firstName.name" v-model="userForm.firstName.value" /> 
<label :for="userForm.adress.groups[0].street.label">{{userForm.adress.groups[0].street.label}}</label>
<input type="text" :name="userForm.adress.groups[0].street.name" :placeholder="userForm.adress.groups[0].street.name" v-model="userForm.adress.groups[0].street.value" /> 

```
## Add Dynamic validators on the fly
```ts 

// This method is useful for adding dynamic validators on the fly in response to other fields 

// Note for react this method is preferred to confrom to react's deep object mutability

type TUserForm = UserForm & IUserForm
const userForm = new UserForm() as TUserForm 
userForm.addFormLevelValidator("firstName",new MinLengthValidator())

```


</details>

<details>
<summary>Javascript</summary>

## Stanalone Fields 
```js
import { FormField } from '../src/forms'
import { IFormField } from '../src/interfaces'
import {
  RequiredValidator,
} from '../src/validators'

let email = new FormField({value:"Init Value", validators:[new RequiredValidator()], name:'email',id:"my-field",label:"email label"}) 
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
  static email = new FormField({ validators: [new EmailValidator()], label:"Email" })
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
<input type="text" :name="userForm.firstName.name" :placeholder="userForm.firstName.name" v-model="userForm.firstName.value" /> 
```


```js
const userForm = new UserForm()
```

```html 

<!-- Vue.js -->
<label :for="userForm.firstName.label">{{userForm.firstName.label}}</label>
<input type="text" :name="userForm.firstName.name" :placeholder="userForm.firstName.name" v-model="userForm.firstName.value" /> 
```


## Dynamic Form with form arrays
```js

class UserAddressForm extends Form {
  static street = new FormField({ validators: [], value: 'this', label:"Street" })
  static city = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })

}
```

```html 

<!-- Vue.js -->
<label :for="userForm.firstName.label">{{userForm.firstName.label}}</label>
<input type="text" :name="userForm.firstName.name" :placeholder="userForm.firstName.name" v-model="userForm.firstName.value" /> 
<label :for="userForm.adress.groups[0].street.label">{{userForm.adress.groups[0].street.label}}</label>
<input type="text" :name="userForm.adress.groups[0].street.name" :placeholder="userForm.adress.groups[0].street.name" v-model="userForm.adress.groups[0].street.value" /> 

```
## Add Dynamic validators on the fly
```js 

// This method is useful for adding dynamic validators on the fly in response to other fields 

// Note for react this method is preferred to confrom to react's deep object mutability

const userForm = new UserForm()
userForm.addFormLevelValidator("firstName",new MinLengthValidator())

```
</details>

## Validators ##

validators can be added to forms they all extend the base Validator class

```
    new RequiredValidator({minLength: int})
```

**RequiredValidator**
Validates a field is not null, undefiend or empty 

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
export class MyValidator extends Validator {
  // if you intend to override the default variables message & code define a constructor with a call to super
  // you can pass additional variables as well

  valueToEquals = null
  constructor({ message = 'This is a required field', code = 'required', valueToEqual=null } = {}) {
    super({ message, code })
    this.valueToEquals = valueToEqual
  }
  // caller method that gets executed by the validate method
  call(value: any) {
    // you can use any of the provided utility functions
    if (!notNullOrUndefined(value)) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    } else if (value !== valueToEqual) {
      throw new Error(JSON.stringify({ code: this.code, message: this.message }))
    }
  }
}
```

*** Dynamic Validator ***
```
export class MustMatchValidator extends Validator {
  matcher: string | null
  #matchingField: any

  constructor({ message = 'Value must match', code = 'mustMatch', matcher = '' } = {}) {
    super({ message, code })
    this.matcher = matcher
  }
  
  // set matching field is required to set dynamically follow the matching field's value
  setMatchingField(form: IForm<any>) {
    if (this.matcher && form.field[this.matcher]) {
      this.#matchingField = form.field[this.matcher]
      return
    }
    throw new Error('Matching Field does not exist on form')
  }

  get matchingVal() {
    return this.#matchingField ? this.#matchingField.value : null
  }

  call(value: any) {
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



## Future Enhancments ##

- Add Dynamic validator types to the form class to handle on its own 
- Make dynamic versions of min/max value/date validators
- Add async validators
- Add field accessor (to reduce verbosity) formInstance.formField should act as formInstance.field.formField
- Add additional options for form fields (placeholder, id, type, etc) to let users loop over formInstance.fields accessor
- add reset form function which re-applies initial value from form class to instance
- (optional) Add vue and react directives (framework)
- (optional) Add vue and react components (framework)

# Change Log

#### v1.0.7 release date _06/13/2021_

- Dynamic Validators can now be added to the form with the static variable dynamicFormValidators
- dynamicFormValidators is a reserved keyword for dynamic form level validators


#### v1.0.8 release date _07/13/2021_

- Update to class copy method for bugfix array values in memory



#### v1.0.9 release date _07/13/2021_

- Bugfix for v1.0.8



#### v1.0.10 release date _07/13/2021_

- Issue with building new code
#### v2.0 release date *07/13/2021* #### 
- Moved tn-validators to this package 

#### v2.0.1 & v2.0.2 & v2.0.3 release date *11/11/2021* #### 
- Re-organized files 

#### v2.0.4 release date *11/11/2021* #### 
- Added Url and Pattern validators

#### v2.0.5 release date *11/11/2021* #### 
- fields as direct properties

#### v2.0.6 release date *11/11/2021* #### 
- bug in max/min value validator fixed

#### v2.0.7 release date *11/15/2021* #### 
- bug in field value was incorrectly being set for FormArrays. Error was triggered because kwargs will now contain direct assignment of field (this error was pre-existing but did not trigger)
#### v2.0.8 release date *11/30/2021* #### 
- bug error for value fixed
#### v2.0.9 release date *11/30/2021* #### 
- bug error for value fixed


#### v2.0.0 release date _07/13/2021_
- Moved tn-validators to this package

#### v2.1.0 release date _06/14/2022_
- Changed from momentjs to luxon 
- Updated babel and webpack to resolve chokidar security vuln.

