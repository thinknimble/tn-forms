import assert from 'assert'
import moment from 'moment'

import {
  MinLengthValidator,
  EmailValidator,
  RequiredValidator,
  MinDateValidator,
  MaxDateValidator,
  UrlValidator,
  PatternValidator,
} from '../src/index.js'

describe('#emailValidator', function () {
  it('should throw an error if the supplied value is not an email', function () {
    const validator = new EmailValidator()
    try {
      validator.call('what')
    } catch (err) {
      assert.strictEqual(JSON.parse(err.message).code, 'invalidEmail')
    }
  })
  it('should throw an error for nulls', function () {
    const validator = new EmailValidator()
    try {
      validator.call(null)
    } catch (err) {
      assert.strictEqual(JSON.parse(err.message).code, 'invalidEmail')
    }
  })
  it('should not throw an error for multidomain email', function () {
    const validator = new EmailValidator()

    validator.call('pari@baker.com.cy')
  })
})

describe('#MinLengthValidator', function () {
  const validator = new MinLengthValidator({ minLength: 8 })

  it('should throw an error if the supplied value is less than the required length', function () {
    try {
      validator.call('what')
    } catch (err) {
      assert.strictEqual(JSON.parse(err.message).code, 'minLength')
    }
  })

  it('should throw an error if the supplied value is null', function () {
    try {
      validator.call(null)
    } catch (err) {
      assert.strictEqual(JSON.parse(err.message).code, 'minLength')
    }
  })

  it('throw an error if the value is a number less than the length ', function () {
    try {
      validator.call(8)
    } catch (err) {
      assert.strictEqual(JSON.parse(err.message).code, 'minLength')
    }
  })

  it('should throw an error if a value that can not be coerced to a string is supplied', function () {
    try {
      validator.call({ val: 'This is a random object' })
    } catch (err) {
      console.log(err)
      assert.strictEqual(JSON.parse(err.message).code, 'minLength')
    }
  })
})

describe('#RequiredValidator', function () {
  let message = 'Failed to validate'
  const validator = new RequiredValidator({ message: 'Failed to validate' })

  it('should throw an error if the supplied value  null', function () {
    try {
      validator.call(null)
    } catch (e) {
      assert.strictEqual(JSON.parse(e.message).message, message)
    }
  })
  it('should not throw an error if this list has an item', function () {
    validator.call(['1'])
  })
  it('should throw an error if the supplied value is empty array', function () {
    try {
      validator.call([])
    } catch (e) {
      assert.strictEqual(JSON.parse(e.message).message, message)
    }
  })
  it('should not throw an error based on length', function () {
    try {
      validator.call('')
    } catch (e) {
      assert.strictEqual(JSON.parse(e.message).message, message)
    }
  })
})
describe('#MinDateValdiator', function () {
  let message = 'Please Enter a date after this date'
  const validator = new MinDateValidator({ message: message })

  it('Should throw an error if date is null', function () {
    try {
      validator.call(null)
    } catch (e) {
      assert.strictEqual(JSON.parse(e.message).code, 'minDate')
    }
  })
  it('Should throw an error if date is less than', function () {
    try {
      validator.call(moment().subtract(1, 'days'))
    } catch (e) {
      assert.strictEqual(JSON.parse(e.message).code, 'minDate')
    }
  })
  it('Should not throw an error if date is greater than', function () {
    validator.call(moment().add(1, 'days'))
  })
})
describe('#MaxDateValdiator', function () {
  let message = 'Please Enter a date after this date'
  const validator = new MaxDateValidator({ message: message })

  it('Should throw an error if date is null', function () {
    try {
      validator.call(null)
    } catch (e) {
      assert.strictEqual(JSON.parse(e.message).code, 'maxDate')
    }
  })
  it('Should not throw an error if date is less than', function () {
    validator.call(moment().subtract(0, 'days'))
  })
  it('Should throw an error if date is greater than', function () {
    try {
      validator.call(moment().add(1, 'days'))
    } catch (e) {
      assert.strictEqual(JSON.parse(e.message).code, 'maxDate')
    }
  })
})

describe('#UrlValidator', function () {
  let message = 'UrlValidator'
  const validator = new UrlValidator({ message: message })

  it('Should throw an error if date is null', function () {
    try {
      validator.call(null)
    } catch (e) {
      assert.strictEqual(JSON.parse(e.message).code, 'invalidUrl')
    }
  })
  it('Should not throw an error if date is less than', function () {
    validator.call('https://test.com')
  })
  it('Should throw an error if value is not a url', function () {
    try {
      validator.call('test')
    } catch (e) {
      assert.strictEqual(JSON.parse(e.message).code, 'invalidUrl')
    }
  })
})
describe('#UrlValidator', function () {
  let message = 'PatternValidator'
  const validator = new PatternValidator({ message: message, pattern: /[0-9]+/ })

  it('Should throw an error if value is null', function () {
    try {
      validator.call(null)
    } catch (e) {
      assert.strictEqual(JSON.parse(e.message).code, 'invalidPattern')
    }
  })
  it('Should not throw an error if value does pass pattern test', function () {
    validator.call(1234)
  })
  it('Should throw an error if value does not pass pattern test', function () {
    try {
      validator.call('test')
    } catch (e) {
      assert.strictEqual(JSON.parse(e.message).code, 'invalidPattern')
    }
  })
})
