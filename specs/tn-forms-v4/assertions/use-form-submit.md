---
id: use-form-submit
parent: tn-forms-v4
created: 2026-03-08T00:00:00Z
priority: 1
status: not_started
branch: feature/v4
---

# useFormSubmit handles submission with value transformation and error mapping

`useFormSubmit(options)` wraps Formik's submit flow with API value mapping (strip UI-only fields, transform values) and server error mapping back to form fields. Replaces the manual `onSave()` pattern where consumers map Formik values to API shapes by hand.

## Success Criteria

- `useFormSubmit({ mapValues, onSubmit, onError? })` returns `{ handleSubmit, isSubmitting, submitError }`
  - `mapValues(values)` — transform Formik values to API shape (strip UI-only fields, handle nulls, rename keys). Called before `onSubmit`.
  - `onSubmit(mappedValues)` — async function that sends to API. Receives the output of `mapValues`.
  - `onError(error)` — optional handler for submission errors
- `handleSubmit()` validates the full form first, only calls `onSubmit` if valid
- If `onSubmit` throws with field-level errors (e.g., `{ email: 'already taken' }`), those errors are set on the corresponding Formik fields via `setFieldError`
- `isSubmitting` is true during the async `onSubmit` call
- `submitError` holds the last non-field-level error (e.g., network failure)
- `mapValues` is typed: input is `FormValues`, output is a generic `TApiPayload`
- Prevents double-submission (ignores calls while `isSubmitting` is true)
- Hook must be called within a `<Formik>` context
- Exported from `@thinknimble/tn-forms/react`
- Tests verify: value mapping, successful submit, field-level error mapping, non-field error, double-submit prevention, validation before submit
