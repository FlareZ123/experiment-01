# Agent 3 result: original attack KO must resolve before Pale Moon's delayed EndTurn KO

**21 October 2026, 07:08 UTC. Fixed-checkout, preregistered, same physical deal, development-only.**

## The original rules discrepancy

Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` resolves damage for a non-Barrage attack in `ptcg-server/src/game/store/effect-reducers/game-effect.ts` and proceeds directly to `EndTurnEffect` **without an intervening `checkState`**. In `game-phase-effect.ts`, `EndTurnEffect` first resolves `RESOLVE_PENDING_END_OF_OPPONENTS_NEXT_TURN_EFFECTS`, then calls `checkState`. The supplied Advanced Player's Rulebook v3.4 §I.A-01 requires Step 7 Checking for Knock Outs after attack damage and effects; §I.E begins game resolution when a player has no Pokémon left. Consequently, a knockout caused by attack damage can be improperly deferred until **after** a previously scheduled end-of-turn KO, changing which side wins.

This is demonstrable in one published, historically selected, authentic Store trajectory. Both players start with exactly one Pokémon on the field, six Prize cards and no Bench. In rank6 source Iron Thorns ex's second `Volt Cyclone` (140 damage) on turn4, champion reference's sole Trevenant & Dusknoir-GX (270HP) already carries 140 public damage. A queued champion `Pale Moon-GX` will knock out source Iron Thorns at end of its next turn. The second `Volt Cyclone` makes **280 damage on Trevenant's 270HP**, so the champion should lose its only Pokémon during the attack resolution, **before** Pale Moon's end-of-turn KO executes.

## Pre-registered same-revision binary contrast

[Preregistration before both executions](../aichi-2026/agent3-paper-terminal-ko-sole-toggle-registration-20261021.md). Branch `agent3-native-terminal-ko-paired-20261021` pinned exactly at research commit `d2f14f7963c1d70c53de30ce4279114b39c47250` and Twinleaf engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; only **`paper_terminal_attack_ko` OFF vs ON**. Both used existing `special_energy_root=true`; same four retrospectively chosen registered fixture rows, all other manual inputs default.

| Input | Workflow | Artifact | ZIP SHA256 | Native four-arm outcome |
| --- | --- | --- | --- | --- |
| `paper_terminal_attack_ko=false` | [39559485007](https://github.com/FlareZ123/experiment-01/actions/runs/39559485007) | [12326409577](https://github.com/FlareZ123/experiment-01/actions/runs/39559485007/artifacts/12326409577) | `a53b8b7709fa83e890d095a51b39edf5be49e02b545cd38379ff999e74d12ae9` | 4 attempts, one rank6 champion mixed-native-epoch censor (3/4 actor audits), three other completed/capped rows |
| `paper_terminal_attack_ko=true` | [39559491048](https://github.com/FlareZ123/experiment-01/actions/runs/39559491048) | [12327635589](https://github.com/FlareZ123/experiment-01/actions/runs/39559491048/artifacts/12327635589) | `6d0b24d11e2047a4554a4debf4d66f2cfe3a2742ff25426caf67d4e3152fde03` | 4 attempts, zero native resets and four actor audits, one root Store paper-order correction event |

**Source physical original opening deal exactly matches across arms**: digest `2ce05954cf7a87661c3dc42c242ec6c10f8c9caa9a4a60c0d3580f23613744d1`; **full both-player physical opening deal** digest `d185579d23f5678f3c7e7bd703878dd25a18717e1b5c66b9197927f69431078e`. ON's `sourceDealFingerprint` field is this first original deal. OFF is a strict-epoch error row lacking that top-level convenience field, but its native `sourceDealEpochs.deals[0]` records the same original digest, plus a second independent post-reset deal. This is a true same-original-deal contrast.

**One revised original rank6 outcome:**

- OFF: original source attack roots `t2 Volt Cyclone` ordinal24; `t3 Pale Moon-GX` ordinal29; `t4 Volt Cyclone` ordinal33. At original ordinal35, both players have zero Pokémon in play but **still each possess all six original Prizes**. The native engine proceeds to sudden-death setup at ordinal38 (turn4→0), then a second fresh six-Prize deal, generating **121 total root actions across two epochs** before the strict one-epoch packet rejects it. No paper-tournament winner may be inferred from this malformed continuous packet.
- ON: same attack declaration roots24/29/33 and all preceding original source-deal facts, then **original episode terminates in 35 native root actions with winner physical seat1 (Iron Thorns source)** and final Prizes `[6,3]` (seat0 champion / seat1 source). No native reset. Hook's authoritative live Store pre-EndTurn observation: `defenderName='Trevenant & Dusknoir-GX'`, `defenderDamage=280`, `defenderEffectiveHp=270`, `nativeDelayedEffects=[{type:'knock_out',attack:'Pale Moon-GX'}]`, initial Prizes `[6,6]`, and **`endedBeforeDelayedEffects=true`**. The proper terminal KO is resolved using the **unmodified pinned native `checkState`**, not a fabricated game result.
- Rank6 New Moon negative control: 75 roots / engine winner physical source seat1 / Prizes `[6,0]` in both arms; no hook event.
- Rank11 champion and New Moon negative controls: same respective 260-root action-limit, unchanged root sequences and six-six original Prizes in both arms; no hook event.

All four original trials in both arms remain **development-only**, zero qualified competitive games. ON's strict 4/4 actor audits are protocol coverage, not win-rate evidence.

## Reversible correction design, tests and limits

The correction lives outside the vendor submodule: `simulation/twinleaf/terminal-attack-ko-before-endturn-hook.cjs`, invoked only for true original Store `EndTurnEffect` in ATTACK phase when defender's Active has damage at least as large as native calculated `CheckHpEffect.hp` **and has no reserve Bench**. It calls the pinned `checkState` before queued delayed effects, and skips `EndTurnEffect` only when a genuine FINISHED phase results. It records bounded public counts and no hidden card identities. The hook is **off by default**; manual CI input `paper_terminal_attack_ko` is opt-in, and original vendor code is unchanged. Tests `tests/agent3-terminal-attack-ko-before-endturn-hook.test.cjs` cover success, below-HP negative case, a Bench survivor, untouched speculative Store and restoration; same compiled native manual workflow succeeded.

This **narrow hook does not repair general attack versus end-of-turn semantics** in other board states, multiple Bench or attack-KO combinations, choice prompts, simultaneous competing trigger chains, or all paper tiebreak/match-clock situations. Its explicit failure on unexpected native prompts keeps this experimental path fail-closed. It needs independent testing before being promoted to default, and broader high-quality AI policies before deriving matchup win rates.

## Research implication

A plausible candidate winner or a bizarre sudden-death continuation can be an **engine artifact of moving attack KOs past delayed effects**. A small change in opposing Special Energy choices can expose that defect, and a paper-order correction reverses the replay outcome. The full 32-deck 99.5% objective is **not achieved**; only 29 full opponent lists are verified and no valid competitive game-rate estimator is available. Prioritize timing fidelity and both-seat policy competence before counting game wins. Promote this finding into a general simultaneous-trigger regression corpus and let other agents challenge it.
