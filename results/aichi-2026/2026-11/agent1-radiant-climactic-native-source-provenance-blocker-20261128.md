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


## Broader executable consequence: Tapu Lele-GX's Wonder Tag is broken at the same host seam

The exact same `PlayPokemonEffect` provenance deficiency is **not Radiant-specific**. Pinned `ptcg-server/src/sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx.ts` defines entry Ability `Wonder Tag`, triggered by `effect instanceof PlayPokemonEffect && effect.pokemonCard === this`, and emits `ConfirmPrompt(WANT_TO_USE_ABILITY)` immediately, with `ChooseCardsPrompt` for Supporter search in its affirmative continuation. There is no `effect.power` for this entry event. The fixed Hood candidate 60 includes **one Tapu Lele-GX GRI 60**, and PR95 has detailed `Wonder Tag` deck-search preference but checks `effectName === 'Wonder Tag'`.

An additional execution of the **same exact checked-in `describeEffect` source** with pinned PlayPokemonEffect field shapes found:

| Entry Pokémon (physical name) | Printed entry Ability | Actual host `effectName` | Frozen worker expected |
| --- | --- | --- | --- |
| Radiant Eternatus CRZ 105 | Climactic Gate | `Radiant Eternatus` | `Climactic Gate` |
| Tapu Lele-GX GRI 60 | Wonder Tag | `Tapu Lele-GX` | `Wonder Tag` |

Both mismatches are true. PR95 `choosePrompt` handles an unfamiliar `ConfirmPrompt` by selecting its sole choice **only if the native prompt offers exactly one**. A normal optional Yes/No entry confirmation offers multiple choices, so this falls to `abstain('AMBIGUOUS_SIMPLE_PROMPT')` *before* the player's special Supporter search path; even if the prompt were resolved externally, `searchCandidates` would fall back to generic search when `effectName !== 'Wonder Tag'`. This is a second concrete fixed-60 execution gap, not a hypothetical unrelated card.

Pinned Dedenne-GX UNB / Dedechange and Crobat V DAA / Dark Asset also trigger from `PlayPokemonEffect`, so the underlying **class** warrants a design solution. Neither card is in the current fixed Hood 60. An implementer should make an explicit, reviewed entry-Ability allowlist in **host provenance**, keyed by exact pinned card and `effect.pokemonCard === current card`, rather than a Radiant-only unrelated workaround or dropping strict worker provenance. Start with **Radiant CRZ 105 and Tapu Lele GRI 60**, preserve the exact independent native prompt classes and continuation. The frozen Underworld PR104 native no-game witness has no authority to change this other prompt family.

Evidence remains source/static execution of `describeEffect`, not compiled Store or game: native event chaining and actual promise/continuation behavior must still receive a later, separately authorized no-game witness. This new finding advances **source-to-policy integration design**, not a measured matchup.


## Bounded future patch specimen (source only, not deployed)

The smallest allowlisted change to `describeEffect` in `agent36-prompt-provenance.cjs`, **after the frozen PR104 witness**, is:

```js
const ENTER_PLAY_ABILITY_BY_NATIVE_FULL_NAME = Object.freeze({
  'Radiant Eternatus CRZ': 'Climactic Gate',
  'Tapu Lele-GX GRI': 'Wonder Tag'
});

function knownEntryAbilityName(card, effect) {
  if (effect?.constructor?.name !== 'PlayPokemonEffect' ||
      effect.pokemonCard !== card) return null;
  return ENTER_PLAY_ABILITY_BY_NATIVE_FULL_NAME[card?.fullName] ?? null;
}

// Insert knownEntryAbilityName(card,effect) after effect.trainerCard?.name
// but BEFORE card?.name in describeEffect's existing firstString array.
```

This is deliberately an **explicit pinned native card instance + event type allowlist**, not a global `powers[0].name` guess. It retains actual `effect?.attack?.name` and `effect?.power?.name` precedence for attacks and ordinary activated Abilities. Required narrow future regression contrasts: the two real source entry effects map to printed Ability names; same-fullName but `effect.pokemonCard !== card` must not spoof an Ability; non-entry effects preserve old semantics; ordinary Underworld Door PowerEffect still names itself `Underworld Door`. Only after an owner-reviewed code change should actual pinned Store/host project the first native prompt and independently verify continuation custody. Until then this is a **development proposal**, not executable deployed code.
