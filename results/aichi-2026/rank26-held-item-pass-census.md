# Rank26: registered first-turn Item access abandoned by the source policy

**Agent 4, 19 October 2026. Evidence type:** complete read-only audit of an already registered source-deal cohort and pinned vendor policy source. No new simulated game, no independent win-rate estimate.

## Source and denominator

The [48 original rank26/rank6 source-deal archive](rank26-integrated-firstturn-source-cohort-v2.md) was frozen at head `682d9d7bb38585c793723b254761c9e0660bd138` and emitted by [manual CI 39220575144](https://github.com/FlareZ123/experiment-01/actions/runs/39220575144), artifact [12171872770](https://github.com/FlareZ123/experiment-01/actions/runs/39220575144/artifacts/12171872770), ZIP SHA256 `8fa17f5d0143aca6b12978f869d58d0f81ae475639038b802619de0cbbb09a00`. Repeats 60 through 83 inclusive, source seat A and B each, original exact 60-card rank26 Meloetta and rank6 Iron Thorns lists, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The read-only calculation is preserved as [`scripts/aichi-rank26-held-item-census.cjs`](../../scripts/aichi-rank26-held-item-census.cjs) and its [overlap regression test](../../tests/aichi-rank26-held-item-census.test.cjs). That test passed locally using Node's built-in test runner, and the library exactly reproduced the archived 20-source-first case IDs, 8/7 held-Item cohorts, and 11-case union. This new test has not been separately run in compiled GitHub CI.

I independently reread **all 48 case records**, selected precisely the archive's sourceActuallyFirst flag (**20 cases**), compared original first-action `opening.sourceHand` printed IDs with every accepted `control.actions` `PlayCardAction`, and checked each corresponding final `PassTurnAction`. The first-action source hand is observed after real setup and first draw. The entire population and unselected cases remain in the original archived JSON.

## Firstturn held-Item non-use

| Printed Trainer in first-action source hand | Of 20 actual-first source arms holding it | Source arms playing it on first turn | Source arms passing without playing it |
| --- | ---: | ---: | ---: |
| Battle Compressor PHF | 8 | **0** | **8** |
| Battle VIP Pass FST | 7 | **0** | **7** |
| Quick Ball FST | 13 | 1 | **12** |
| Trainers' Mail ROS | 11 | 2 | **9** |
| Damage Pump LOR | 10 | **0** | **10** |

**Eleven distinct source-first arms** held at least one of Battle Compressor or Battle VIP Pass, with four holding both. Do not add 8 and 7 as independent observations. Every one of the 20 source-first arms ultimately used `PassTurnAction`; there were zero logged root attacks and no opposing Prize reduction in the registered cohort. All control/variant early action arrays for this cohort were identical; these counts concern the shared baseline decision failure.

Specific fully identified Battle Compressor held cases: repeats/physical seat `63:A`, `63:B`, `67:B`, `68:B`, `76:A`, `78:B`, `79:B`, `81:A`. Battle VIP Pass held cases: `63:A`, `63:B`, `72:A`, `76:A`, `78:B`, `80:B`, `83:B`. At those seven first-action snapshots there were respectively **1, 0, 4, 2, 1, 1, 1** occupied Bench slots, each below five.

## Technical interpretation

The pinned [Battle Compressor](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/07-x-and-y/set-phantom-forces/battle-compressor.ts) `canPlay` checks only that the owner's deck is nonempty. The pinned [Battle VIP Pass](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-fusion-strike/battle-vip-pass.ts) `canPlay` checks early turn, nonempty deck and an open Bench slot. All first-action VIP snapshots had open Bench space. These are **printed/pinned-card-level prerequisites**. The archive lacks a counterfactual native root action on each skipped state, so this audit does not independently certify the full prompt path and actual acceptance under every live-state effect.

The pinned [PlayTrainerTactic](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/play-trainer-tactic.ts) only chooses an Item if simulated immediate state score **strictly increases**. [SimpleTacticsAi](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics-ai.ts) falls through to Pass if no tactic proposes a native-valid action. Thus a useful legal setup action can be strategically overlooked when its benefit comes later in the sequence; item non-use in the archival source traces is consistent with this structural policy limitation. The scorer's actual rejected score and any independent native root viability require an instrumented Store counterfactual before calling each pass *provably avoidable*.

The source first-turn line needs Exeggcute in discard for Propagation, a sequence of Risky Ruins and Damage Pump self-KOs, and access to Meloetta, Energy and its Tool. Battle Compressor and Battle VIP Pass can advance these axes. This census establishes **the bot frequently did not even attempt those known-held setup Items** on real original deals. It establishes no optimal play or actual attack conversion.

## Decision and next falsification

Do not treat absence of an early attack in these cases as intrinsic incapacity of the published rank26 list, nor any candidate win against this bot as competitive. A useful next narrow test is a **single genuine firstturn held-Item original-source root** with an owner-visible, native-valid Battle Compressor or VIP proposal, a complete owner-selected search prompt, conservation of cards, and an actual subsequent source decision. Then freeze the generic policy and test on fresh, both-start source deals without selecting only successful branches. Coordinate any common-bot modification with Agent41's bilateral-v2 ownership.

Across the [29 exact published field lists](full-decklists.json), Battle Compressor appears in 17 lists (33 copies), Battle VIP Pass in 15 (42 copies), and at least one appears in 21 lists. This is a cross-field inventory risk footprint only; it does not establish non-use rates outside rank26.

The same original 20/48 denominator must be retained; neither this report nor the source-selected DCE regressions creates new trials. The broader objective remains **29/32 recovered exact opposing decks, zero competitively qualified games, and no demonstrated 99.5% fixed deck**.
