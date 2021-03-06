# TN Forms

## Installation

```
npm i -S @thinknimble/tn-forms
```

## Stand alone fields

[check out form validators as well]('https://bitbucket.org/thinknimble/tn-validators/src/master/)

Fields can be initated without needing a whole form and have access to (almost) all the form methods with optional parameters

```
email = new FormField({value:"Init Value", validators:[new RequiredValidator()], name:'email'})

// get the value
email.value

// check if the field is valid ( calls the validate method silently)
email.isValid

// validate the field
email.validate()

//get the errors (must call the validate method first)
email.errors

// bind to gield
<input type="text" :name=email.name />

```

## Form

**Create a new form instance**

_form.js_

```

class UserRegistration form extends Form {
static fullName = new FormField({ validators: [new RequiredValidator()] })
static email = new FormField({ validators: [new RequiredValidator(), new EmailValidator()] })
static password = new FormField({
    validators: [
      new RequiredValidator(),
      new MinLengthValidator({ minLength: 10, message: 'Minimum Length of 10 required' }),
    ],
  })
static confirmPassword = new FormField({ validators: [new RequiredValidator()] })

}

```

**Instatiate a form to a variable**

_Form.vue_

```
data(){
    return {
        registrationForm = new UserRegistrationForm()
    }
}

// use with the Tn field component (optionally)

<FormField @blur="registrationForm.field.validate()" :errors="registrationForm.field.errors" v-model="registrationForm.field.value">


// For dynamic validators (such as cross field validators) the validator must be added using the static dynamicFormValidators which accepsts an object of key value (field to apply the validator to) and value (an array of dynamic validators) pairs

class UserForm extends Form {
....
static password = new FormField()
static confirmPassowrd = new FormField()

  static dynamicFormValidators = {
    confirmPassword: [new MustMatchValidator({ matcher: 'password' })],
  }

....
}

// Get the form data

methods:{
    onSubmitForm(){

        // optionally validate the form to retrieve all errors
        this.registrationForm.validate()

        // check the form is valid before submitting (.isValid validates form silently)
        this.registrationForm.isValid

        // get the form value (returns a dict of key value pairs)

        const val = this.registrationForm.value
    }
}



```

**Dynamic Forms**
_form.js_

```
class UserAddressForm extends Form {
    static street = new FormField({})
    static city = new FormField({})
    static state = new FormField({})
    static zipcode = new FormField({validators:[new MinValueValidator({min:10})]})
}

class UserRegistration form extends Form {
static fullName = new FormField({ validators: [new RequiredValidator()] })
  static email = new FormField({ validators: [new RequiredValidator(), new EmailValidator()] })
  static password = new FormField({
    validators: [
      new RequiredValidator(),
      new MinLengthValidator({ minLength: 10, message: 'Minimum Length of 10 required' }),
    ],
  })
  static confirmPassword = new FormField({ validators: [new RequiredValidator()] })
  static addresses = new FormArray({name:'addresses' groups:[new UserAddressForm()]})
}


```

_Form.vue_

```
<FormField
placeholder="day"
:errors="form.field.recurrenceDay.errors"
@blur="form.field.recurrenceDay.validate()"
v-model="form.field.recurrenceDay.value"
small
/>
<button @click="onAddAddress"></button>


//Dynamically add new address using the built in methods

methods:{
    ...
    onAddAddress(){
        this.userRegistration.addToArray('addresses',new UserAddressForm())
    }m
    onRemoveAddress(){
         this.alertTemplateForm.removeFromArray('alertGroups', i)
    }
}

// Add the forms to the html template with an array

<div
class="alerts-page__settings"
:key="i"
v-for="(form, i) in alertTemplateForm.field.addresses.groups"
>
<FormField
    placeholder="day"
    :errors="form.field.recurrenceDay.errors"
    @blur="form.field.recurrenceDay.validate()"
    v-model="form.field.recurrenceDay.value"
    small
    />
</div>




```

## Validators ##

validators can be added to forms they all extend the base Validator class

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
Validates a field matches a value (dynamic)
```
  //dynamic 
  new MustMatchValidator({matcher?: string<fieldName>,form?:<FormField>})



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

