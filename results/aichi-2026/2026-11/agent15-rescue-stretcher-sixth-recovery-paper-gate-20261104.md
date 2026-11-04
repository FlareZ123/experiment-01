# Rescue Stretcher as the sixth public-discard recovery negative gate

**Agent 15 | 4 November 2026 | original printed 29-list inventory, bundled English GRI 130 wording, pure Node 22 tests and manual CI.** This is a read-only paper-*negative* necessary-condition improvement. It does not choose or play a card, demonstrate a complete legal line, or qualify any game.

## The source omission

The existing [five-family target screen](agent15-public-discard-recovery-paper-necessary-20261103.md) registered 96 physical recovery Item copies across 29 authenticated Aichi Open 2026 original 60s. It omitted **Rescue Stretcher GRI 130**, bundled source ID `sm2-130`. The source transcriptions in [`full-decklists.json`](../full-decklists.json) contain **15** exact GRI 130 copies in six original ranks:

| Original rank | GRI 130 copies | Basic copies used in opening model |
| ---: | ---: | ---: |
| 4 | 4 | 13 |
| 7 | 1 | 12 |
| 9 | 3 | 11 |
| 17 | 3 | 13 |
| 30 | 1 | 16 |
| 31 | 3 | 15 |
| **Total** | **15** | |

The card offers two modes: retrieve one Pokémon from the player's discard pile into hand, or shuffle three Pokémon from that discard pile into the deck. **If there is no Pokémon in the owner's actual public discard pile, neither mode has a target, so this Item fails the printed-effect necessary-condition check.** A single known Pokémon target defeats only this *negative* certificate: the three-card mode, actual Item eligibility, other rules, state changes and strategic value remain unproven. An unknown discarded printing gives UNKNOWN rather than an incorrect negative. The rule applies to any Pokémon subtype/HP in this narrow target test. Its exact-source wording is checked against `resources/cards/en/sm2.json` in the source census test.

## Implementation and source coverage

- [`owner-public-discard-target-necessary.cjs`](../../../simulation/twinleaf/planning/owner-public-discard-target-necessary.cjs) registers `Rescue Stretcher GRI` with its exact source ID and `pokemon` public target family. Both modes are explicitly annotated; this is not a positive multi-mode choice engine.
- [Rule tests](../../../tests/owner-public-discard-target-necessary.test.cjs) cover empty discard, all-energy/Trainer discard, one known Pokémon, unresolved metadata, and all six registered families.
- [Source incidence and text verifier](../../../scripts/agent15-discard-target-source-census.cjs), [census tests](../../../tests/agent15-discard-target-source-census.test.cjs), and [first-root model](../../../scripts/agent15-first-root-recovery-no-target.cjs) now automatically consume six-family `RULES`. [First-root tests](../../../tests/agent15-first-root-recovery-no-target.test.cjs) enforce **111** source recovery copies.
- The registered source physical total is now **111** (59 VS Seeker, 17 Rescue Carrier, 15 Rescue Stretcher, 11 Super Rod, 7 Night Stretcher, 2 Special Charge) across 29 original 60s. These physical copies may occur in the same deck and should never be treated as 111 legal opportunities.

## Quantitative opening-model impact

Using the existing exact `recoveryHeldAfterOneDraw` no-action model, the average probability across the 29 equally weighted original lists of holding *at least one registered recovery Item* in a Basic-valid original seven plus one normal draw rises from **35.579098%** for five families to **39.581247%** for six, an increase of **4.002149 percentage points**. The model marginalizes six hidden Prize cards and excludes any actions, optional opponent mulligan draws, attacks, locks, or game consequences. In particular, the first owner root before any discards cannot actually play an empty-target recovery Item merely because it holds it.

| Original rank | Old five-family holding | New six-family holding |
| ---: | ---: | ---: |
| 4 | 0.0000% | 42.8972% |
| 7 | 33.9014% | 42.7388% |
| 9 | 57.2186% | 73.1483% |
| 17 | 42.8972% | 63.6258% |
| 30 | 51.1755% | 58.0725% |
| 31 | 43.1885% | 63.9609% |

These numbers arise from exact BigInt combinatorics under the model's assumptions, derived from original per-deck Basic counts and six-family Item counts. Other original lists are unchanged because they contain no GRI 130.

## Execution evidence and a separate upstream red gate

[Manual existing workflow run 41884443545](https://github.com/FlareZ123/experiment-01/actions/runs/41884443545) at source head `60f0c851711cb9350e04af3f8ed60de4eccbf788` executed the Agent 15 independent test step: **41/41 PASS, 0 failures**, including the Rescue Stretcher two-mode negative. The overall workflow is **FAIL** because the preceding independent Agent35 test `pinned 29 authenticated original source lists have exactly reproducible gate denominators` reported **816 actual vs 287 expected** for `copiesWithAnyExactNegativeFamily`. That preexisting assertion remains unresolved; no general four-family positive claim or all-workflow PASS is made. The preexisting manual-only workflow was adjusted to let the independent recovery tests run after that preceding failure while preserving the visible failing job. No new CI workflow or vendor edit was introduced.

## Integration disposition

The owner-root screen's output remains `paperPlayable:false` only for a proven public no-target blocker and `paperPlayable:null` for potentially eligible or ambiguous states. It is read-only and requires an exact physical hand index, actual public discard, and enough metadata for negative proof; it never inspects concealed opponent cards. **No selected Issue #25 common bilateral policy has enabled or certified this new predicate.** A future full-policy steward should validate an actual source-dealt owner root, its alternatives, resolved target choice, paper payment, native result, and opponent continuation before granting any release acceptance gate.

**Collective status:** 29/32 original name/count sixties (ranks 23, 25 and 28 missing), no selected final fixed 60, **zero competitively qualified games** and no demonstrated 99.5% field win rate.
