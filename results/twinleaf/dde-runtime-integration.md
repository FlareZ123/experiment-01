# Double Dragon Energy research policy integrated into the headless evaluator

**Agent 36, 16 October 2026.** Pinned Twinleaf server: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is a **reproducibility and decision-policy integration result**, not a game-strength finding.

## Question and intervention

The existing [Regidrago policy investigation](energy-and-temple-policy-gaps.md) proved that the default `AttachEnergyTactic` ignores the two dynamic ANY units supplied by Double Dragon Energy (ROS 97), since its static `provides` property is empty. Agent 20 had supplied a research-owned `DoubleDragonAttachTactic` in [dde-attach-tactic.cjs](../../simulation/twinleaf/dde-attach-tactic.cjs), but the shared [headless match runner](../../simulation/twinleaf/headless.cjs) still used the unchanged upstream policy in every game.

This change exposes the existing recovery tactic through an explicit `doubleDragonRecovery: true` match option. The runner inserts the recovery tactic just after upstream `AttachEnergyTactic`, records its precise experimental policy label in the output and restores default selection when the option is absent. The [field evaluator](../../simulation/evaluation/field-benchmark.cjs) forwards the flag when explicitly selected and labels the aggregate report. This avoids conflating different decision policies in future seed-balanced tests.

The opt-in recovery tactic tests legal energy placements through cloned `Simulator` and effective `CheckProvidedEnergyEffect`. Upstream vendor code is unchanged. The tactic's first-legal-target preference remains strategically primitive; an action may be legal while wasting the only attachment on a poor target.

## Engine and evaluator validation

[Manual engine CI run 38833103265](https://github.com/FlareZ123/experiment-01/actions/runs/38833103265) completed successfully. [Reproduction script](../../simulation/twinleaf/dde-runtime-regression.cjs) requires rank-10 Regidrago and rank-1 Shadow Rider to be exact published source decks, with the manifest's separately declared Basic Energy art equivalence and Japanese promo hooks, and executes the pinned engine.

- Prepared game-state fixture: default `AttachEnergyTactic` returned no useful attachment, whereas experimental `SimpleTacticsAi` selected a valid `PlayCardAction` for the Double Dragon Energy. The actual card provided two ANY units when attached to Regidrago VSTAR; default `EnergyScore` remained at -90 before and after attachment. This reproduces Agent 20's prior engine-backed finding.
- Bounded source-list test: one source-backed rank-10 versus rank-1 match at seed `20261016`, 200-action cap, returned `finished=true` after 78 actions and 11 turns in both default and experimental modes. **Both played zero Double Dragon Energy**. The experimental output reproduces bit-for-bit on a second run using the same seed, and deck fingerprints match between modes.
- The precise scenario is therefore **not positive evidence** that the new option changes full-game outcomes or even actions for this seed. Other starting hands, tactical states and realistic decision policies require testing.
- [Field-evaluator manual CI run 38832987311](https://github.com/FlareZ123/experiment-01/actions/runs/38832987311), plus the engine integration job, passed the exact-policy metadata tests. The test asserts the option propagates only when selected, and ordinary baseline requests remain flag-free. Twelve benchmark tests passed.

The successful CI also reported a GitHub checkout cleanup warning about the vendor's nested `pokemon-cards-css` submodule. The working pinned engine compilation and all tested steps finished successfully; this remains a dependency-maintenance issue worth inspecting before future upgrades.

## Reproduction and future quality gates

Run the manual workflow [`aichi-dde-runtime.yml`](../../.github/workflows/aichi-dde-runtime.yml) against the pinned submodule and the source manifest. It rebuilds Twinleaf, checks the prepared board, runs the paired baseline/opt-in bounded source match, verifies experimental repeatability, then executes the evaluator tests. No push-triggered CI is introduced.

For a meaningful optimization conclusion, construct multiple authentic Regidrago decision states in which Double Dragon Energy is in hand, compare candidate tactical action choices with alternative targets, and verify whether legal attachment actually enables or preserves the relevant Apex Dragon attack line. Check both starting-turn orders, state-dependent resource contention, Temple of Sinnoh responses, and opponent policies. Then predeclare seeds and compare full 60-card candidate decks with identical opponent source lists and competent policies. Keep unfinished trials, engine exceptions and unverified starting-turn evidence separate.

**Evidence status:** pinned-engine reproduction and field-runner option provenance verified; successful dynamic Energy attachment demonstrated in a crafted midgame state; no validated competitive matchup win rates.
