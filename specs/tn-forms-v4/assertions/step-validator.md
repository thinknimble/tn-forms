---
id: step-validator
parent: tn-forms-v4
created: 2026-03-07T20:00:00Z
priority: 1
status: not_started
depends-on: create-form-config
branch: feature/v4
---

# createStepValidator checks validity of a field subset for multi-step forms

`createStepValidator(zodSchema)` returns a function `isStepValid(values, errors, fieldNames)` that checks whether the specified fields have values and no validation errors. This is a framework-agnostic utility in `/core` — it works with plain objects, not Formik-specific state.

The React hook `useStepForm` wraps this internally, but it's also usable with Vue, Svelte, or any other framework that has a values object and an errors object.

## Success Criteria

- `createStepValidator(schema)` returns `{ isStepValid, getStepErrors }`
- `isStepValid(values, errors, ['firstName', 'lastName'])` returns `true` only if:
  - No errors exist for those fields in the errors object
  - Each field has a non-empty value (not `null`, `undefined`, `''`, or whitespace-only string)
- `getStepErrors(errors, ['firstName', 'lastName'])` returns only the errors for the specified fields
- Handles boolean fields: `false` is treated as a valid value (not empty)
- Handles number fields: `0` is treated as a valid value (not empty)
- Handles array fields: `[]` is treated as empty, `['item']` is non-empty
- Works with nested field names (dot notation): `isStepValid(values, errors, ['address.street'])`
- Type-safe: field names are constrained to keys of `z.infer<typeof schema>`
- Exported from `@thinknimble/tn-forms/core`
- No React or Formik dependency
- Tests verify: valid step, invalid step (errors), invalid step (empty values), nested fields, edge cases (boolean false, number 0, empty arrays)
