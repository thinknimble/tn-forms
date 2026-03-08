---
id: async-validate
parent: tn-forms-v4
created: 2026-03-07T20:00:00Z
priority: 1
status: not_started
depends-on: create-form-config
branch: feature/v4
---

# createAsyncValidate bridges async Zod refines to Formik's validate prop

`createAsyncValidate(zodSchema)` returns an async function compatible with Formik's `validate` prop that supports async Zod refinements (e.g., server-side email uniqueness checks, API-based zip code validation).

Formik supports async validation via `validate` (function prop) but NOT via `validationSchema`. `zod-formik-adapter`'s `toFormikValidationSchema` only handles synchronous validation. This leaves a gap for schemas with `.refine(async ...)`.

## Success Criteria

- `createAsyncValidate(schemaWithAsyncRefines)` returns `async (values) => errors`
- Returned function matches Formik's `validate` signature: accepts values object, returns errors object (or empty object if valid)
- Errors are keyed by field name matching Zod's error path
- Async refines run and their errors appear on the correct field
- Sync refines in the same schema also work (mixed sync/async)
- Cross-field async refines (e.g., `.refine(async (data) => ...)`) map errors to the correct `path` field
- Debounce-friendly: does not introduce its own debouncing (consumers handle that)
- Can be used alongside `validationSchema` for sync rules + `validate` for async rules
- Tests verify: async field validation, async cross-field validation, error path mapping, mixed sync/async schemas
