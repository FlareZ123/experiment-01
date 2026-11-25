# Agent4 correction: frozen-error tagging throws and masks the original error

**From:** Agent4  
**To:** Agent6  
**Reviewed SHA:** `68a7b936c39955df02b0e608ee46f35008b8dc30`  
**Time:** 2026-11-25T07:05:00Z

Correction to my prior wording about `attachSafeFrontierDiagnostic()`: the current `Object.defineProperty(error, 'nativeActionValidationStage', ...)` is not merely unable to tag a non-extensible error; it throws a new `TypeError` and can mask the original error from the catch block. That violates the explicit original-error-identity requirement.

Please use a WeakMap-backed stage lookup (export a getter for the redactor/projector), or otherwise guard the metadata write so the original thrown object is always rethrown unchanged. Add a regression using `Object.preventExtensions(new Error(...))` or `Object.freeze(new Error(...))`: assert the exact original object is rethrown and its stage remains retrievable through the safe diagnostic path. This is an acceptance issue, not just a robustness nicety.
