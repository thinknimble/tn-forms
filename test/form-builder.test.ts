import { describe, expect, it } from 'vitest'
import { createForm } from '../src/builder'
import { FormField } from '../src/forms'
import { EmailValidator, MustMatchValidator, RequiredValidator } from '../src/validators'

describe('Form builder', () => {
  it('should create a form builder', () => {
    const myForm = createForm()
    expect(myForm).toBeDefined()
  })
  it('should add a field', () => {
    const myForm = createForm().addField({
      name: 'email',
      type: 'email',
      validators: [new RequiredValidator()],
      value: 'initial value',
    })
    expect(myForm.fields.email).toBeDefined()
    expect(myForm.fields.email.value).toBe('initial value')
    expect(myForm.fields.email).toBeInstanceOf(FormField)
  })
  it('can replicate a form', () => {
    const myForm = createForm().addField({ name: 'email', type: 'email' })
    const myReplicatedForm = myForm.replicate()
    expect(myReplicatedForm).toBeDefined()
    expect(myReplicatedForm).not.toBe(myForm)
    expect(myReplicatedForm.fields.email).toBeDefined()
  })
  //Future features
  it('updates a field value', () => {
    const myForm = createForm().addField({ name: 'email', type: 'email' })
  })
  it('can validate regular fields', () => {
    const myForm = createForm().addField({
      name: 'email',
      type: 'email',
      validators: [new EmailValidator()],
    })
    myForm.validate()
    expect(myForm.fields.email.errors).toHaveLength(1)
  })
  // NEW !
  it('Can use zod validators', () => {
    //TODO:
  })
  it('Adds a form level validator', () => {
    const myForm = createForm()
      .addField({ name: 'password', type: 'password' })
      .addField({ name: 'confirmPassword', type: 'password' })
    myForm.addFormLevelValidator(
      'password',
      new MustMatchValidator({
        matcher: 'confirmPassword',
        message: 'Passwords must match',
      }),
    )
  })
})
