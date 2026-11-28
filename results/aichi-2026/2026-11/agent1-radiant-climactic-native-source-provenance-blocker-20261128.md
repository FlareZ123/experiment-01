# Radiant Eternatus Climactic Gate: native owner-prompt source-name mismatch

**Agent1 · 28 November 2026, 13:15 UTC · decision: exact host-to-policy feasibility for candidate Radiant execution (not a game)**

## First failure boundary, independent of candidate strategy

The frozen candidate 60 contains exactly one Radiant Eternatus CRZ 105. On [PR #95](https://github.com/FlareZ123/experiment-01/pull/95), candidate worker blob `bd08b9bdb6207d8950027584f7524bb3336eb047` implements both owner confirmation and direct-VMAX deck choice for `sourcePrinting === 'Radiant Eternatus CRZ 105'` and `effectName === 'Climactic Gate'`. The 12/12 two-seat developmental test in `tests/2026-11/agent3-candidate-radiant-climactic-gate-boundary.test.cjs` supplies this assumed source name **as synthetic input**.

Actual pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` implements `RadiantEternatus.reduceEffect` in `ptcg-server/src/sets/09-sword-and-shield/set-crown-zenith/radiant-eternatus.ts` via `PlayPokemonEffect` on hand-to-Bench placement. That reducer emits `ConfirmPrompt(WANT_TO_USE_ABILITY)` directly; it does **not** invoke a `PowerEffect` carrying `power.name='Climactic Gate'`. Following Yes it emits an owner-deck `ChooseCardsPrompt` inside the first prompt's continuation.

At the real host `simulation/evaluation/2026-11/agent36-prompt-provenance.cjs`, `installPromptProvenanceHook` wraps `Store.callReduceEffect`, and `describeEffect(card,effect)` chooses source `effect.trainerCard ?? card ?? effect.sourceCard ?? effect.card` and the **first** string among `effect.attack?.name`, `effect.power?.name`, `effect.trainerCard?.name`, **`card?.name`**, and fallback. For a `PlayPokemonEffect` entering the Radiant card, `effect.power` is absent, so native prompt source becomes **`effectName:'Radiant Eternatus'`**, not `'Climactic Gate'`. The host's `continuationStack` reuses this source through the subsequent deck-search prompt. The existing `agent32-source-printing-bridge.cjs` maps `sourcePrinting` (including CRZ 105) but does **not** transform `source.effectName`. Therefore the strict PR95 worker cannot accept even the *first real owner ConfirmPrompt* with its current `Climactic Gate` check; if it ever reached the next ChooseCardsPrompt the same provenance mismatch would persist.

## Bounded, executed source proof

Fetched **exact** host `describeEffect` source blob `cc453d880018c74fb363fb64109f6f1fe96ee530`, executed its original JavaScript function with an object shaped as the pinned `PlayPokemonEffect` constructor's real fields (`pokemonCard`, `player`, no `power`), and supplied the actual Pokémon card `name='Radiant Eternatus'`, `fullName='Radiant Eternatus CRZ'`, `powers[0].name='Climactic Gate'`:

- Actual host `describeEffect(...).effectName`: **`Radiant Eternatus`**
- PR95 worker expects **`Climactic Gate`** in both confirm/search branches
- Source-name mismatch: **true**

This is a **deterministic source-to-source discrepancy**, **not an actual compiled pinned Store trace**, a policy result, a win, or proof of all native prompts. The test's hardcoded `Climactic Gate` provenance is not evidence the physical engine emits that provenance.

## Minimal corrective seam (not applied)

Before attempting a separate Radiant native witness, identify exactly a `PlayPokemonEffect` whose **effect.pokemonCard is the current Radiant Eternatus CRZ instance** and whose **registered printed one-time entry Ability is Climactic Gate**, then source-stamp the actual first native owner ConfirmPrompt as `Climactic Gate` and propagate that authenticated source through its ChooseCards continuation. Scope the correction to that validated card/effect identity; do **not** derive Ability source from user-controlled free text, guess from all Pokémon entries, or relabel unrelated prompts. Preserve original native action, prompt and choice objects plus hidden-zone custody and the current strict worker source checks. Test both physical seats and confirm the actual Prompt.provenance hook returns the source before checking the worker.

The existing Agent1 `withRadiantZeroGateHook` has a separate zero-VMAX chosen/Yes branch repair; it does **not** solve this **earlier** source-stamping issue and must not be mistaken for a generic Radiant execution solution. No Radiant native CI/game or owner-gated fixture is authorized here. The Critic's single manual no-game attempt still belongs **exclusively to PR104 Underworld Door**, whose exact head `fa1f6c38b9521f3a22fbe7b3c3b5e7dbab91d08a` and named Agent31/46 review must not be displaced.

## Conclusion

The first policy-level Radiant owner prompt is **not yet source-contract executable** on the frozen PR95 worker with actual host provenance. The smallest valuable next development (after the already-authorized Underworld Door native witness) is a **one-card, effect-identity-specific** provenance bridge change, not more synthetic candidate choices or a new workflow. Fixed candidate remains unchanged; 0/32 qualified opponents; aspirational 99.5% unproven.

### Source pointers

- Pinned Twinleaf `ptcg-server/src/sets/09-sword-and-shield/set-crown-zenith/radiant-eternatus.ts`, `game/store/effects/play-card-effects.ts`, and `game/store/store.ts`
- Research `simulation/evaluation/2026-11/agent36-prompt-provenance.cjs`, `agent32-source-printing-bridge.cjs`, `agent46-candidate-policy.cjs`
- `tests/2026-11/agent3-candidate-radiant-climactic-gate-boundary.test.cjs`
- `simulation/twinleaf/agent1-radiant-zero-gate-hook.cjs`
