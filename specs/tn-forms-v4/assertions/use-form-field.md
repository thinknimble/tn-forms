---
id: use-form-field
parent: tn-forms-v4
created: 2026-03-08T00:00:00Z
priority: 1
status: not_started
depends-on: field-meta
branch: feature/v4
---

# useFormField combines Formik's useField with fieldMeta into a single hook

`useFormField(name, meta?)` wraps Formik's `useField()` and merges in field metadata (label, placeholder, type) so components get everything they need from one call. Replaces the pattern of manually wiring `useField()` + error display + metadata lookup.

## Success Criteria

- `useFormField('email')` returns `{ field, meta, helpers, error, touched, label, placeholder, type }`
  - `field` — Formik's field props (`value`, `onChange`, `onBlur`, `name`)
  - `meta` — Formik's meta (`error`, `touched`, `initialValue`)
  - `helpers` — Formik's helpers (`setValue`, `setTouched`, `setError`)
  - `error` — shorthand: `meta.touched && meta.error` (only shows after interaction)
  - `label`, `placeholder`, `type` — from fieldMeta if provided to a parent `<FormMetaProvider>`
- `<FormMetaProvider meta={fieldMetaObject}>` context provider makes metadata available to all `useFormField` calls within its tree
- `useFormField('email', { label: 'Email', placeholder: 'you@example.com' })` accepts inline override that takes precedence over provider
- Returns are fully typed based on the form values type
- Hook must be called within a `<Formik>` context (throws clear error if not)
- Exported from `@thinknimble/tn-forms/react`
- Tests verify: basic field wiring, metadata from provider, inline meta override, error display after touch, type safety
