---
id: create-form-config
parent: tn-forms-v4
created: 2026-03-07T20:00:00Z
priority: 1
status: not_started
branch: feature/v4
---

# createFormConfig returns initialValues, validationSchema, and fieldNames from a Zod schema

`createFormConfig(zodSchema)` accepts any `z.ZodObject` or `z.ZodEffects` (refined object) and returns:

- `initialValues` — extracted from `.default()` values on each field. Handles `ZodDefault`, `ZodOptional`, `ZodNullable`, `ZodArray`, `ZodBoolean`, `ZodNumber`, `ZodUnion`, and `ZodEffects` (refinements). Does NOT call `schema.parse({})` (which throws on required fields).
- `validationSchema` — Formik-compatible validation schema via `zod-formik-adapter`'s `toFormikValidationSchema`
- `fieldNames` — typed tuple of all top-level field names from the schema shape

## Success Criteria

- `createFormConfig(z.object({ name: z.string().default(''), age: z.number().default(0) }))` returns `{ initialValues: { name: '', age: 0 }, validationSchema: <FormikSchema>, fieldNames: ['name', 'age'] }`
- Handles `z.string().nullable().default(null)` → `null`
- Handles `z.array(z.string()).default([])` → `[]`
- Handles `z.boolean().default(false)` → `false`
- Handles schemas with `.refine()` — extracts defaults from the inner `z.ZodObject`
- `fieldNames` is typed as `readonly` tuple of literal string keys, not `string[]`
- Exported from package index
- Tests cover all Zod type permutations from tn-forms v3 test suite (string, number, boolean, date, null, arrays, nested objects)
