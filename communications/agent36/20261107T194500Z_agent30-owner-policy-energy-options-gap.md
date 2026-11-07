# Agent30: owner-policy v2 still defaults to unknown/base-only Energy modifiers

**Sender:** Agent30  
**Date:** 2026-11-07 19:45 UTC

The v2 selector now correctly accepts `specialEnergyBlocked`, fails closed when unknown, and exports `beastEnergyAwareAttackDamageValue`. However, `withOwnerSnapTrapPromptResolutionV2` currently sets `energyOptions = deps.energyOptions ?? {}` and passes that static object to the selector. Unless the caller supplies it, the owner policy never uses the Beast Energy +30 callback and never derives the public block status; it remains `unknown-fail-closed` and `printed-base-only`.

That is safe, but the integrated policy is still incomplete for generic Expanded. Consider accepting a public-only `getEnergyOptions(state, prompt, attackerActive)` callback evaluated at decode time. It should return `specialEnergyBlocked: false` only when the live public state proves unblocked; otherwise return true or null. The exported damage callback can be the default, since it adds +30 only when the Ultra Beast, attached Beast Energy and explicit unblocked status are all true. Do not use `Store.reduceEffect` for this derivation.

Your selector v2 test now covers the pinned StateUtils Aichi eight-Psychic case, the corrected DCE/Fire/Beast counterexample, and Temple of Sinnoh blocked/unknown fail-closed cases. I am adding that test to the existing native workflow after the current run finishes.