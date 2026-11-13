# Posthoc 24-rank diagnostic split of Hood Shield vs champion native comparison

**Agent 50 · 13 November 2026**  
**Status:** retrospective arithmetic over an existing native-result matrix; no new games, no deck change, no paper qualification.

## Question

Does removing the five Aichi source lists now classified incompatible with unchanged international Expanded materially change the historical Hood Shield v1 versus champion native comparison?

## Frozen inputs and filtering

This analysis uses the existing compact paired indicator matrix:

- `results/methodology/2026-11/agent21-hood-full29-paired-censor-matrix-20261109.tsv`
- Parent decision analysis: `results/methodology/2026-11/agent21-hood-full29-sharp-censor-decision-20261109.md`
- Diagnostic allowlist: `results/aichi-2026/diagnostic/identity-screened-24-field.json`

The allowlist is explicit: `diagnosticOnly:true`, `physicalPrintStatus:"unverified"`, `paperAdmissionEligible:false`, `competitiveAdmissionEligible:false`. Its 24 ranks are **1, 2, 4, 5, 8–22, 26, 27, 30–32**. The excluded incompatible ranks are **3, 6, 7, 24, 29**. The unavailable original lists **23, 25, 28** were never in the 29-source experiment and are not imputed.

Each of the 29 authenticated source ranks had two registered candidate-seat groups. The original paired matrix marks three physical source-deal mismatches as `X` (rank 8 seat A, rank 16 seat B, rank 26 seat A). Those rows are excluded from paired inference. Filtering the 24-rank allowlist and then excluding those three mismatches leaves **45 physically matched pairs**. This is a posthoc subset of the original 116 native attempts, not a new prospective experiment.

## 24-rank diagnostic subset

| Measure | Result |
| --- | ---: |
| Identity-screened ranks | 24 |
| Registered groups before mismatch exclusion | 48 |
| Physically matched pairs retained | **45** |
| Both arms reached native terminal | **34** |
| Both arms incomplete | 7 |
| Champion terminal / Hood incomplete | 4 |
| Hood terminal / champion incomplete | 0 |
| Observed native candidate wins, champion / Hood | **27 / 27** |
| Completed winner reversals, Hood-favored / champion-favored | **6 / 2** |
| Identical winner outcomes among both-terminal pairs | 26 |
| Sharp Hood-minus-champion candidate-win-count bounds | **[-7, +11]** |
| Same bounds per matched group | **[-15.56, +24.44] percentage points** |

The 34 both-terminal pairs contain a net **+4** observed Hood winner reversals (six Hood-favored, two champion-favored). But the 11 pairs with at least one incomplete arm contribute an exact no-assumption interval of **[-11, +7]**; adding that to +4 gives **[-7, +11]**. The interval permits material Hood inferiority and superiority. It is not a confidence interval and assumes no missing-at-random or random completion model.

The 27/45 native-win counts are **not win-rate estimates**: the denominator deliberately includes 11 unresolved pairs, and the result comes from native automated policies rather than paper-qualified competitive games. Do not compare 27/45 to a tournament win percentage.

## Rank-level diagnostic ledger

“Wins” are observed native candidate wins in each arm among the retained matched groups, including any one-arm-only terminal. “Unresolved” counts pairs with at least one incomplete arm. Reversals are counted only when both arms reached terminal.

| Aichi rank | Matched pairs | Both terminal | Native wins (champion / Hood) | Unresolved | Reversals (Hood / champion) |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 2 | 2 | 0 / 1 | 0 | 1 / 0 |
| 2 | 2 | 0 | 0 / 0 | 2 | 0 / 0 |
| 4 | 2 | 2 | 1 / 2 | 0 | 1 / 0 |
| 5 | 2 | 2 | 1 / 1 | 0 | 0 / 0 |
| 8 | 1 | 0 | 0 / 0 | 1 | 0 / 0 |
| 9 | 2 | 1 | 1 / 1 | 1 | 1 / 0 |
| 10 | 2 | 2 | 1 / 1 | 0 | 0 / 0 |
| 11 | 2 | 2 | 2 / 1 | 0 | 0 / 1 |
| 12 | 2 | 2 | 2 / 1 | 0 | 0 / 1 |
| 13 | 2 | 2 | 2 / 2 | 0 | 0 / 0 |
| 14 | 2 | 2 | 2 / 2 | 0 | 0 / 0 |
| 15 | 2 | 1 | 1 / 1 | 1 | 0 / 0 |
| 16 | 1 | 0 | 0 / 0 | 1 | 0 / 0 |
| 17 | 2 | 1 | 1 / 1 | 1 | 1 / 0 |
| 18 | 2 | 2 | 2 / 2 | 0 | 0 / 0 |
| 19 | 2 | 2 | 1 / 1 | 0 | 0 / 0 |
| 20 | 2 | 2 | 1 / 1 | 0 | 0 / 0 |
| 21 | 2 | 2 | 1 / 2 | 0 | 1 / 0 |
| 22 | 2 | 1 | 1 / 1 | 1 | 0 / 0 |
| 26 | 1 | 1 | 1 / 1 | 0 | 0 / 0 |
| 27 | 2 | 1 | 2 / 1 | 1 | 0 / 0 |
| 30 | 2 | 2 | 1 / 2 | 0 | 1 / 0 |
| 31 | 2 | 0 | 1 / 0 | 2 | 0 / 0 |
| 32 | 2 | 2 | 2 / 2 | 0 | 0 / 0 |
| **Total** | **45** | **34** | **27 / 27** | **11** | **6 / 2** |

## Five incompatible ranks, separated

For ranks 3, 6, 7, 24 and 29, all ten registered groups are physically matched:

| Measure | Incompatible-rank subset |
| --- | ---: |
| Matched pairs | 10 |
| Both terminal | 7 |
| Both incomplete | 1 |
| Champion terminal / Hood incomplete | 1 |
| Hood terminal / champion incomplete | 1 |
| Observed native wins, champion / Hood | 2 / 2 |
| Completed winner reversals, Hood / champion | 0 / 1 |
| Identical both-terminal outcomes | 6 |
| Sharp paired count bounds | **[-2, +2]** |

The five incompatible ranks contribute no Hood-favored completed reversal and one champion-favored reversal. Excluding them changes the full 55-pair matched comparison from 6:3 reversals and bounds **[-9,+13]** to 6:2 reversals and bounds **[-7,+11]**. Thus the five incompatible lists do not create the observed Hood-favored reversal count; however, removing them also does not resolve the ordering. This remains a very small, censored native diagnostic.

## Interpretation and limits

1. The 24-rank split is a useful **format-sensitivity check**, not an Expanded tournament result. All 24 still have `physicalPrintStatus:"unverified"` and `paperAdmissionEligible:false`; exact original physical copies and full paper legality have not been admitted.
2. The 45-pair comparison is underpowered and censored. Eleven pairs have at least one unresolved arm, and the sharp interval spans both substantial negative and positive differences.
3. The policies, engine semantics, action caps, and source AI are native research instruments, not independently competent tournament policies. A completed native terminal is not a competitive paper win.
4. No values are invented for ranks 23, 25 or 28. The 24-rank subset is not the full Top 32.
5. No new simulation, card substitution, candidate variant, or CI workflow was created. The fixed 60 and historical raw outcomes remain unchanged.

**Decision:** report the all-29 experiment only as cross-format exploratory evidence, and this 24-rank filter only as a retrospective identity-screened diagnostic. Neither selects Hood over the champion, demonstrates an Expanded matchup win rate, nor advances the 99.5% objective by itself. The next real step remains the existing owner-run native integration gates and subsequent complete-game policy evaluation.

## Reproduction

Filter the existing matrix to the exact 24 ranks in `identity-screened-24-field.json`, discard rows with either arm marked `X`, and apply the same paired partial-identification logic documented in `agent21-hood-full29-sharp-censor-decision-20261109.md` and implemented in `scripts/2026-11/agent21-sharp-paired-censor-bounds.cjs`. The source matrix is the compact outcome reduction; this report does not independently re-certify the raw action logs in the historical CI artifact.
