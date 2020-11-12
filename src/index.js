export class FormField {
  _value = null
  _errors = []
  _validators = []

  constructor({ name = '', validators = [], errors = [], value = '' } = {}) {
    Object.assign(this, {
      _validators: validators,
      _errors: errors,
      _value: value,
      name: name,
    })
  }
  static create(data = {}) {
    return new FormField(data)
  }
  validate() {
    this.errors = []
    this.validators.map((val) => {
      if(!val){
        // fails if null is added to list of validators
        
        return 
      }
      try {
        val.call(this.value)
      } catch (e) {
        const err = JSON.parse(e.message)
        this.errors.push(err)
      }
    })
  }
  get isValid() {
    try {
      this.validators.forEach((v) => {
        v.call(this.value)
      })
    } catch (e) {
      return false
    }
    return true
  }
  get errors() {
    return this._errors
  }
  set errors(error) {
    this._errors = error
  }
  set value(value) {
    this._value = value
  }
  get value() {
    return this._value
  }
  get validators() {
    return this._validators
  }
  set validators(validator) {
    this.validators = validator
  }
  addValidator(validator) {
    this._validators.push(validator)
  }
}

export default class Form {
  constructor(kwargs = {}) {
    this._fields = {}
    for (const prop in this.constructor) {
      if (this.constructor[prop] instanceof FormField) {
        // create a copy of the new Field instance as they point to the same object in memory
        this._fields[prop] = this.copy(this.constructor[prop])
      }
      if (this.constructor[prop] instanceof FormArray) {
        // create a copy of the new FieldArray instance as they point to the same object in memory
        this._fields[prop] = this.copyArray(this.constructor[prop])
      }
    }
    for (const fieldName in this._fields) {
      const field = this._fields[fieldName]
      if (field instanceof FormField) {
        // Optionally set the value of the field either from the constructor of the instance
        // or the constructor of the parent form class latest priority first
        field.value = kwargs[fieldName] ? kwargs[fieldName] : field.value
        field.name = fieldName
      }
    }
  }
  get field() {
    // helper getter to return the fields
    // users can access fields with xxx.field['fieldName']
    return this._fields
  }
  get fields() {
    let arr = []
    for (const fieldName in this._fields) {
      // return an array of fields for easier loop access
      arr.push(this._fields[fieldName])
    }

    return arr
  }
  copy(opts = {}) {
    return new FormField(opts)
  }
  copyArray(opts = {}) {
    let groups = opts.groups.map((g) => new g.constructor(g))
    return new FormArray({ ...opts, groups })
  }
  _handleNoFieldErrors(fieldName) {
    try {
      let field = this.field[fieldName]
      if (!field) {
        throw new Error(
          JSON.stringify({
            code: 'no_field',
            message: `${this.constructor.name} does not contain ${fieldName} field`,
          }),
        )
      }
    } catch (e) {
      throw e
    }
  }

  addToArray(formArrayName, form) {
    /** Add a new instance of a form to a formarray
     * @fromArrayName requred string name of the formarray to attach to
     * @form new instance of the Form eg new AddressForm
     */
    this._handleNoFieldErrors(formArrayName)
    if (this.field[formArrayName] instanceof FormArray) {
      this.field[formArrayName].add(form)
    }
  }
  removeFromArray(formArrayName, index) {
    /** Remove an instance from a FormArray
     * @formArrayName required string name of the formarray
     * @index requred number the index of the instance to remove
     */

    this._handleNoFieldErrors(formArrayName)

    if (this.field[formArrayName] instanceof FormArray) {
      this.field[formArrayName].remove(index)
    }
  }
  addValidator(fieldName, validator, extraArgs = null) {
    /** Add Validators on the fly to certain fields
     * @fieldName required string the field name to attach a validator to
     * @validator the validator as a new instance
     * @extraArgs if a field is a form array pass in the fieldName of its field
     * Note for formArrays all instances will receive the validator
     */
    this._handleNoFieldErrors(fieldName)
    if (this.field[fieldName] instanceof FormArray && extraArgs) {
      this.field[fieldName].groups.forEach((g) => {
        if (g.field[extraArgs]) {
          g.field[extraArgs].addValidator(validator)
        }
      })
    } else if (this.field[fieldName] instanceof FormField) {
      this.field[fieldName].addValidator(validator)
    }
  }
  validate() {
    this.fields.forEach((f) => {
      if (f instanceof FormField) {
        f.validate()

       /*  if (!f.isValid) return (this.isValid = false)
        else return (this.isValid = true) */
      }
      if (f instanceof FormArray) {
        f.groups.forEach((fg) => {
          fg.fields.forEach(f=>{
            f.validate()
        /*     if(!f.isValid) return this.isValid=false 
            else return this.isValid=true */
          })
        })
      }
    })
  }
  get errors() {
    /** Returns an array of field errors in the format name:string, value:string, errors:str[]*/
    try {
      return this.fields.reduce((acc, curr) => {
        if (curr instanceof FormArray) {
          let groupErrors = curr.groups.reduce((groupAcc, groupCurr) => {
            if (!groupCurr.isValid || groupCurr.errors.length > 0) {
              if (!groupAcc) {
                groupAcc = []
              }
              groupAcc.push({
                value: curr.value,
                errors: groupCurr.errors,
              })

              return groupAcc
            }
          }, [])
          if (groupErrors && groupErrors.length > 0) {
            let errorObj = { [curr.name]: groupErrors }
            acc.push(errorObj)
          }
        }
        if (curr instanceof FormField) {
          if (!curr.isValid || curr.errors.length > 0) {
            acc.push({ name: curr.name, value: curr.value, errors: curr.errors })
            return acc
          }
        }

        return acc
      }, [])
    } catch (e) {
      return e
    }
  }
  set errors(errs) {
    if(Array.isArray(errs)){
      this._errors = errs
    }else{
      this._errors=[errs]
    }
    
  }
  get value() {
    return this.fields.reduce((acc, curr) => {
      acc[curr.name] = curr.value
      return acc
    }, {})
  }
  get isValid() {
    try {
      this.fields.forEach((f) => {
        if (f instanceof FormField) {
          if (!f.isValid) {
            throw new Error(`${f.name} is invalid`)
          }
        } else if (f instanceof FormArray) {
          f.groups.forEach((fg) => {
            if (!fg.isValid) {
              throw new Error()
            }
          })
        } else {
          return this.isValid
        }
      })
    } catch (e) {
      return false
    }
    return true
  }
  set isValid(valid) {
    this.isValid = valid
  }
}
export class FormArray {
  _value = null
  _errors = []
  _groups = []
  constructor({ name = '', groups = [new Form()], value = null } = {}) {
    Object.assign(this, {
      name: name,
      _value: value,
      _groups: groups,
    })
  }
  get value() {
    return this._groups.map((f) => {
      return f.value
    })
  }
  set value(value) {
    this._value = value
  }
  get groups() {
    return this._groups
  }

  add(group = new Form()) {
    this._groups.push(group)
  }
  remove(index) {
    this.groups.splice(index, 1)
    this._groups = this.groups
  }
}
