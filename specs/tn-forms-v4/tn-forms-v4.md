---
id: tn-forms-v4
created: 2026-03-07T20:00:00Z
priority: 1
---

# tn-forms v4: Modular Zod Form Toolkit

Retire the class-based Form/FormField/Validator API. Replace with a modular toolkit of Zod-based utilities and optional React/Formik hooks, installable as submodules (like lodash).

## Context

The current tn-forms (v3) predates Zod's ecosystem. Its principles are sound — declarative validation, composable rules, type safety, value extraction — but the implementation fights TypeScript:

- Triple declaration: type interface + class + union type (`TUserForm = UserForm & IUserForm`)
- `FormField<T>` wraps values instead of working with plain objects
- No schema-level type inference (Zod gives `z.infer<>` for free)
- Validators throw JSON-stringified errors — non-standard
- Hard dependencies on `email-validator`, `luxon`, `libphonenumber-js`
- Coupled to no framework but also helps with no framework

Zod handles all validation tn-forms v3 does (including cross-field via `.refine()`), with better TypeScript ergonomics. What's missing is the glue: defaults extraction, field metadata, typed array helpers, async validation bridging, multi-step wizard support, and opinionated React/Formik hooks.

## Principles (carried forward from v3)

- **Stack-agnostic core** — core utilities work with any framework (React, Vue, Svelte, vanilla)
- **One schema = types + validation + defaults** (replaces triple declaration)
- **Declarative validation** (Zod chains, not imperative validator classes)
- **Cross-field validation** (Zod `.refine()` on the whole object)
- **Modular imports** — install only what you need, no unused framework deps
- **FormArray support** (typed helpers for dynamic groups)
- **Zero hard runtime dependencies** — everything is a peer dep

## Submodule Architecture

```
@thinknimble/tn-forms                → re-exports everything
@thinknimble/tn-forms/core           → Zod utilities (peer dep: zod)
@thinknimble/tn-forms/react          → React + Formik hooks (peer deps: zod, react, formik)
```

### Core (`/core`) — Framework-agnostic

```
createFormConfig(zodSchema)      → { initialValues, validationSchema, fieldNames }
fieldMeta(zodSchema, metaMap)    → typed UI metadata alongside schema
createArrayHelpers(zodSchema)    → typed defaults/fieldNames for array items
createAsyncValidate(zodSchema)   → async Zod refines → { field: error } mapping
snapshotValues / restoreValues   → deep copy/restore plain value objects
```

### React (`/react`) — Formik integration

```
useFormField(name)               → { value, onChange, onBlur, error, touched, meta }
useFormArray(name, itemSchema)   → typed addRow, removeRow, rows with defaults
useStepForm(steps)               → wizard: currentStep, isStepValid, next, prev
useFormSubmit(mapToApi)           → submit handler with value transformation
```

### Import Examples

```ts
// Vue project — just the core Zod utilities
import { createFormConfig, fieldMeta } from '@thinknimble/tn-forms/core'

// React project — core + hooks
import { createFormConfig } from '@thinknimble/tn-forms/core'
import { useFormField, useStepForm } from '@thinknimble/tn-forms/react'

// React project — everything via barrel
import { createFormConfig, useFormField } from '@thinknimble/tn-forms'
```
