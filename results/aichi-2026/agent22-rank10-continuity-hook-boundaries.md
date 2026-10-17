# Agent 22: five corrected-clone continuity gaps localize to attack-history hook boundaries

**17 October 2026. Evidence class: compiled authentic-deal diagnostic plus pinned research-hook source audit. Competitive inference: false.**

## Source and method

The manual [source-ranked rank-10 replay CI 38992559596](https://github.com/FlareZ123/experiment-01/actions/runs/38992559596) used rank-10 Regidrago against the exact rank-1 Shadow Rider print-aware list in physical candidate slot B, seed `4246551499`. The independent `simulation/twinleaf/agent1-rank10-continuity.cjs` read-only observer wraps live `Store.dispatch` and compares the original Store's after-dispatch `sourceZoneSnapshot` plus Card-history data against the snapshot taken at its next dispatch. I made its existing diagnostic print every corrected-clone gap to CI stderr, without changing the returned match result.

The [compiled CI](https://github.com/FlareZ123/experiment-01/actions/runs/38992559596) passed with **five corrected-clone boundary gaps, zero corrected-clone Card-history gaps, and zero detected policy-time mutations** under the selected observer. The printed boundary records were:

| Previous dispatch ordinal → next | Next action | Only first observed field change |
| --- | --- | --- |
| 88 → 89 | `PassTurnAction` | `zones.previousAttack.length: 1 → 0` |
| 177 → 178 | `ResolvePromptAction` | `zones.previousAttack[0].attack: Kaiser Tackle → Apex Dragon` |
| 205 → 206 | `ResolvePromptAction` | `zones.previousAttack[0].attack: Kaiser Tackle → Apex Dragon` |
| 215 → 216 | `PassTurnAction` | `zones.previousAttack.length: 2 → 1` |
| 221 → 222 | `PassTurnAction` | `zones.previousAttack.length: 1 → 0` |

The boundary detector reports **the first difference**, so the table must not be interpreted as proof that no other field changed. The Card-history detector found no changes in its narrower inventory.

## Source-level causal classification

The observer is installed **outside** `runMatch`; `runMatch` installs opt-in research dispatch hooks **inside** the observer's installed wrapper. Consequently, changes made by an outer research hook immediately before or after invoking its original dispatch appear as changes *between* observed dispatches:

1. `simulation/twinleaf/last-attack-pass-hook.cjs` deletes the passing player's stale `state.playerLastAttack[player.id]` immediately **before** calling the wrapped `Store.dispatch`. This directly matches all three `PassTurnAction` boundary reductions in the prior-attack ledger.
2. `simulation/twinleaf/copycat-declared-history-hook.cjs` restores `state.playerLastAttack[player.id]` to the printed `Apex Dragon` (or `Copycat`) declaration **after** the wrapped `Store.dispatch` completes a qualifying `ChooseAttackPrompt`. This explains the two recorded `Kaiser Tackle → Apex Dragon` changes adjacent to `ResolvePromptAction`.

The first attribution is mechanically explicit in the pass hook and action names; the second is consistent with the history-restoration code and observed copied-attack payload. An exact per-ordinal preceding-prompt-action audit would further strengthen attribution. The apparent discontinuity counts alone therefore **cannot be used to conclude speculative Simulator contamination** in the corrected clone.

These hooks are **research adaptations**; this audit has not independently validated their paper-rule semantics, all transient reducers or their final-State reference topology. Zero policy-time mutations is scoped to fields in the observer's partial snapshot, the real `decodeNextAction` boundary and this one dealt game. It does not establish global engine isolation.

## Complementary effect-state coverage work

The replay's existing ordered-zone digest and Card-history digest omit multiple effect-bearing fields defined by the pinned Twinleaf `State`, `Player` and `PokemonCardList` classes, such as `playLocksTurnsRemaining`, `cannotPlayToolCards`, `attackPowerSuppressions`, `preventDamageNextTurn` and `damageReductionNextTurn`. Such a field can change while the historic two digests remain identical. See:

- `simulation/twinleaf/source-effect-checkpoint.cjs` for a **selected, explicitly incomplete** supplemental fingerprint;
- `tests/source-zone-checkpoint.test.cjs` for adversarial digest-collision and effect-field sensitivity tests;
- `simulation/twinleaf/store-dispatch-transcript.cjs` and `source-game-action-replay.cjs` for new per-dispatch before/after comparisons.

These changes are **not a complete State fingerprint**. The [supplementary effect-fingerprint compiled CI 38992968255](https://github.com/FlareZ123/experiment-01/actions/runs/38992968255) **passed**, reconstructing **350/350 control** and **235/235 alternate** actions in a fresh process while comparing each new selected-effect digest before and after dispatch. This validates this selected field schema on the archived pair only. A further all-own-primitive fingerprint enhancement has been authored and awaits its separately versioned compiled run. Until this and the remaining policy/rules gates close, `sourceReplayMechanicsVerified:false` and `qualifiedForCompetitiveInference:false`.

## Next falsification steps

Classify both `Kaiser Tackle` changes against the immediately preceding true `ChooseAttackPrompt` action, capturing the hook's before/inside/after dispatch timing. Then check any residual gaps at the hook-outermost root boundary and compare relevant fields against an independently rebuilt game reducer. Preserve the original source game, policy and seed for this qualification step. Representative imperfect-information policies, the alternate physical starting order and independent rule review remain unclosed.
