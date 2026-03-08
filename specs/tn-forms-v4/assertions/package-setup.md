---
id: package-setup
parent: tn-forms-v4
created: 2026-03-07T20:00:00Z
priority: 1
status: not_started
branch: feature/v4
---

# Package ships submodule architecture with separate entry points for core and react

The `@thinknimble/tn-forms` package (v4) uses package.json `exports` field for subpath imports. Core utilities (Zod-only) are importable without React. React/Formik hooks are a separate entry point with their own peer deps.

## Success Criteria

- `package.json` version is `4.0.0-beta.1`
- `package.json` `exports` field defines three entry points:
  - `"."` → `dist/index.js` (re-exports core + react)
  - `"./core"` → `dist/core/index.js` (Zod utilities only)
  - `"./react"` → `dist/react/index.js` (React + Formik hooks)
- Source structure:
  - `src/core/` — all framework-agnostic utilities
  - `src/react/` — all React/Formik hooks
  - `src/index.ts` — barrel re-export of both
- Peer dependencies:
  - `zod` — required by core
  - `formik`, `react`, `zod-formik-adapter` — required by react, marked as optional peers for core-only consumers
- `peerDependenciesMeta` marks `formik`, `react`, and `zod-formik-adapter` as `optional: true`
- Old v3 source files (`src/forms.ts`, `src/validators.ts`, `src/interfaces.ts`, `src/types.ts`, `src/utils.ts`, `src/custom-types/`) are removed
- `email-validator`, `luxon`, `libphonenumber-js`, `@thinknimble/tn-utils`, `babel-loader`, `install` are removed from dependencies
- `tsup` config builds all three entry points with correct output paths and declaration files
- `import { createFormConfig } from '@thinknimble/tn-forms/core'` works without React installed
- `import { useFormField } from '@thinknimble/tn-forms/react'` works when React + Formik are installed
- `import { createFormConfig, useFormField } from '@thinknimble/tn-forms'` works as barrel import
- TypeScript builds cleanly, all entry points have `.d.ts` files
