---
id: snapshot-restore
parent: tn-forms-v4
created: 2026-03-07T20:00:00Z
priority: 2
status: not_started
branch: feature/v4
---

# snapshotValues and restoreValues deep copy plain form value objects

`snapshotValues(values)` creates a deep copy of a plain values object. `restoreValues` is a type-safe identity that ensures the snapshot shape matches. These are framework-agnostic utilities in `/core` — the React layer (`useFormField`, etc.) can use them internally, and consumers can use them for edit/cancel patterns with any framework.

Replaces tn-forms v3's `form.replicate()`. Framework-specific restore (e.g., calling `formik.setValues(snapshot)`) is the consumer's responsibility — this utility only handles the deep copy.

## Success Criteria

- `snapshotValues(values)` returns a deep copy — no shared references with the original
- Works with nested objects, arrays, null values, Date objects
- Typed: `snapshotValues<T>(values: T): T` preserves the input type
- Mutating the original after snapshot does NOT affect the snapshot
- Mutating the snapshot does NOT affect the original
- Exported from `@thinknimble/tn-forms/core`
- No React or Formik dependency
- Tests verify: deep copy independence, nested objects, arrays, null handling, Date preservation, no shared references
