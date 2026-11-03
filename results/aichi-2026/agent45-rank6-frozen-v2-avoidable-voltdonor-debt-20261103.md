# Agent 45: actual original rank-6 Volt Cyclone donation debt is avoidable in two frozen native games

**3 November 2026 | 16 unchanged original rank-6 source attempts | printed-cost counterfactual, not full-game simulation.**

## Question

The previous frozen-v2 native postgame audit established that 27 of 50 Iron Thorns ex TWM77 Volt Cyclone attacks moved an Energy to a Benched own Pokémon, and 18 of 22 observed next source turns passed. A further concrete question is whether the *player-owned selection of which physical Energy to move* could preserve the same Active Pokémon's printed attack cost, holding the current live public board fixed. This is a potentially executable decision-policy issue, independent of deck changes, opening access and whether the opponent can force an unfavorable reply.

## Evidence and independent computation

Original unchanged [Agent41 native frozen v2 source archive](agent41-frozen-bilateral-v2-32-original-source-energy-20261101.md), [CI run 41279242584](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584), artifact **13072623187**, ZIP SHA256 `cb23422028015e88d8d701d5d6ffe46de137bdcf22abfe4e5e80abe20a33bd4b`; JSON `agent41-frozen-bilateral-development-v2-native.json`. No archive or immutable native game was changed.

New research-owned, read-only [CommonJS archive auditor](../../simulation/evaluation/agent45-volt-cyclone-donor-debt.cjs) and [eight Node22 regressions](../../tests/agent45-volt-cyclone-donor-debt.test.cjs) ran under the existing manually dispatched [archive-audit workflow](https://github.com/FlareZ123/experiment-01/actions/runs/41562376471) (**SUCCESS**, machine JSON artifact **13198260802**). No new workflow was created; the existing manual archive audit received a new archive-only choice. The audit restricts the analysis to source-native settled Volt Cyclone with an unchanged Iron Thorns Active, no attached Tools, the original printed four Special Energy names and an unambiguous public Stadium. It fails closed otherwise. The hypothetical donor is tested by removing one *card* from the Active multiset and recomputing printed `Lightning + Colorless + Colorless` requirements; Speed Lightning provides Lightning, DCE two Colorless, Capture and Spiky one Colorless, Thunder Mountain reduces the Lightning requirement by one, and Wondrous Labyrinth adds one Colorless. This is an **immediate future-cost test** under static current public conditions. It does not apply future board changes or independently prove a new native attack would be legal.

## Native result census

| Source observation | Count |
| --- | ---: |
| Distinct original-rank6 native games | **16** |
| Settled native Volt Cyclone source attacks | **50** |
| Attacks with no source Bench | **23** |
| Solo: retained sufficient Energy for the printed Volt cost immediately afterward | **23 / 23** |
| Attacks with one or more source Benched Pokémon | **27** |
| Benched: retained sufficient Active Energy for printed cost | **1 / 27** |
| Benched: printed cost became unpayable immediately after transfer | **26 / 27** |
| Benched: **another actual physical donor card** would have preserved payable cost | **2 / 27**, in **two different source games** |
| Benched next own turn observed: attacked / passed | **4 / 18** |
| Benched next own turn unavailable due terminal/cap | **5** |
| Benched observed turn: attached Energy and attacked / attached Energy and passed | **3 / 3** |
| Out-of-scope, unknown public-state classifications | **0** |
| Competitively qualified games | **0** |

The attack observations are *not independent sampling units*: repeated attacks occur in the same physical games, and both candidates are unqualified native opponents. The 26/27 figure describes immediate Energy availability on the archived final attack public board, rather than an empirical next-turn attack rate.

## Two exact original-source counterexamples

**Original `6:2:B:champion-reference`, source seat 0, source global turn 38, attack root ordinal 165.** Original source Active Iron Thorns ex had attached **Speed Lightning, Spiky, Double Colorless**; Bench contained another Iron Thorns ex with Capture and Speed Lightning; no Stadium or Active Tool. The printed native after-attack `AttachEnergyPrompt` selected **Speed Lightning** as the physical card to move to the Bench (resolution root 167). The Active was left with Spiky + Double Colorless, equivalent to three Colorless and zero Lightning. An otherwise identical one-card transfer of **Spiky** would leave Speed Lightning + Double Colorless and satisfy the printed attack cost. The genuine opponent then **Passed** global turn 39, and source **Passed** global turn 40 without an Energy card attachment.

**Original `6:3:B:new-moon-lockbreaker-v1`, source seat 0, source global turn 17, attack root ordinal 111.** Original Active was likewise funded with Speed Lightning + Spiky + Double Colorless and no Tool or Stadium. Source Bench held Iron Thorns ex with Capture + Speed Lightning + Capture, plus a second empty Iron Thorns ex. Native after-attack `AttachEnergyPrompt` again selected **Speed Lightning** (resolution root 113); choosing **Spiky** instead would preserve a printed-cost-payable Active. The genuine opponent **Passed** global turn 18; source **Passed** global turn 19, again without an Energy attachment. This particular Volt Cyclone also generated a genuine Prize prompt and a replacement Active choice for the opponent, so the conditional future attack still needs native follow-through validation.

Both source card movements already occurred in actual native Store effects and are paper plausible. The exact alternative was **not actually played in either archived game**. Opponent responses, damage/Knock Out, attack locks, future Stadium effects, Energy removal and alternative Bench attacks can invalidate a future-attack inference.

## Why donor selection is controllable

[Agent6's earlier real pinned Store donor-choice experiment](agent6-volt-cyclone-owner-energy-selection-native-20261030.md) independently found the actual original attack produces a source-owned `AttachEnergyPrompt`; it can choose either current attached physical Energy card and transfer it to an eligible own Benched Pokémon. Native generic donor choice often followed earlier attachment order, but Agent6's owner-only explicit donor hooked the real prompt and confirmed physical transfer. Its experimental hook `simulation/twinleaf/agent6-volt-cyclone-donor-choice.cjs` is limited to global turn 3 and cannot automatically correct the present turn-17 and turn-38 examples. [Agent39's paper prompt portfolio](agent39-volt-cyclone-common-prompt-portfolio-20261101.md) supplies a stricter source-attributed pre-Store one-card transfer guard and evidence for payment rules in selected executions.

These two archived counterexamples reveal a **real owner decision variable** that should be compared when an integrated source policy is selected. They do not establish a universally preferred donor: sending Spiky to Bench may be inferior when it is needed as a retaliation effect, and moving Speed may fund a stronger or safer backup line. A rational heuristic should first compare costs and then tactical value in the live owner-visible board.

## Next reproducible release gate

Register the untouched original rank6 deck, actual first player, both source seats and a new *same-deal* control/variant where only the donor choice changes when an Active's immediate printed cost can be preserved. Apply the policy equally by physical seat and only to genuine owner-visible source decision inputs. Pass the alternative transfer through native `prompt.validate` and the independent source-stamped Agent39 paper prompt guard. Preserve all prompt resolution attempts, matched physical source-deal fingerprints, settled attacks, no-opportunities, errors, action caps, complete opponent replies and continuation into source's next attack or Pass. Confirm the alternative actually occurs in natural original games and measure tradeoffs without promoting native engine winners to qualified paper wins. This source-policy test is complementary to the [Critic's 3 November candidate funnel](../../communications/broadcast/20261103T0121Z_critic_candidate-funnel_and_joint-policy_gate.md).

**Status:** 29 of 32 original Aichi source sixties authenticated; ranks 23, 25, 28 still unavailable. Zero competitively qualified games, no selected fixed 60 and no 99.5% win-rate demonstration.
