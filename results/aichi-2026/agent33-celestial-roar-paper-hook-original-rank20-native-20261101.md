# Agent33: Celestial Roar all-Energy repair restores two original-source 60-card losses

**1 November 2026. Evidence class:** Original Aichi paper 60, genuine pinned native Store, retrospective fixed bad-source cases. **No competitive game qualification or field win-rate result.**

## Underlying bug and correction

Agent47 previously traced two pinned Regidrago V SIT135 Celestial Roar reducer defects: (a) excludes eligible Double Dragon Energy ROS97 by selecting Basic Energy only, and (b) iterates remaining temporary cards while mutating that list, skipping a card and losing it from all physical zones. See [source/code/rule investigation](agent47-celestial-roar-native-paper-fidelity-20261030.md). Agent47 had created the reversible research-owned [withPaperCelestialRoarEnergy hook](../../simulation/twinleaf/agent47-celestial-roar-paper-energy-hook.cjs); this run uses that hook **unchanged**, with pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. No vendor files were changed.

## Six original-rank20-60 staged native tests

[Compiled CI 41274619534](https://github.com/FlareZ123/experiment-01/actions/runs/41274619534), artifact 13071256087, ZIP SHA256 **69297b0d49f62c8ea1fa320936df678cf190b24406764af01a9488b94d7e7e53**, [exact runner](../../simulation/twinleaf/agent33-celestial-roar-paper-hook-native.cjs). All six tests dispatch a real Store Celestial Roar AttackAction and resolve native attachment prompts with the same original rank20 physical printed 60 and each actual player seat.

| Predeclared staged top three | Seat 0 | Seat 1 | Actual correction |
| --- | --- | --- | --- |
| Double Dragon + Quick Ball + Mysterious Treasure | pass | pass | Native prompt attaches DDE; total 60 cards |
| Double Dragon + Grass + Quick Ball | pass | pass | Native prompt attaches DDE and Grass; total 60 |
| Grass + Quick Ball + Mysterious Treasure | pass | pass | Grass attached, both Trainers discarded; total 60 |

**6/6 native corrected cases passed** with exact eligible-Energy sets, physical Active attachment effects and 60-card source conservation. This is staged genuine mechanical evidence, not a naturally played game or general printed-card correctness guarantee.

## Original rank20 naturally dealt source failures: exact original-deal parity

[Compiled CI 41274692347](https://github.com/FlareZ123/experiment-01/actions/runs/41274692347), artifact 13070319676, ZIP SHA256 **a988fbb25da50880a7b55bef336872f65ea5fa167cdb9cc950a996e5a9d0d737**, [corrected native replay](../../simulation/twinleaf/agent33-celestial-original3-native-paired.cjs). Replays **three previously frozen original rank20 Regidrago vs rank11 original source** cases with identical original 60s, actual player seats, native seeds, baseline both-seat bot interventions and 160-action cap. It adds only Agent47's all-Energy hook and the fail-closed settled physical-60 guard. The two previously failing seeds were selected retrospectively. [Independent original 24-cell baseline census](agent47-rank20-24-natural-settled-physical-loss-20261030.md) preserves all its native failures in artifact 13015626093, ZIP SHA256 **04b28bbcf4d03d49f460d593fba84dc9627fcffe99de5694c8d8280da9b37324**. For each of the following three cases, I compared that original artifact with the corrected artifact programmatically and found that **both initial source-deal SHA256 and full two-player physical-deal SHA256 matched exactly**.

| Original rank20 seat / original seed | Original uncorrected Store | Opt-in corrected Store | Corrected settled roots |
| --- | --- | --- | ---: |
| seat1 / 1847000101 | 59 original source cards, first bad root 52 | 60 conserved, terminal, 143 roots / 20 turns | 48, zero invalid |
| seat1 / 1847000103 | 59 original source cards, first bad root 98 | 60 conserved, cap 160 / 31 turns | 61, zero invalid |
| seat0 / 1847000101 (previously passing control) | all 60 conserved | all 60 conserved, terminal, 128 roots / 16 turns | 46, zero invalid |

Original source seat1 first corrected run invoked Celestial Roar reducer 9 times, detected 12 Basic and 0 Special candidates, observed 7 native settled prompt effects. The second invoked it 6 times, detected 3 Basic and 3 Special candidates, observed 4 native settled effects. Some latter prompts may remain unsettled at the action cap. The healthy source seat0 control invoked the targeted hook **zero** times. Neither previously failing game experienced any settled original-card underflow after correction, and none of three native corrected games threw. This is strong reproducible evidence that the existing hook closes **these exact known native leaks**, while also exposing legitimate Double Dragon candidates in actual source play.

This does **not** demonstrate identical original and corrected game actions after their first change, improvement in strategic policy, complete paper-rule compliance of the engine, or any competition-level game-win difference. Reported original and corrected action/turn counts happen to match in these three particular cases; no full ledger parity is asserted.

## Qualification and next work

The hook is **default OFF** and must be integrated only in an explicit reproducible research configuration. Independent original source 60s and fresh starts will help establish broader mechanics coverage. Another agent's independent original rank10 natural case offers an important separate test and is not folded into this three-case denominator. Other game-engine discrepancies, decision policies, paper clock, and the three missing exact opponent final 60s still block any 32/32 competitive claim.

**Status: 29/32 authenticated opponent original 60s, zero competitive-qualified games, no demonstrated 99.5% fixed-deck win rate.**
