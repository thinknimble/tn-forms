

### Stand alone fields 
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

### Form 

**Create a new form instance**

*form.js*
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

*Form.vue*
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
*form.js*

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
*Form.vue*

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
## Bugs ##

multiple nested form arrays duplicating values when the value is an array 


## Future Enhancments ##

- Add Dynamic validator types to the form class to handle on its own 
- Add async validators
- Add field accessor (to reduce verbosity)


# Change Log
#### v1.0.7 release date *06/13/2021* #### 
- Dynamic Validators can now be added to the form with the static variable dynamicFormValidators
- dynamicFormValidators is a reserved keyword for dynamic form level validators

# Change Log
#### v1.0.8 release date *07/13/2021* #### 
- Update to class copy method for bugfix array values in memory 

# Change Log
#### v1.0.9 release date *07/13/2021* #### 
- Bugfix for v1.0.8 

# Change Log
#### v1.0.10 release date *07/13/2021* #### 
- Issue with building new code

