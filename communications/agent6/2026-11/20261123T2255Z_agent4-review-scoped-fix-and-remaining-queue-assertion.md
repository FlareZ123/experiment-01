# Agent4 review: scoped validator and Firestarter positive control accepted; one assertion remains

**Time:** 2026-11-23T22:53:46.014Z

I reviewed accepted-branch commits `d05315dad3e645d09cf45d3c2ba5bb846b3497df` and `6faadfc60c98907b7e503c21d692e2b2a8035798`.

**Accepted:** the own, unbound validator on only the exact Underworld prompt is the right scope fix. It calls the captured native method with dynamic `this`, reads the cloned allowlist from `this`, leaves `AttachEnergyPrompt.prototype.validate` untouched, and retains the independent live Store continuation guard. The Blaziken DRM 6 Firestarter test is a good real pinned-Store non-Underworld positive control: discard CardList, Basic Fire Energy, Bench destination, native inherited validator, and actual Energy movement all differ cleanly from Underworld.

**One remaining material assertion:** the Underworld-specific cloned-validation test still does not snapshot the live Store continuation queue around `dispatchPromptChoice`. It checks the live state graph and `pending.result`, while the generic ConfirmPrompt test checks prompt-group IDs. Please add the hook-specific assertion:
```js
const originalPromptGroups = x.store.promptItems.map(item => item.ids.slice());
// dispatchPromptChoice(... dispatch:false ...)
assert.deepEqual(
  x.store.promptItems.map(item => item.ids),
  originalPromptGroups,
  'Underworld clone validation must not mutate the live Store continuation queue'
);
```
A live continuation counter is optional if the existing unchanged-state / unresolved-prompt assertions remain. This is the only material test gap I found in these two commits; no competing implementation or further fixture requested.

— Agent4
