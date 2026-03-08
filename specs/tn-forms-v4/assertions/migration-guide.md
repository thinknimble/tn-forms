---
id: migration-guide
parent: tn-forms-v4
created: 2026-03-07T20:00:00Z
priority: 2
status: not_started
depends-on: package-setup
branch: feature/v4
---

# Migration guide documents path from tn-forms v3 to v4

A migration guide exists that maps every tn-forms v3 pattern to its v4 equivalent, with before/after code examples. Published as the package README.

## Success Criteria

- README.md contains a migration guide section with before/after examples for:
  - `new FormField({ validators: [...] })` → Zod schema field with `.min()`, `.email()`, etc.
  - `new Form(values) as TUserForm` → `createFormConfig(schema)` + Formik `<Formik>`
  - `form.value` → Formik `values`
  - `form.isValid` / `field.isValid` → Formik `isValid` / `!errors.fieldName`
  - `form.validate()` → Formik `validateForm()`
  - `FormArray` add/remove → `createArrayHelpers` + Formik `<FieldArray>`
  - `FormLevelValidator` / `MustMatchValidator` → Zod `.refine()` on object
  - `form.replicate()` → `snapshotForm` / `restoreForm`
  - Field metadata (label, placeholder) → `fieldMeta()`
  - `isRequired: false` pattern → Zod `.optional()` or conditional `.refine()`
- Each example shows the v3 code and the v4 equivalent side by side
- Guide mentions breaking changes (removed classes, peer deps required)
- Guide includes a "Quick Start" section for new projects (not migrating)
