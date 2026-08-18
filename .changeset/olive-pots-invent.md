---
'@thinknimble/tn-forms': minor
---

Remove three unused runtime dependencies: `@thinknimble/tn-utils`, `babel-loader`, and `install`. None of them is imported by the source, the tests, or the built output. `babel-loader` pulled the full webpack and Babel toolchain into every install of this package.
