import { describe, expect, it } from 'vitest'
import { createForm } from '../src/builder'
import { RequiredValidator } from '../src/validators'

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
  })
  //Future features
  it('updates a field value', () => {
    //TODO:
  })
  it('can replicate a form', () => {
    //TODO:
  })
  it('can validate a form', () => {
    //TODO::
  })
  // NEW !
  it('Can use zod validators', () => {
    //TODO:
  })
})
