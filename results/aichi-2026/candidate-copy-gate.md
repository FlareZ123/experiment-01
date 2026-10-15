# Critic: exact-source-copy gate for target candidate selection

**Sender:** Critic, 16 October 2026. Reviewed repository-wide materials outside `private/`. This is a process and benchmark intervention, with no new card-interaction assertions.

## Why this check is needed

The central [research index](../README.md) still nominates the rank-1 Shadow Rider champion's unchanged 60-card list as a reference candidate. The [conditional mirror theorem](mirror-ceiling.md) demonstrates a fundamental limitation of using an unmodified published opponent list as a proposed 99.5% solution under equal-quality, exchangeable play: the identical matchup yields at most 50% wins. Even 100% wins against the other 31 placements yield at most **98.4375%**.

This is a conditional symmetry bound, not a claim about actual tournament win rates or uneven human pilots. It applies to an *identical* deck evaluated with symmetric policies and fair starting-turn sampling. It does not rule out a genuinely different, legal, 60-card deck.

## Reusable machine check

The new [candidate mirror audit](../../scripts/candidate-mirror-gate.cjs) accepts a proposed 60-card card-row inventory and the source [29-list manifest](full-decklists.json). It canonicalizes displayed name, set, collector number and quantities, ignoring card-row order and duplicate row splitting. It reports the exact source ranks matched, the three unknown placements, and the conditional symmetric mirror ceiling. [Four regression tests](../../tests/candidate-mirror-gate.test.cjs) cover rank-1 collision, row splitting, changed source printing and invalid inputs.

A nonmatching source inventory **does not certify uniqueness in play**: different printings can be functionally interchangeable, and this checker does not validate legality, card effects, policy quality or actual win probability. It should be used as an early *rejection/triage* test, never as a promotion certificate.

## Two-track research decision

**Track A, fixed tournament reference:** Preserve the champion list for engine, setup, and symmetric benchmark tests. Label all outcomes as feasibility or limited-policy results until relevant mechanics, raw traces and policy competence are validated. Do not present the unchanged rank-1 list as a plausible verified route to the 99.5% symmetric objective.

**Track B, target-oriented candidate:** Nominate an explicitly different, printing-aware, fixed 60-card list with a reproducible digest. Audit its exact-source collisions before spending substantial simulation budget. A proposal with only alternate printings, no functional change or no demonstrated legal printing should remain an unvalidated proposal. Compare strategically meaningful changes against Track A and other contenders under a shared, documented Expanded-capable policy, preserving both true starting-turn positions.

For future candidate comparisons, the next evidence artifact must record: candidate 60-card source and digest; exact source rank/printing mapping; matchup play-policy identity; a predeclared trial schedule covering the published 29 placements; first-turn proof; completed, failed and stalled games; replayable action traces; and meaningful opponent responses to key archetype lines. The [readiness ledger](readiness-ledger.csv), [raw-record validator](../../scripts/match_record_contract.py) and [benchmark evidence gates](benchmark-validity.md) are the existing reporting backbone.

**Critical path:** first validate one strategically significant replayable interaction and an actual opponent decision policy on both sides; then run controlled candidate comparisons and extend to the full published field. Additional isolated setup probabilities are useful only when they change a specific candidate decision or validate a disputed bottleneck.

## Limits of this intervention

The audit has no simulation win-rate result. There are only 29 published full opponent lists; ranks 23, 25 and 28 remain unresolved. The shared engine's three low-policy finished games demonstrate feasibility only. A candidate passing the new source-copy check is still many evidence gates away from a credible game-strength conclusion.
