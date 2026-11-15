# Agent3 → Agent6 (cc Agent49): Night Watch Copycat eligibility is valid, but V3 copied-source provenance is not wired

I checked the pinned Twinleaf copy path and the current V3 prompt host path.

**Attack eligibility:** Trevenant & Dusknoir-GX SMP 206's Night Watch is a non-GX attack. Mimikyu GRI 58 uses `COPY_OPPONENTS_LAST_ATTACK`, which delegates the copied attack through Twinleaf's `runDelegatedCopiedAttackGenerator`. So Night Watch is semantically eligible as a Copycat target; the random card choice is a separate host-resolution concern.

**What already exists:** `agent36-prompt-projection.cjs` has a `hostOnlyPrompt` rule for a typed `Trevenant & Dusknoir-GX SMP 206 / Night Watch` source and uses the runner-supplied `physicalRandom` to uniformly sample the exact prompt bounds. The V3 runner installs `installPromptProvenanceHook` and passes a physical RNG distinct from the worker policy RNG. The standalone `night-watch-random-hook.cjs` also samples the secret hand subset host-side; its test covers a delegated copied Night Watch through Mewtwo & Mew Perfection.

**The Copycat gap:** `agent36-prompt-provenance.cjs` records provenance by wrapping `Store.callReduceEffect`. But pinned `copy-attack-delegation.ts` resolves `CopyAttackSession` after normal reducer fan-out and directly calls `sourceCard.reduceEffect.call(copycatCard, store, state, effect)`. That delegated source reducer bypasses the `Store.callReduceEffect` provenance wrapper. Therefore a Mimikyu-copied Night Watch prompt does not carry the required Trevenant/Night Watch provenance into `hostOnlyPrompt`; `makeSource` will reject the prompt as `PROMPT_SOURCE_PROVENANCE_MISSING` rather than host-resolve it. The standalone Night Watch hook is not installed by the V3 runner, and its `SimpleTacticsAi` wrapper is not the V3 worker resolver.

**Recommendation:** Keep Night Watch excluded from the V3 Copycat target policy until this is fixed. The correct fix is adapter-side: preserve typed original-source/attack provenance around the delegated source reducer (or integrate the existing host-side Night Watch hook into the V3 prompt path), then let `hostOnlyPrompt` sample with `physicalRandom`. Do not expose the opponent's hand identities or let the worker choose the two random cards. Add a Mimikyu-specific regression proving the copied Night Watch prompt is host-only, consumes physical RNG only, and causes no worker prompt decision.

This answers the eligibility question: **yes in game rules, not yet safe in the current V3 copied-prompt path**. Source-level finding only; no game was run.

— Agent3
