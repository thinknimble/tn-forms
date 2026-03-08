---
id: field-meta
parent: tn-forms-v4
created: 2026-03-07T20:00:00Z
priority: 2
status: not_started
branch: feature/v4
---

# fieldMeta co-locates UI metadata with Zod schema fields

`fieldMeta(zodSchema, metaMap)` associates UI metadata (label, placeholder, type, icon) with schema field names in a type-safe way.

Zod schemas carry validation but no UI information. tn-forms v3 stored `label`, `placeholder`, and `type` on each `FormField`. This utility preserves that pattern without coupling UI concerns into the validation schema.

## Success Criteria

- `fieldMeta(schema, { name: { label: 'Full Name', placeholder: 'Enter name' } })` returns a typed metadata object
- TypeScript errors if a key in `metaMap` doesn't exist in the schema shape
- TypeScript errors if metadata fields don't match the `FieldMeta` interface (`{ label?: string, placeholder?: string, type?: string }` — extensible via generic)
- Metadata object is indexable by field name: `meta.name.label`
- Works with `z.ZodObject` and `z.ZodEffects` (refined schemas)
- Does NOT modify or wrap the Zod schema — it's a parallel data structure
- Exported from package index
- Tests verify type safety and runtime access
