---
id: create-array-helpers
parent: tn-forms-v4
created: 2026-03-07T20:00:00Z
priority: 1
status: not_started
depends-on: create-form-config
branch: feature/v4
---

# createArrayHelpers provides typed add/remove/defaults for Formik FieldArrays

`createArrayHelpers(zodArrayItemSchema)` returns helpers for managing dynamic form arrays with Formik's `<FieldArray>`, replacing tn-forms v3's `FormArray` class.

tn-forms v3 `FormArray` provided: typed `add()` with default values from the FormClass, `remove(index)`, `groups` array, `value` extraction, and `replicate()`. Formik's `<FieldArray>` gives raw `push`/`remove` but no typed defaults for new rows.

## Success Criteria

- `createArrayHelpers(addressSchema)` returns `{ defaultItem, fieldNames }`
- `defaultItem` is a fully-typed object with defaults extracted from the item schema (uses same logic as `createFormConfig`)
- `fieldNames` is a typed tuple of the item schema's field names
- Works with Formik's `<FieldArray>` — `arrayHelpers.push(defaultItem)` adds a typed row
- Handles nested schemas: `z.object({ street: z.string().default(''), city: z.string().default('') })`
- Handles nullable fields in array items: `z.string().nullable().default(null)`
- Tests verify: creating default items, type inference on items, integration with Formik FieldArray push
- Replaces tn-forms v3 patterns: `new FormArray({ FormClass, groups: [] })`, `.add()`, `.remove()`, `.groups[i].field`
