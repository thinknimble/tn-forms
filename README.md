# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Summary of set up
* Configuration
* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### How To Use 

The main components of the Forms Service are the FormField and Form classes
The Form class is a collection of FormFields statically defined 
The FormField class is defined with a constructor and creates a new FormField with an initial value, a collection of validators, initial errors and a name
 
FormFields can be used independently to create loosley couple forms. 
FormFields have a isValid getter that checks if a field is valid without returning errors to the field. If you would like to return errors call the validate method on the instance itself. This allows the user to disable certain functions without necessarily calling errors. For example to disable a submit button before the user has interacted with the fields
Validators can be dynamically added with the addValidatorMethod 
Errors can be retrieved with the errors getter however this does not call validate validate must be called to populate errors




Forms are a collection of FormFields and are declared statically (with factory functions)

class UserForm extends Form{
    static firstName= new FormField({validators: [new MinLengthValidator(minLength: 10)]})

}
optional inital values and errors can be set here as well

Once you have created your form model you can then use this model to create an instance of your form 

userForm = new UserForm({firstName:''}) 

your instantiated form must contain the statically defined fields only and an optional value can be passed here as well. 
you may also dynamically add validators to the form that will be applied to the field using the addValidator method on the form instance 


 this.userForm.addValidator('firstName', new MinLengthValidator({minLength:10}))

when the form is complete you can call the value getter to get a json object of the form value which is a collection of key value pairs of the statically defined form fields 

The Form class also contains a getter to get a field directly, the getter returns an array of fields so passing in the field key as an object reference will return the field itself 

this.userForm.field['firstName']

you may also retrieve and array of the fields within a form using the fields getter, you may use this to create a form template with a loop 

<template v-for="f in userForm.fields">
    <input type="text" :name="f.name" v-model="f.value">
</template>

Forms can also contain FormArrays which are a collection of Form Fields and are esentially a wrapper of the Form class 

#js
```

    class UserAddressForm extends Form {
        static street = new FormField({ validators: [] })
        static city = new FormField({ validators: [new MinLengthValidator({ minLength: 5 })] })
    }
    class UserForm extends Form{
        static firstName= new FormField({validators: [new MinLengthValidator(minLength: 10)]})
        static address = new FormArray({
            name: 'address',
            groups: [new UserAddressForm()],
  })

        }

Then to add an instance to the array call the addToArray method
```addAddress() {
      this.userForm.addToArray('address', new UserAddressForm())
    },



Adding dynamic validators works slightly different 

```this.userForm.addValidator('address', new MinLengthValidator({ minLength: 10 }), 'street')
  

For cross field validation you must add them dynamically 

    this.userForm.addValidator(
      'confirmPassword',
      new MustMatch({
        matcher: this.userForm.field['password'],
        message: 'Passwords do not match',
      }),
    )

Similarly the Forms class also has the isValid methods that checks the validity of all form fields without returning errors but calling validate does return the errors for each field. 

Access Form errors with the errors getter 
```userForm.errors 

