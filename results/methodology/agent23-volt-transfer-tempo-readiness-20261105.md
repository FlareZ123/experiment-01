# Agent23: Volt Cyclone mandatory transfer has a conditional next-turn funding counterexample

**5 November 2026 | printed-card deduction and six local Node tests | developmental only.** This note has **zero full native games**, zero qualified paper games, and no fixed-deck win-rate evidence. The steward-selected Issue25 v4 remains unchanged.

## Printed source and exact local counterexample

The original Aichi rank6 fixed Iron Thorns 60 in [full-decklists.json](../aichi-2026/full-decklists.json) contains four Iron Thorns ex TWM77, one Thunder Mountain ◇ LOT191, one Double Colorless Energy SUM136, four Speed Lightning Energy RCL173, two Capture Energy RCL171, and one Spiky Energy JTG159. Printed Iron Thorns ex **Volt Cyclone** costs Lightning + Colorless + Colorless, deals 140, then moves an Energy from the attacker to one own Benched Pokémon. Thunder Mountain ◇ reduces a Lightning Pokémon's attack cost by one Lightning. DCE provides two Colorless units; Speed Lightning provides one Lightning; Capture and Spiky provide one Colorless each. The printed rules are in the supplied card database, independently of the native bot implementation.

Consider a legal owner Active Iron Thorns with exactly **DCE and Speed Lightning** attached, Thunder Mountain in play, and an occupied own Bench to receive the attack's mandatory Energy move. Assume the Stadium and same Active survive through the next opportunity, with no further attachments or effects:

| One physical Energy moved to own Bench | Residual Active | Next Volt Cyclone's Thunder-reduced C+C paid? |
| --- | --- | --- |
| **DCE** | Speed Lightning (1 unit) | **No** |
| **Speed Lightning** | DCE (2 units) | **Yes** |

This is an actual choice difference in the *conditional residual Energy budget*. It does not establish whether the first attack was strategically correct, the attacker survives, which Bench recipient is best, or a natural original match ever reaches this state. If Thunder is removed, neither one-card residual state pays printed Lightning+C+C without additional Energy. With an additional Capture also attached, moving Capture can preserve both DCE and Speed Lightning, retaining 3 units and Lightning even without Thunder.

## Reproducible bounded tool and test result

Added [rank6 exact-Energy residual calculator](../../simulation/twinleaf/agent23-volt-transfer-readiness.cjs) and [six Node tests](../../tests/agent23-volt-transfer-readiness.test.cjs). Local Node 22.16.0 command was the test runner's standard **node:test** API. **6/6 PASS**. Tests cover the two-card counterexample, a three-card case, Stadium-removal sensitivity, sole-DCE tempo debt, a three-single-unit case, and an unknown-card fail-closed input. No Twinleaf compiled native case or actual game was run for this note.

The calculator is a **read-only hypothetical** over owner face-up Energy names; it does not inspect hidden opponent zones or deck contents, issue native actions, handle Bench value, rank tactical win probability, or prove paper-legal Store settlement. The sorter prioritizes preservation of a funded next attack, ability to pay without Thunder, and residual units; it is a candidate policy feature, not a settled best donor selector.

## Existing all-turn handler comparison and integration request

The existing [Agent4 all-turn owner-only Volt AttachEnergyPrompt handler](../../simulation/twinleaf/agent4-allturn-owner-volt-attach-energy.cjs) deliberately ranks donor names with preference scores **Capture 0, other 1, DCE 2, Speed Lightning 3** (lower first). With exactly DCE and Speed Lightning, it therefore prefers **moving DCE**, whereas the conditional readiness model prefers moving Speed. This comparison is directly grounded in the handler's current source, with **no claim that a particular live native game presented this exact two-card option**. The handler's native prompt validator and owned Bench selection remain essential; substituting a pure model choice without validating the actual native prompt would be unsound.

The [original 96-root rank6 seed100 source investigation](agent4-rank6-original-volt-mandatory-attach-energy-abort-20261105.md) observed a source seat1 accepted Volt Cyclone with actual 140 damage but then aborted at the mandatory AttachEnergyPrompt, so a valid two-seat owner resolver matters. Subsequent [Agent4 all-turn owner-prompt followthrough runner](../../simulation/evaluation/agent4-owner-volt-original-eight-followthrough-v1.cjs) already composes its owner selection with the independent [printed paper prompt portfolio](../../simulation/twinleaf/agent39-paper-prompt-portfolio.cjs). Reuse these existing adapters as the base for an Issue25 steward-selected versioned successor rather than implementing another source-rank-conditional donor hook.

Before promoting any donor heuristic, test exact native prompt validation, choice, physical card movement and same-game successor turn. Compare DCE-only, DCE+Speed, and Speed+Capture+DCE fixtures in both physical seats. Audit whether preserving the Active Energy affects actually reachable next attacks and the rival use of an opponent gust or Supporter; publish all negative and censored arms. The selected v4 remains untouched, and v10 is a separately forced source Pass intervention.

**Field evidence status:** 29/32 authenticated original name/count 60s; ranks 23/25/28 still missing, zero competitively qualified games, no selected final 60, and no demonstrated 99.5% win rate.
