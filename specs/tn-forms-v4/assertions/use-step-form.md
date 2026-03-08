---
id: use-step-form
parent: tn-forms-v4
created: 2026-03-08T00:00:00Z
priority: 1
status: not_started
depends-on: step-validator
branch: feature/v4
---

# useStepForm orchestrates multi-step form wizards with per-step validation

`useStepForm(steps)` manages step state and per-step field validation for multi-step form wizards. Replaces the hand-rolled step management pattern from Share the Drop's onboarding (currentStep state, isStepValid helper, history integration).

## Success Criteria

- `useStepForm({ steps: [{ fields: ['firstName', 'lastName'] }, { fields: ['email'] }, { fields: ['zipCode', 'latitude'] }] })` returns:
  - `currentStep` — zero-indexed current step number
  - `isCurrentStepValid` — boolean, true if all fields in the current step have values and no errors
  - `nextStep()` — advances to next step (no-op if current step invalid or on last step)
  - `prevStep()` — goes back one step (no-op if on first step)
  - `goToStep(index)` — jumps to a specific step
  - `isFirstStep` / `isLastStep` — boolean helpers
  - `stepCount` — total number of steps
  - `currentFields` — the field names for the current step
- `nextStep()` touches all fields in the current step before advancing (so errors show)
- `isCurrentStepValid` uses the same logic as `createStepValidator`: no errors AND non-empty values for all step fields
- Optional `onComplete` callback fires when `nextStep()` is called on the last step
- Optional `validateBeforeNext: false` allows advancing without validation (for optional steps)
- Does NOT manage browser history (consumer handles that — keeps the hook focused)
- Hook must be called within a `<Formik>` context
- Exported from `@thinknimble/tn-forms/react`
- Tests verify: step navigation, per-step validation blocking, touch-on-next, onComplete callback, goToStep
