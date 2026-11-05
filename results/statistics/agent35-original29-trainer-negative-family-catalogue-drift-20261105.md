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

### Distinguish restrictive rules from zero-cost annotations

The broader 816-copy union is **not a plausible proxy for actual negative-play screens**. A separately validated partition now distinguishes:

| Interpretation of the current four-family exact-print catalog | Copies |
| --- | ---: |
| Matching a family with *potential* state-dependent restriction: a positive (including optional) hand-discard payment, printed time window, public Prize prerequisite, or public removal-target requirement | **254** |
| Matching *only* a cataloged zero-additional-hand-discard payment entry, with no other modeled restrictive family | **562** |
| Not matching any of the four catalog families | **219** |
| **Total physical original-field Trainer copies** | **1,035** |

The old 287-copy union already included **33** zero-hand-discard-only annotations and the same **254** potentially restrictive copies. Thus the nominal **529-copy increase in rule coverage contributes zero newly modeled potentially restrictive original-field copies**; all 529 new union-only copies are zero-discard annotations. The zero-payment-only category includes **VS Seeker PHF (59 source copies)**, **Guzma BUS (48)**, **Battle Compressor PHF (33)** and **Trainers' Mail ROS (29)**. Each can be highly strategically important despite having no additional other-hand-discard cost. Their actual play may still be blocked by Supporter quota, target absence, timing, lock or opportunity cost, all outside this particular four-family census. "Potential restriction" means only a relevant rule was cataloged, with no claim that it is failed in a specific owner hand or game. Positive *optional* discard modes are included in the 254 even when a zero-discard alternative is available, so that metric is also not a proven ineligibility count.

The additive original-source census now exposes `copiesWithPotentialRestrictionFamily` and `copiesWithOnlyZeroDiscardPaymentAnnotation` alongside the historical `copiesWithAnyExactNegativeFamily`. Each original 60 gets the same partition to prevent misleading aggregate improvements.


## Exact provenance and delta decomposition

Input: `results/aichi-2026/full-decklists.json`, Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`. The 29 original roster inventories are held constant, including missing ranks 23, 25, 28. `scripts/agent35-field-trainer-negative-family-coverage.cjs` supplies the same four-family membership calculation for both conditions. The catalog is `simulation/twinleaf/agent27-owner-trainer-discard-contention.cjs` blob `555b0d1df2dee73a7e610f52a817ccbb1520c587`.

The historical payment map is exactly the current `COST_BY_PRINT` map excluding entries whose mode is `no-owner-hand-discard-payment`. That preserves the 17 older registration groups and the 259 physical copies already counted by the old test. The new registration families have 41 exact source-print entries plus seven tightly scoped original-source identity bridges. All 48 added entries have `discards: 0` and occupy **550** original physical Trainer copies.

Of those 550 source copies, **21** already matched another of the four historical negative families. Consequently the net union gain is `550 - 21 = 529`, producing **816** currently matched copies and **219** unmatched copies. The historical maximum unmatched card was `VS Seeker PHF` (59 physical copies). It is now explicitly covered by the zero-hand-discard catalog. The current largest unmatched name+set is `Lillie's Determination MEG` (19 copies).

The additional records are cost classifications only. They do not establish that a Supporter target exists, that a Tool can occupy a slot, that a Stadium is playable, that an Item survives lock, that a required search target exists, or that the effect is strategically useful. Whole-hand-discard and whole-hand-shuffle supporters must not be mislabeled as fixed zero-hand-discard costs merely to grow this metric.

## Reproduction and acceptance

- Code: `scripts/agent35-field-trainer-negative-family-coverage.cjs`, augmented in commit `48b1fc0978a1e608dc961719f908e3d7632733c4` with an additive 254/562/219 partition. No existing output columns were removed. The partition is checked per original deck and globally.
- Tests: `tests/agent35-field-trainer-negative-family-coverage.test.cjs`, corrected in `84feedfe8df89bb98df8ae33990d50f319d01dfa` and extended in `973408b32ad2789cde0cacc4c99d79a0f966d858`. They reconstruct the old map, assert the 48 additional zero-payment keys and 550 original physical copies, prove the 21-copy overlap, check current 816 vs historical 287, and assert 254 potentially restrictive copies under both catalogs. Pure synthetic tests now distinguish a genuinely restrictive payment from a zero-payment-only annotation.
- Existing manual workflow: `aichi-card-audit.yml` with `agent35_trainer_gate_only=true` and `commit_results=false`, without native compilation. The older queued run [41968107104](https://github.com/FlareZ123/experiment-01/actions/runs/41968107104) was cancelled without execution to avoid duplicate CI cost after the partition was added. The replacement [run 41968958097](https://github.com/FlareZ123/experiment-01/actions/runs/41968958097) was dispatched at the final test commit `973408b3` and was **queued at this report revision**. The executable CI verdict remains pending until observed.
- No change to production policy, card rules, printed 60-card candidates, 29/32 source completeness or benchmark game certification. The program still has **zero competitively qualified games**, no selected best fixed 60 and no demonstrated 99.5% performance.

## Recommended consumer boundary

Interpret this metric as the footprint of four *negative necessary-condition screens*, each of which may rule out actions in a particular live game state. A zero fixed-cardinality owner-hand discard requirement has a very different strategic meaning from a positive discard requirement and does not imply that the card is free to play. Reports of stronger source action policies must still verify real owner-hand exposure, actual printed eligibility, selected root, native settlement, paper-valid payment, and source payoff plus the opponent's response.
