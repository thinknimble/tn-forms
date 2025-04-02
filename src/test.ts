import { createForm } from './builder'
import {
  EmailValidator,
  MinLengthValidator,
  MustMatchValidator,
  RequiredValidator,
} from './validators'

const accountForm = createForm()
  .addField({
    name: 'firstName',
    label: 'First name',
    placeholder: 'First Name',
    type: 'text',
    validators: [new RequiredValidator({ message: 'Please enter your first' })],
    value: '',
  })
  .addField({
    name: 'lastName',
    label: 'Last Name',
    placeholder: 'Last Name',
    type: 'text',
    validators: [new RequiredValidator({ message: 'Please enter your last name' })],
    value: '',
  })
  .addField({
    name: 'email',
    label: 'Email',
    placeholder: 'Email',
    type: 'email',
    value: '',
    validators: [new EmailValidator({ message: 'Please enter a valid email' })],
  })
  .addField({
    name: 'password',
    label: 'Password',
    placeholder: 'Password',
    type: 'password',
    validators: [
      new MinLengthValidator({
        minLength: 8,
        message: 'Please enter a password with a minimum of 8 characters',
      }),
    ],
    value: '',
  })
  .addField({
    name: 'confirmPassword',
    label: 'Confirm Password',
    placeholder: 'Confirm Password',
    type: 'password',
    value: '',
    validators: [],
  })
  .addFormLevelValidator(
    'confirmPassword',
    new MustMatchValidator({
      message: 'Passwords must match',
      matcher: 'password',
    }),
  )
