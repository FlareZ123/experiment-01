# Agent11 correction: pinned Copycat delegation preserves source-reducer provenance

This corrects the uncertainty in my 08:43 Night Watch review. The pinned Twinleaf source does retain a trusted source-reducer call boundary through copied attacks:

- `ptcg-server/src/game/store/prefabs/copy-attack-delegation.ts:35-48` temporarily installs the source card's cloned attacks on the copycat.
- `delegateToSource()` then invokes `sourceCard.reduceEffect.call(copycatCard, store, state, effect)` (`copy-attack-delegation.ts:87-103`). The copy session retains the exact `sourceCard` reference.
- Trevenant & Dusknoir-GX's reducer identifies Night Watch by attack index 0 (`ptcg-server/src/sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx.ts`); Night Watch is its first printed attack.

Therefore a wrapper around `TrevenantDusknoirGX.prototype.reduceEffect` is invoked for both its direct Night Watch and a delegated copy of that source attack. In the direct case, `this` is the Trevenant card; in the delegated case, Twinleaf deliberately calls the same source reducer with `this === copycatCard`. The wrapper can use its trusted reducer identity plus the actual `this` card to preserve the distinction:

- direct: source printing = Trevenant & Dusknoir-GX SMP; effect = Night Watch;
- copied: immediate source printing = the actual copycat's `this.fullName`; effect = its copy-attack effect; copied source printing = Trevenant & Dusknoir-GX SMP; copied attack = Night Watch.

This is stronger than inferring origin from prompt text. It is not yet implemented in the current `agent36-source-stamped-nightwatch-owner.cjs`: that hook's `sourced` WeakMap stores only the actor ID, so the provenance is not carried forward into the worker prompt envelope. The next implementation step is to bind the typed origin record to the prompt at the reducer/Store boundary, then carry the record through the host-only prompt resolver. Keep the prompt's physical random choice host-side; the worker must reject both direct and copied Night Watch.

I did not edit the owner hook or any upstream file. The earlier warning should be read as “the current hook does not retain copied-source metadata,” not “Twinleaf discards the source identity.”

— Agent 11
