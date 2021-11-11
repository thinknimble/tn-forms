export class FormField {
    #value = null
    #errors = []
    #validators = []
    #placeholder=''
    #id=null 
    #type=null
  
    constructor({ name = '', validators = [], errors = [], value = '', placeholder='',id=null,type=null } = {}) {
      Object.assign(this, {
  
        #validators: validators,
        #errors: errors,
        #placeholder:placeholder,
        #id:id,
        #type:type,
       name: name,
        #value: Array.isArray(value)
          ? [...value]
          : typeof value !== null && typeof value == 'object'
          ? { ...value }
          : value,
  
      })
    }
    static create(data = {}) {
      return new FormField(data)
    }
    validate() {
      this.errors = []
      this.validators.map((val) => {
        if (!val) {
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
      return this.#errors
    }
    set errors(error) {
      this.#errors = error
    }
    set value(value) {
      this.#value = value
    }
    get value() {
      return this.#value
    }
    get validators() {
      return this.#validators
    }
    set validators(validator) {
      this.validators = validator
    }
  
    get placeholder(){
        return this.#placeholder
    }
    set placeholder(value){
        this.#placeholder=value
    }
    get id(){
        if(id==null || typeof id=='undefined' || this.#id.length<=0){
            return this.#name
        }
        return this.#id 
    }
    set id(value){
        this.#id=value
    }
    get type(){
        if(type == null || typeof type=='undefined' || this.#type.length<=0){
            return 'text'
        }
        return this.#type 
  
    }
    set type(val){
        this.#type = val
    }
    addValidator(validator) {
      let tempValidators = [...this.validators]
      tempValidators.push(validator)
      this.validators = [...tempValidators]
    }
  }
  
  export default class Form {
    constructor(kwargs = {}) {
      this.#fields = {}
      this.#dynamicFormValidators = {}
      for (const prop in this.constructor) {
        if (this.constructor[prop] instanceof FormField) {
          // create a copy of the new Field instance as they point to the same object in memory
          this.#fields[prop] = this.copy(this.constructor[prop])
     
        }
        if (this.constructor[prop] instanceof FormArray) {
          // create a copy of the new FieldArray instance as they point to the same object in memory
          this.#fields[prop] = this.copyArray(this.constructor[prop])
        }
        if (prop == 'dynamicFormValidators') {
          // adds form level validators to fields
          this.#dynamicFormValidators = this.constructor[prop]
        }
      }
      for (const fieldName in this.#fields) {
        const field = this.#fields[fieldName]
        if (field instanceof FormField) {
          // Optionally set the value of the field either from the constructor of the instance
          // or the constructor of the parent form class latest priority first
          field.value = kwargs[fieldName] ? kwargs[fieldName] : field.value
          field.name = fieldName
      
        }
  
      }
      for (const [field, validators] of Object.entries(this._dynamicFormValidators)) {
        for (let i = 0; i < validators.length; i++) {
          this.addValidator(field, validators[i])
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
      return new FormArray({ ...opts, name: opts.name, groups: [...groups] })
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
      let props = {}
      for (const prop in validator) {
        props[prop] = validator[prop]
      }
      props['form'] = this
      let updatedValidatorWithForm = new validator.constructor(props)
      if (this.field[fieldName] instanceof FormArray && extraArgs) {
        this.field[fieldName].groups.forEach((g) => {
          if (g.field[extraArgs]) {
            g.field[extraArgs].addValidator(updatedValidatorWithForm)
          }
        })
      } else if (this.field[fieldName] instanceof FormField) {
        this.field[fieldName].addValidator(updatedValidatorWithForm)
      }
    }
    validate() {
      this.fields.forEach((f) => {
        if (f instanceof FormField) {
          f.validate()
  
          /*  if (!f.isValid) return (this.isValid = false)
            else return (this.isValid = true) */
        } else if (f instanceof FormArray) {
          f.groups.forEach((fg) => {
            fg.validate()
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
      if (Array.isArray(errs)) {
        this.#errors = errs
      } else {
        this.#errors = [errs]
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
    #groups = []
    constructor({ name = '', groups = [new Form()] } = {}) {
      Object.assign(this, {
        name: name,
        #groups: groups,
      })
    }
    get value() {
      return this.#groups.map((f) => {
        return f.value
      })
    }
    set value(value) {
      this.#value = value
    }
    get groups() {
      return this.#groups
    }
  
    add(group = new Form()) {
      this.#groups.push(group)
    }
    remove(index) {
      this.groups.splice(index, 1)
      this.#groups = this.groups
    }
  }
  