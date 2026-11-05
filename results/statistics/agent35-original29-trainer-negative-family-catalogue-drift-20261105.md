# Reconcile 29-original Trainer negative-family coverage after payment catalog growth

**Agent 35 | 5 November 2026 | source-locked pure inventory audit.**

## Decision-useful result

The original four-family regression counted **287 of 1,035** original-field Trainer physical copies as matching at least one exact-print *negative necessary-condition* family. The later expanded owner-hand payment catalog counts **816 of the same 1,035**. The 529-copy increase is a **catalogue coverage change**. It is not evidence of 529 newly legal Trainer actions, an opponent-policy improvement, or more qualified games.

The old test's expected 287 and 259 payment-mode copies were sound **for the smaller catalog**. The expanded catalog does not preserve those counts by design. Previously this mismatch caused an unrelated manually dispatched source-audit job to fail. The revised test now checks both historical and current maps and explicitly reconciles the two.

| Source-locked measurement | Historical core | Current expanded map |
| --- | ---: | ---: |
| Authenticated original 60-card lists | 29 | 29 |
| Trainer physical copies | 1,035 | 1,035 |
| Distinct original English name+set Trainer printings | 125 | 125 |
| Copies matching at least one of four negative families | 287 | 816 |
| Copies unmatched by these four families | 748 | 219 |
| Distinct printings matching any family | 18 | 64 |
| Known fixed-card-count payment-mode copies | 259 | 809 |
| Copies with a positive optional or mandatory hand-discard mode | 184 | 184 |
| Copies with a mandatory positive owner-hand discard in every cataloged mode | 164 | 164 |
| Printed first-turn window family copies | 43 | 43 |
| Public-Prize prerequisite family copies | 15 | 15 |
| Public-removal-target family copies | 12 | 12 |

The union coverage moves from **27.72947%** to **78.84058%** of the original 1,035 Trainer copies, solely as a measurement of exact catalog keys. The **219 unmatched copies (21.15942%) are not presumed illegal or unsupported by other independent policies.**

## Exact provenance and delta decomposition

Input: `results/aichi-2026/full-decklists.json`, Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`. The 29 original roster inventories are held constant, including missing ranks 23, 25, 28. `scripts/agent35-field-trainer-negative-family-coverage.cjs` supplies the same four-family membership calculation for both conditions. The catalog is `simulation/twinleaf/agent27-owner-trainer-discard-contention.cjs` blob `555b0d1df2dee73a7e610f52a817ccbb1520c587`.

The historical payment map is exactly the current `COST_BY_PRINT` map excluding entries whose mode is `no-owner-hand-discard-payment`. That preserves the 17 older registration groups and the 259 physical copies already counted by the old test. The new registration families have 41 exact source-print entries plus seven tightly scoped original-source identity bridges. All 48 added entries have `discards: 0` and occupy **550** original physical Trainer copies.

Of those 550 source copies, **21** already matched another of the four historical negative families. Consequently the net union gain is `550 - 21 = 529`, producing **816** currently matched copies and **219** unmatched copies. The historical maximum unmatched card was `VS Seeker PHF` (59 physical copies). It is now explicitly covered by the zero-hand-discard catalog. The current largest unmatched name+set is `Lillie's Determination MEG` (19 copies).

The additional records are cost classifications only. They do not establish that a Supporter target exists, that a Tool can occupy a slot, that a Stadium is playable, that an Item survives lock, that a required search target exists, or that the effect is strategically useful. Whole-hand-discard and whole-hand-shuffle supporters must not be mislabeled as fixed zero-hand-discard costs merely to grow this metric.

## Reproduction and acceptance

- Test: `tests/agent35-field-trainer-negative-family-coverage.test.cjs`, corrected in commit `84feedfe8df89bb98df8ae33990d50f319d01dfa`. The test reconstructs the baseline from mode semantics, confirms the 48 additional zero-payment entries and their 550 original physical copies, independently checks historical and current source denominators, and enforces the 21-copy overlap identity. Source and map counts were independently checked against the exact original JSON and catalog registration text before updating the assertions.
- Manual-only existing workflow: `aichi-card-audit.yml`, `agent35_trainer_gate_only=true`, `commit_results=false`, without native engine compilation. Dispatched on commit `84feedfe` at [run 41968107104](https://github.com/FlareZ123/experiment-01/actions/runs/41968107104). **Job queued at initial report authoring; its outcome must be verified separately.**
- No change to production policy, card rules, printed 60-card candidates, 29/32 source completeness or benchmark game certification. The program still has **zero competitively qualified games**, no selected best fixed 60 and no demonstrated 99.5% performance.

## Recommended consumer boundary

Interpret this metric as the footprint of four *negative necessary-condition screens*, each of which may rule out actions in a particular live game state. A zero fixed-cardinality owner-hand discard requirement has a very different strategic meaning from a positive discard requirement and does not imply that the card is free to play. Reports of stronger source action policies must still verify real owner-hand exposure, actual printed eligibility, selected root, native settlement, paper-valid payment, and source payoff plus the opponent's response.
