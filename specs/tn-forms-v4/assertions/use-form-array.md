---
id: use-form-array
parent: tn-forms-v4
created: 2026-03-08T00:00:00Z
priority: 1
status: not_started
depends-on: create-array-helpers
branch: feature/v4
---

# useFormArray provides typed array management with defaults for Formik FieldArrays

`useFormArray(name, itemSchema)` wraps Formik's `<FieldArray>` logic into a hook that provides typed `addRow()` (with defaults from the Zod item schema), `removeRow(index)`, and access to the current rows — replacing tn-forms v3's `FormArray` class.

## Success Criteria

- `useFormArray('addresses', addressItemSchema)` returns `{ rows, addRow, removeRow, fieldNames }`
  - `rows` — the current array values, typed as `z.infer<typeof addressItemSchema>[]`
  - `addRow()` — pushes a new item with defaults extracted from `addressItemSchema` (uses `createArrayHelpers` internally)
  - `addRow(overrides)` — pushes a new item with defaults merged with provided overrides
  - `removeRow(index)` — removes the item at the given index
  - `fieldNames` — typed tuple of the item schema's field names
- Each row is accessible for per-field wiring: `rows[i]` gives the values, errors accessed via `errors.addresses[i].city`
- Adding a row does NOT trigger validation on existing rows
- Removing a row updates indices correctly
- Works with nested schemas (item schema can have nested objects/arrays)
- Hook must be called within a `<Formik>` context
- Exported from `@thinknimble/tn-forms/react`
- Tests verify: add with defaults, add with overrides, remove, type inference, no validation side effects on add
