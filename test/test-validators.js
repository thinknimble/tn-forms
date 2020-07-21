import assert from 'assert'

import validators from '../src/validation'
import { NumberValidator, MinLengthValidator } from '../src/validation'

describe('Validators', function() {
  describe('#NumberValidator', function() {
    it('should throw an error if the supplied value is not a number', function() {
      const validator = new NumberValidator()
      try {
        validator.call('what')
        assert.fail('Field validation should have thrown an error')
      } catch (err) {}
    })

    it('should do nothing if a valid number is supplied', function() {
      const validator = new NumberValidator()
      try {
        validator.call(42)
      } catch (err) {
        assert.fail('An error was thrown when it should not be')
      }
    })

    it('should return a custom error message if one is passed in', function() {
      const validator = new NumberValidator({ message: 'Custom message' })
      // const field = new fields.Field({validators: [new NumberValidator({message: 'Custom message'})]})
      try {
        validator.call('what')
        assert.fail('Validation should not have been successful')
      } catch (err) {
        assert.equal(err.message, 'Custom message')
      }
    })
  })

  describe('#MinLengthValidator', function() {
    const validator = new MinLengthValidator({ minLength: 8 })

    it('should throw an error if the supplied value is less than the required length', function() {
      try {
        validator.call('what')
        assert.fail('Field validation should have thrown an error')
      } catch (err) {}
    })

    it('should do nothing if a valid number is supplied', function() {
      try {
        validator.call('eighteight')
      } catch (err) {
        assert.fail('An error was thrown when it should not be')
      }
    })

    it('should return a custom error message if one is passed in', function() {
      const newValidator = new MinLengthValidator({ minLength: 8, message: 'Custom message' })
      try {
        newValidator.call('four')
        assert.fail('Validation should not have been successful')
      } catch (err) {
        assert.equal(err.message, 'Custom message')
      }
    })

    it('should throw an error if a value that can not be coerced to a string is supplied', function() {
      try {
        validator.call({ val: 'This is a random object' })
        assert.fail('Validation should not have been successful')
      } catch (err) {}
    })
  })
})
