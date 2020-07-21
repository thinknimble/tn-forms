import assert from 'assert'

import { objectToCamelCase } from '@thinknimble/tn-utils'

import Model, { fields } from '../src/models'

import validators from '../src/validation'
import { NumberValidator } from '../src/validation'

// const API = require('./api')

describe('Model', function() {
  class Hat extends Model {
    static hatName = new fields.CharField()

    static fromAPI(json = {}) {
      return new Hat(objectToCamelCase(json))
    }
  }

  class Person extends Model {
    static id = new fields.IdField()
    static name = new fields.CharField()
    static ticketNumber = new fields.IntegerField()
    static hat = new fields.RelatedObjectField({ modelClass: Hat })
  }

  describe('#constructor()', function() {
    const person = new Person()

    it('should have keys for each static property', function() {
      // This should be equal to 3 as the person will have a value for 'id', a '_fields' array, and an 'errors' array.
      assert.equal(Object.keys(person).length, 3)
    })

    it('should properly serialized nested object fields', function() {
      const p = new Person({ name: 'Donald Duck', hat: { hat_name: 'Hat of Donald' } })
      assert.equal(Object.keys(p).includes('hat'), true)
      // Make sure each field of the nested object was converted to camelCase
      const h = p.hat
      assert.equal(h.hatName, 'Hat of Donald')
    })
  })

  describe('#validate()', function() {
    const person = new Person({ ticketNumber: 'not a number' })

    it('should raise an error if any field-level validation fails', function() {
      if (person.isValid) {
        assert.fail('Validation should have thrown an Error')
      } else {
        assert.ok(person.errors)
      }
    })

    it('should do nothing if validation is successful', function() {
      const p = new Person({ ticketNumber: 123 })
      if (!p.isValid) {
        assert.fail('Validation was not successful')
      }
    })
  })

  describe('#validateField(fieldName)', function() {
    const person = new Person({ ticketNumber: 'not a number' })

    it('should raise an error if field validation fails', function() {
      const errors = person.validateField('ticketNumber')
      if (!errors.length) {
        assert.fail('Validation shuld have thrown an Error')
      }
      assert.equal(errors.length, 1)
    })

    it('should do nothing if field validation is successful', function() {
      const p = new Person({ ticketNumber: 123 })
      const errors = p.validateField('ticketNumber')
      if (errors.length) {
        assert.fail('Validation was not successful')
      }
    })

    it('should do nothing if supplied field name is not present on the model definition', function() {
      const errors = person.validateField('randomField')
      if (errors.length) {
        assert.fail('An error was thrown when it should not be')
      }
    })
  })
})

describe('Field', function() {
  class TestField extends fields.Field {
    static defaultValidators = [new NumberValidator()]
  }

  class Person extends Model {
    static test = new TestField()
  }

  describe('#constructor()', function() {
    it('should assign staticly set default validators to the field instance', function() {
      const person = new Person()
      const defaultValidators = person._fields['test']['defaultValidators']
      assert.equal(defaultValidators.length, 1)
    })
  })

  describe('#runValidators()', function() {
    it('should raise an error if any default validators fail', function() {
      const field = new TestField()
      const isValid = field.isValid('123')
      if (isValid) {
        assert.fail('Field validation should have thrown an Error')
      }
      assert.equal(field.errors.length, 1)
    })

    it('should raise an error if a null value is passed in for a field that is not nullable', function() {
      const field = new TestField({ allowNull: false })
      const isValid = field.isValid(null)
      if (isValid) {
        assert.fail('Field validation should have thrown an error')
      }
      assert.equal(field.errors.length, 2)
      assert.equal(field.errors.includes('Value cannot be null'), true)
    })

    it('should do nothing if a null value is passed in for a field that is nullable', function() {
      const field = new TestField()
      const isValid = field.isValid(null)
      if (!isValid) {
        assert.fail('An error was thrown when it should not be')
      }
    })

    it('should override a default validator if a new instance of the same validator is supplied during creation', function() {
      const field = new TestField({
        validators: [new NumberValidator({ message: 'This is an overriden validator' })],
      })
      const isValid = field.isValid('this is not a number')

      if (isValid) {
        assert.fail('Field validation should have thrown an error')
      }
      assert.equal(field.errors.length, 1)
      const error = field.errors[0]
      assert.equal(error, 'This is an overriden validator')
    })

    describe('RelatedObjectField', function() {
      class Person extends Model {
        static id = new fields.IdField()
        static name = new fields.CharField()
        static ticketNumber = new fields.IntegerField()

        static fromAPI(json = {}) {
          return new Person(objectToCamelCase(json))
        }
      }

      const field = new fields.RelatedObjectField({ modelClass: Person })

      describe('#toInternalValue(value)', function() {
        it('should convert a value using the fromAPI() function of the supplied model class', function() {
          try {
            const obj = field.toInternalValue({ id: '123', ticket_number: 1 })
            assert.equal(obj.ticketNumber, 1)
            assert.equal(Object.keys(obj).length, 4)
          } catch (err) {
            assert.fail('An error was thrown when it should not be')
          }
        })

        it('should convert an array of objects using the fromAPI() function of the supplied model class', function() {
          try {
            const obj = field.toInternalValue([
              { id: '123', ticket_number: 1 },
              { id: '456', ticket_number: 2 },
            ])
            assert.equal(obj.length, 2)
            assert.equal(obj[0]['ticketNumber'], 1)
            assert.equal(obj[1]['ticketNumber'], 2)
          } catch (err) {
            assert.fail('An error was thrown when it should not be')
          }
        })
      })
    })
  })
})
