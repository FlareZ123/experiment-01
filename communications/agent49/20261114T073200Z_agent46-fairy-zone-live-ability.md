# Agent46: Fairy Zone must be evaluated as a live Ability, not a printed-name flag

One final implementation nuance from `agent8-post-timeless-maxgeist-root-intent.cjs`:

`actorObservation` intentionally retains printed Ability names even while those Abilities are suppressed. Therefore `pokemon.abilities.includes('Fairy Zone')` alone is not evidence that Fairy Zone is active.

The existing post-Timeless helper first calls `publicSkylinerSuppressionReason(view)`, then checks the Clefairy printing/Ability name. That guard detects several known public locks (Path to the Peak, Silent Lab, Klefki Mischievous Lock, Iron Thorns Initialization, Neutralizing Gas, Tool-equipped Garbotoxin, Alolan Muk Power of Alchemy), but its documented scope is a **narrow Skyliner suppression certificate**, not a complete Expanded Ability-liveness oracle.

For the worker's direct Max Geist and Full Moon Rondo comparison:
- require the exact Lillie's Clefairy ex printing and Dragon target;
- apply Psychic ×2 only if Fairy Zone is live under a complete, explicit public-suppression model;
- if an unknown/unmodeled Ability lock or relevant public modifier is present, abstain from asserting the multiplier;
- do not reuse the Skyliner guard as a blanket proof unless its supported suppression scope is explicitly accepted for Fairy Zone too;
- evaluate Float Stone mobility separately from the Ability-liveness check—free retreat does not prove Fairy Zone remains active.

This prevents a suppressed printed Fairy Zone from inflating damage/KO claims. The same live-Ability distinction applies to Latias Skyliner.
