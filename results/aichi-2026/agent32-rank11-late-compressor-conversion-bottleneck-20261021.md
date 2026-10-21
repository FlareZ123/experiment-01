# Rank-11 New Moon turn-31/33 held Compressor: access exists but attack conversion is energy-constrained

**Agent 32 | 21 October 2026 | retrospective printed-card plus archived Store root analysis.** No new native game was run. This is a source-evidence interpretation and an explicit hypothesis for the canonical integrator, not a tested deck-strength improvement.

## Immutable reproducibility

- Exact registered development cell: `11:2:B:new-moon-lockbreaker-v1`, Aichi rank11 full 60 against unchanged New Moon Lockbreaker English proxy 60; seed `623585882`; actual candidate/first physical seat B, player ID 202.
- Archived Agent49 discrete-safe attack v2 source: [manual compiled CI 39534968464](https://github.com/FlareZ123/experiment-01/actions/runs/39534968464), artifact `12316459092`, ZIP SHA256 `21c143323b60f0e1056d3d05bf048cef80e1d5fa23668a8476e9c4a99798820b`, containing `agent7-canonical-actor-fourarm.json`.
- Same source deal fingerprint `9bc69d70743d1c2d0e1406076a817309a0ae1fd73a68da3c27e1e76900d2b5f5`. The v2 selector changed source Mega Absol ex from first-payable `Terminal Period` to 200 printed `Claw of Darkness` at global turn30; this is an already established source-selector change, not an independently controlled source-pressure intervention.
- Source-of-truth printed costs: local card pool `resources/cards/en/sm9.json` (Gengar & Mimikyu-GX TEU 53), `resources/cards/en/smp.json` (Trevenant & Dusknoir-GX SMP SM217), `resources/cards/en/sm11.json` (Mewtwo & Mew-GX UNM 71), and `results/als/new-moon-lockbreak-english-proxy-60.json`. The English proxy includes singleton Gengar, singleton Trevenant, 2 Battle Compressor and 2 Mewtwo.

## Real root observations (post-choice, no hidden opponent-hand read)

| Original native event | Candidate owner-visible state | Source public pressure | Native Perfection probe |
|---|---|---|---|
| Turn31, ordinal154, actual `PassTurnAction` | Mewtwo & Mew-GX Active at **0 attached Energy / 0 damage**. Owner hand includes `Battle Compressor PHF`, two `Field Blower GRI`, `Canceling Cologne ASR`, `Powerglass SFA`; **no Energy card in observed owner hand**. No GX/EX attack-copy Pokémon on own Bench/discard. | Mega Absol ex Active, 3 Darkness Energy, 0 damage. | Detached Store `CANNOT_USE_POWER`, zero available donor attack names. |
| Turn33, ordinal164, actual `PassTurnAction` | Same Mewtwo Active at **1 attached Psychic Energy / 200 damage**. Owner still holds `Battle Compressor PHF`; **no Energy card in observed owner hand**. GX/EX donor Bench/discard remains empty. | Mega Absol ex Active, 3 Darkness Energy, 0 damage. | Again `CANNOT_USE_POWER`, zero donor attack names. |

Both owner-hand snapshots and both two-seat public-board snapshots are attached to the archived row as `candidatePerfectionPassSamples`. The attached Energy observations do not show where the one Psychic came from; no causal assertion is made about its acquisition. The source's original next actions would differ after a candidate policy intervention, so projected follow-ups are contingent.

## Printed energy timing and actual late resource conflict

`Perfection` allows Mewtwo & Mew-GX to copy GX/EX attacks on its own Bench or discard **while still paying each copied attack's Energy cost**. For the two specifically sought Compressor donors:

| Copied attack | Printed Energy cost | Implication at actual turn31 (0 Energy) | Implication at actual turn33 (1 Psychic) |
|---|---|---|---|
| Gengar & Mimikyu-GX **Horror House-GX** | 1 Psychic | Unfunded | Funded, **only if** donor is now accessible, Perfection legal and GX attack unused |
| Gengar & Mimikyu-GX **Poltergeist** | 2 Psychic | Unfunded | Unfunded absent extra acceleration |
| Trevenant & Dusknoir-GX **Pale Moon-GX** | 1 Psychic + 1 Colorless | Unfunded | Unfunded absent extra acceleration |
| Trevenant & Dusknoir-GX **Night Watch** | 3 Psychic | Unfunded | Unfunded absent extra acceleration |

A native-accepted turn31 Compressor could establish donor availability **if** the eligible singleton is still in its own deck and Store permits/settles the Item and prompt. Such a success would not independently resolve either actor's Energy requirements. At the actual turn33 snapshot, Mewtwo has 200 of its printed 270 HP already damaged and faces an opposing fully fueled 200-base attack. If the source repeats a successfully damaging `Claw of Darkness` before protection/healing/switching, the active Mewtwo cannot survive that further 200. `Horror House-GX` only prevents next-turn hand-card play; it does not itself prohibit an already powered attacker from attacking.

This makes the late held-Item omission a **genuine bounded owner-action frontier** but a potentially **dominated tactical repair** without earlier Energy placement, a defensive pivot or a valid one-Psychic consequential effect. An isolated Item action success must not be confused with a functional comeback. A proper paired test can still falsify this concern by observing real donor pickup, corrected attachments, copy selection, attack settlement, and source response.

## Existing code and recommended next A/B

Existing `new-moon-compressor-payload-policy.cjs` had time limits global-turn 6 by default and turn14 with opt-in `newMoonAttackPayloadCompressorLateSeat`. I added a separate **off-by-default** `newMoonAttackPayloadCompressorAnyTurnSeat` switch in `simulation/twinleaf/headless.cjs`, which delegates to the same actor-own-hand/public-board decision and deck-only prompt selection with an unbounded time window. Code: commit `7c137e0`. Unit regressions for authentic turns31/33 and guarded resources: commit `25503d6`. **Neither new code nor those tests have yet passed a pinned compilation/Store CI run.**

Use the one canonical bilateral policy/runner, frozen rank11 source selector and same physical deal. The minimum meaningful contrast is donor **and** funded attack or clearly recorded failure, with subsequent source turn. Compare it with the earlier source-dealt candidate Energy/attacker plan before spending substantial new CI on a predictable terminal with insufficient Energy. Do not pool later-root treatment arms into the original game's benchmark denominator.

**Evidence class:** exact local printed card text, compiled historical native Store post-choice observation, constrained counterfactual reasoning. No tested win-rate change. **Global objective remains 29/32 exact source 60s; 0 competitive-qualified games; no demonstrated fixed 99.5% deck.**
