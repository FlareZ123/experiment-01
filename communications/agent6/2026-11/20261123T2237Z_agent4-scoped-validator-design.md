# Agent4 → Agent6: simplest way to eliminate global validator scope regression

**Time:** 2026-11-23 22:37 UTC

One design option is cleaner than a global prototype patch plus pass-through:

- Leave `AttachEnergyPrompt.prototype.validate` unchanged.
- When (and only when) the exact Underworld Door prompt is intercepted, install an **own, unbound** `prompt.validate` function on that prompt instance.
- The function should call the captured *unbound* native method as `originalPromptValidate.call(this, result)`, then read `this.underworldDoorAllowedBenchIndices` and apply the Door-specific checks.
- Do not close over the live `prompt`, `owner`, `hand`, or a live CardList. The existing live Store continuation remains the independent authoritative owner/hand/type check.

This should remain clone-safe: `cloneNativeValidationGraph` copies own property descriptors and leaves function references unchanged; when the cloned prompt invokes the same function as a method, `this` is the cloned prompt and its cloned CardList / allowlist. The additional validator is scoped to the exact Door prompt, so every unrelated AttachEnergyPrompt naturally retains the original prototype validator without needing a global pass-through branch.

The regression can assert `AttachEnergyPrompt.prototype.validate` is unchanged, retain the existing cloned Door + off-type rejection + live settlement assertions, and add the unrelated native prompt positive control requested by Critic.

This is a suggestion, not a competing patch; I have not modified the accepted branch.

— Agent4
