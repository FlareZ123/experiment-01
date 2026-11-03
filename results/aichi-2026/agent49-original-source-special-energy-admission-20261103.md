# Original Aichi source Special Energy coverage: exact printed-60 preflight

**Agent 49 | 3 November 2026 | source census and selected-policy configuration test.** All 29 authenticated original Aichi Open League 2026 Top 32 printed 60-card lists are covered by the [fixed source roster](full-decklists.json). Ranks 23, 25 and 28 remain missing. This is an engineering preflight, with no new game simulation or deck ranking.

## Motivation

Agent1's fresh [original rank17 controlled native study](agent1-rank17-generic-special-energy-prospective-16native-20261103.md) found eight registered baseline source arms with **zero manual Energy roots and zero attacks**. Enabling the already available generic public-context Special Energy flag on the same paired source deals yielded **27 accepted Energy PlayCardAction roots and 48 source AttackAction roots**. Original-source physical starts were verified; competitive game qualification still failed. A printed Energy inventory can be physically viable while a developmental bot never tries to fund it.

The new [source preflight](../../simulation/evaluation/agent49-original-source-energy-admission.cjs) consumes actual registered policy options and exact original Energy names/counts. It does not infer runtime flags from current code defaults. A policy option establishes potential implementation reach only. Selection, live Store payment, recipient legality, attack payoff, opponent reply and paper clock remain independent gates.

## Exact 29-source census

All 29 deck rows passed exact 60-card-count assertions. They contain **21 distinct Energy name + set printings** across 79 source Energy rows. **Seven sources contain zero Basic Energy:**

| Rank | Archetype | Basic | Special | Special Energy families |
| ---: | --- | ---: | ---: | --- |
| 4 | Raichu/Electrode | 0 | 12 | Reversal, Counter, Unit LPM |
| 5 | Mew/Genesect | 0 | 4 | Double Colorless |
| 6 | Iron Thorns | 0 | 8 | Speed Lightning, Capture, Spiky, Double Colorless |
| 7 | Snorlax Stall | 0 | 4 | Capture, Recycle, Jet |
| 17 | Raichu/Electrode | 0 | 12 | Reversal, Counter, Unit LPM |
| 24 | Iron Thorns | 0 | 8 | Speed Lightning, Double Colorless, Capture |
| 29 | Iron Thorns | 0 | 8 | Speed Lightning, Capture, Spiky, Double Colorless |

The read-only recognition probe calls the [public Energy unit model](../../simulation/twinleaf/actor-energy-payability.cjs) using a deliberately favorable hypothetical recipient context. All 21 Energy printings produce modeled units there. This has no implications for actual legal recipients or selected attachments. A second uncertain context leaves **Counter Energy CIN** and **Double Dragon Energy ROS** unresolved because their outcomes depend on printed-recipient and public Prize conditions. An unresolved calculation does not prove a printing unusable.

## Frozen selected-v2 configuration

The [Agent23 selected-v2 manifest](../../simulation/evaluation/agent23-selected-joint-v2-manifest.json) sets actorOnlyComposition and bilateralPublicContextSpecialEnergy to true; bilateralSpecialEnergyRoot, sourceScopedSpecialEnergyRoot and candidateScopedSpecialEnergyRoot are false. All seven zero-Basic sources consequently receive the static result **generic-special-option-present-native-proof-required**. The value cannot establish a selected Energy attachment.

The negative test disables generic Special Energy coverage with no narrower option and yields **no-declared-generic-special-owner-root** for all seven. This identifies a configuration concern in the actor-only layer while leaving other narrowly implemented pathways unassessed. Enabling a narrower option yields **narrow-special-only-exact-print-proof-required**. None of these labels certifies paper legality.

## Reproducibility

- [Source module](../../simulation/evaluation/agent49-original-source-energy-admission.cjs) and [four tests](../../tests/agent49-original-source-energy-admission.test.cjs) cover Counter/Dragon conditional uncertainty, exactly-60 source validation, policy configuration interpretation and all 29 original source decks.
- Added one step to the existing **manual-only** [Aichi Energy census workflow](../../.github/workflows/aichi-energy-census.yml), without a push trigger or new per-card workflow.
- **Actual GitHub Actions [41636143197](https://github.com/FlareZ123/experiment-01/actions/runs/41636143197) succeeded** on commit 194c624c9b8270bae8f5bb2a37c59afa8e714988. The explicit source Special Energy gate ran on Node22 and passed. This job did not run Twinleaf matches.
- Agent49's earlier rank13 exact opening/Prize and native two-Item tests separately passed [41487945530](https://github.com/FlareZ123/experiment-01/actions/runs/41487945530) and [41487926664](https://github.com/FlareZ123/experiment-01/actions/runs/41487926664). Those remain mathematical and staged native evidence, not qualified natural games.

## Next gate

Use the frozen selected bilateral runtime, for each original source, to record print recognition, physical owner Energy opportunity, selected root, native acceptance, actual attached recipient, printed and paper-valid Energy effect, characteristic settled attack/control action, opponent continuation and official-stage clock handling. Archive unsuccessful, aborted and capped attempts. Combine this with the generic Trainer owner-frontier work from Agents5/29; the shared actor currently fails to select many ordinary Trainers.

**Status unchanged:** 29/32 authenticated original opponent sixties, ranks 23/25/28 missing; zero competitively qualified games; no selected final fixed 60 and no demonstrated 99.5% win rate.
