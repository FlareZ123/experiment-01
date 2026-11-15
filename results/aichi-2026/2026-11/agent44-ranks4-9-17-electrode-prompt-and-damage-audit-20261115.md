# Aichi ranks 4, 9 and 17: Electrode-GX / Alolan Raichu prompt and engine audit

**Agent44 · 15 November 2026 · exact-list and pinned-source review; no gameplay run**

## Why these ranks matter

The exact Aichi source lists contain three Electrode variants that cannot be honestly evaluated by the current V3 worker path:

| Rank | Archetype | Electrode-GX CES 48 | Alolan Raichu UNM 57 |
|---:|---|---:|---:|
| 4 | Raichu Electrode Combo | 3 | 2 |
| 9 | Absol Electrode | 2 | 0 |
| 17 | Raichu Electrode Combo | 3 | 2 |

The rank4 and rank17 lists are separate opponents and must remain separate matchup rows. All counts come from `results/aichi-2026/full-decklists.json`.

## Electrode-GX CES 48 has two unsupported prompt paths

Pinned source: `ptcg-server/src/sets/08-sun-and-moon/set-celestial-storm/electrode-gx.ts`.

### Extra Energy Bomb — AttachEnergyPrompt

The ability attempts to attach Energy cards from the discard pile to the player's Pokémon, excluding Pokémon-GX/EX, then KOs Electrode-GX. Its native prompt is:

- `AttachEnergyPrompt`;
- `cardList: player.discard`;
- `playerType: BOTTOM_PLAYER`;
- Active and Bench slots;
- Energy filter;
- `min:0`, `max:5`, `allowCancel:false`;
- `blockedTo` contains all Pokémon-GX/EX.

The current host's only AttachEnergyPrompt projection is explicitly restricted to the exact Underworld Door source, actor hand, Psychic Energy, Bench-only, min/max 1. It rejects Electrode-GX's Extra Energy Bomb source and prompt shape. This is not covered by Agent10's Underworld Door single-choice clarification: Extra Energy Bomb is a multi-assignment prompt allowing up to five Energy-to-Pokémon assignments.

The pinned `AttachEnergyPrompt.decode()` expects each item as `{to,index}`, where `index` addresses the prompt's cardList (here the discard pile). The existing Underworld projection's `{to,card}` shape is already known to be incompatible with that decoder; a generalized Electrode implementation must use the same pinned index contract and preserve blocked destinations.

There is also a source-level anomaly to test: the zero-transfer callback branch calls `SHUFFLE_DECK` and self-KOs Electrode, then the callback's unconditional post-loop code self-KOs it again. The ability text does not mention shuffling, and its Knock Out clause is conditional on attaching Energy. Do not silently normalize this; verify the exact intended zero-transfer/fewer-than-five behavior in a pinned regression and, if needed, use a research-owned hook.

### Crash and Burn-GX — DiscardEnergyPrompt

The GX attack uses `DiscardEnergyPrompt` with:

- `playerType: BOTTOM_PLAYER`;
- Active/Bench source Pokémon;
- Energy filter;
- `min:1`, `max:totalEnergy`, `allowCancel:false`.

The pinned `DiscardEnergyPrompt.decode()` expects a list of `{from,index}` entries, where each index identifies an Energy card on its source Pokémon. It rejects duplicate source/index pairs. The current host projection has no DiscardEnergyPrompt case; it falls through `projectSimplePrompt()` and fails as an unsupported native prompt. Neither frozen v1 role policy has a DiscardEnergyPrompt handler.

**Additional pinned source arithmetic defect:** the Electrode-GX implementation starts this attack at 30 damage, then loops over every selected transfer. Inside each loop iteration it sets `totalDiscarded = transfers.length` and adds `totalDiscarded * 50` to `effect.damage`. For `n` discarded Energy cards, the callback therefore adds `50n` a total of `n` times: the apparent result is `30 + 50n²`, not the printed `30 + 50n`.

| Energy cards discarded | Printed damage | Apparent pinned-code damage |
|---:|---:|---:|
| 1 | 80 | 80 |
| 2 | 130 | 230 |
| 3 | 180 | 480 |
| 4 | 230 | 830 |

This is a direct static derivation from the pinned callback and should be confirmed by a focused native regression. If confirmed, correct it with a research-owned hook; do not modify the upstream submodule. Any rank4/9/17 game result using Crash and Burn-GX is suspect until this discrepancy is resolved.

## Alolan Raichu UNM 57 — Electro Rain uses PutDamagePrompt

Pinned source: `ptcg-server/src/sets/08-sun-and-moon/set-unified-minds/alolan-raichu.ts`.

Electro Rain:

1. uses `ChooseCardsPrompt` on the Active Pokémon to select Energy cards; the `blocked` list excludes cards that do not provide Lightning or Any Energy;
2. calculates 30 damage for each Lightning/Any Energy unit discarded;
3. opens `PutDamagePrompt` against the opponent's Active/Bench Pokémon, with `damageMultiple:30`, `allowCancel:false`, and a per-target `maxAllowedDamage` map;
4. allows the same opposing Pokémon to be chosen more than once, as the printed attack text specifies.

The host supports the preceding ChooseCardsPrompt but has no PutDamagePrompt projection. The pinned PutDamagePrompt result is `DamageMap[]` (`{target,damage}` per target); the client UI aggregates repeated 30-damage increments on the same Pokémon into one DamageMap entry. This is not a simple choice-token multi-select: the worker must allocate a numeric damage budget across targets.

The pinned `PutDamagePrompt.validate()` checks the total allocated damage, blocked targets, relative player and allowed slots. It does not enforce `damageMultiple` or `maxAllowedDamage`; the client UI enforces those while editing the allocation. A research-owned projection/decoder must validate the increment and per-target cap constraints itself before dispatch, then still call the pinned native validator.

## Cross-layer V3 acceptance gap

The inspected Agent49 owner branch `agent49/v3-worker-acceptance-20261115-mainline` at `d7e3ea574a3df83dff76e7308ac40c1beb1c3b07` has:

- an AttachEnergyPrompt projection limited to Underworld Door;
- no DiscardEnergyPrompt or PutDamagePrompt projection;
- no candidate v1 or opponent v1 handler for Extra Energy Bomb, Crash and Burn-GX, or Electro Rain;
- a protocol multi-select whitelist that does not include `energy-attachment` (multi-assignment form), `energy-discard`, or a numeric `damage-allocation` decision.

The Underworld Door prompt is exactly one complete Energy+Bench assignment and can use the existing `select-choice` decision. Electrode-GX Extra Energy Bomb can return up to five assignments in one prompt, so Agent10's single-choice clarification does not solve this case. A correct protocol extension needs an explicit bounded assignment-list decision, or an equivalently safe count-bearing representation. DiscardEnergyPrompt needs unique `{from,index}` card selections; PutDamagePrompt needs a typed per-target amount allocation whose increments sum exactly to the prompt budget.

The current `agent6-rank1-shadow-rider-opponent-policy.cjs` and `agent46-candidate-policy.cjs` contain no references to these prompt classes or Electrode/Alolan Raichu effect names. They are not field-general policies for these three opponents.

## Required evidence before these matchups can be admitted

1. Electrode-GX Extra Energy Bomb: one through five assignments, discard-pile source indices, blocked GX/EX destinations, multiple assignments to the same/different Pokémon, and zero-transfer/fewer-than-five behavior.
2. Electrode-GX Crash and Burn-GX: one, two and three Energy discards with expected 80/130/180 damage; verify the native effect's final damage after the callback.
3. Alolan Raichu Electro Rain: Lightning-only selection, exact 30-damage budget, allocation to one target and several targets, repeated increments to the same target, blocked targets, HP caps and total-budget validation.
4. Both physical seats and opponent-relative target mapping.
5. Candidate and opponent policy decisions for when to use Electrode's self-KO ability/GX attack and how to allocate Electro Rain; preserve the current v1 freeze until an explicit Critic lift.
6. Re-run the existing authorized worker acceptance gates on the exact rebased owner head before any fixture dispatch. These findings do not authorize a new fixture, workflow, policy branch or game run.

## Evidence class and limitations

- **Direct field facts:** rank4/9/17 card counts and printings are in the exact source decklists.
- **Direct pinned-source facts:** prompt classes/options, decoder shapes, and the Electrode-GX / Alolan Raichu callback implementations are in Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- **Direct branch facts:** current host projection and both frozen v1 policies omit these paths.
- **Mathematical derivation:** the Crash and Burn-GX `30 + 50n²` result follows from the current callback loop; it is not yet confirmed by a native regression.
- **Hypothesis/uncertainty:** Extra Energy Bomb's zero-transfer behavior and the precise fewer-than-five rules need pinned tests.
- **Not established:** any rank4/9/17 game outcome, matchup win rate, field win rate, or 99.5% performance.
- **No implementation:** no upstream code, adapter, policy, deck, workflow or fixture was modified or dispatched.


### Independent reviewer confirmation (Agent35, 15 November 03:51 UTC)

Agent35 independently reproduced both Electrode-GX source anomalies at the same pinned revision:

- For Crash and Burn-GX, the static control flow is confirmed as `30 + 50n²`, not `30 + 50n`. This remains a code-derived result, not a native damage observation.
- Extra Energy Bomb's `AttachEnergyPrompt(min:0, allowCancel:false)` validator accepts an empty transfer array. The zero-transfer callback calls `SHUFFLE_DECK` and adds 999 damage to Electrode-GX; the unconditional post-loop block then adds another 999. The card text makes the Knock Out conditional on attaching Energy and does not mention shuffling.

This independent review strengthens the source-level finding but does not replace the required pinned runtime regression or authorize an upstream edit. Any future rank4/9/17 game using Crash and Burn-GX is engine-fidelity-unqualified until a research-owned correction is validated.
