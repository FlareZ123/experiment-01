# Agent31: prospective rank-5/rank-11 Float Stone transfer, 4 November 2026

## Registration and exact execution

[Preregistered source/seat/deck/seed trial roster](registrations/agent31-crossrank5-11-floatstone-20261103.json) was committed on 3 November at 18:31:02 UTC, before the native run. Git blob: `04eeebb1d3335202aba9f283d7419b74e74c8dbe`. The immutable roster contains 16 independent seed groups spanning original Aichi ranks 5 and 11, both source seats, each against two unchanged candidates (`champion-reference` and `new-moon-lockbreaker-v1`). Thus 32 registered pair IDs, with one control and one intervention per ID, yield **64 actual native attempts**.

The ONLY top-level experimental profile delta confirmed in the archived full runs, excluding generated rows, is `actorFundedShadowRiderFloatStoneRootOptIn: false -> true`. The option is applied to the shared two-seat actor composition. Original printed source and contender 60s, source starter/seat, other common policy options and engine pin are unchanged. Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. CI [41694723676](https://github.com/FlareZ123/experiment-01/actions/runs/41694723676) used repository head `7986dc69be3e3b13614db2a46ac6aecda2143c25`; native job SUCCESS. Its artifact [13260926041](https://github.com/FlareZ123/experiment-01/actions/runs/41694723676/artifacts/13260926041) is the complete 64-attempt evidence, including capped and error statuses.

Reproducibility receipts, independently re-opened 4 November:
- ZIP SHA-256: `8333ea0989cd8c9092040c93435c35f5a454dc204601ee89593681ea5994d634`
- `agent31-crossrank-floatstone.json`: **53,660,033 bytes**, SHA-256 `3783eaca1882406e2de1998c4fde8440a9fdbca27284b12ac2b0a1dcc7eac9ab`.
- Both arms have exactly 32 ordered matching trial IDs. All **32/32** paired rows have matching original-source and complete initial physical deal fingerprints. All 32 control source-pair records equal the rescue source-pair records. Neither arm has a native execution error.

## Full-denominator result

| Original rank | Paired trials | Source AttackAction roots, control -> rescue | Different complete root-action hashes |
| --- | ---: | ---: | ---: |
| 5 | 16 | 79 -> 79 | 0 |
| 11 | 16 | 212 -> 201 | 1 |
| **Total** | **32** | **291 -> 280** | **1** |

Across all 32 attempts per arm, disposition is 14 censored, 10 original-source-native terminals and 8 contender-native terminals in control; 14 censored, 9 original-source-native terminals and 9 contender-native terminals in rescue. **Zero competitively qualified paper games in either arm.** The original source rank-5 action trajectory was unchanged in all 16 pairs. The 11-root fall in rank-11 source attacks is explained by one intervention game ending earlier with a different winner, not evidence of a degraded rank-11 pilot under identical subsequent opportunities.

## Exact changed trajectory: contender rescue

Only trial `11:3:B:champion-reference` changed. Registered seed `1681435956`, original rank-11 source in physical seat 0, champion-reference Shadow Rider contender in seat 1. Both arms match exactly through actual Store-root ordinal **136** inclusive. On contender turn 29:

- Control root **137**: contender passes; original rank-11 source later uses `Terminal Period` repeatedly and reaches native win, turn 55, final physical Prizes `[4,6]` (seat 0, seat 1).
- Intervention root **137**: contender plays `Float Stone`; root **138** `RetreatAction`; root **139** `Max Geist`. All are actual accepted Store roots with no native error. Rank-11 source replies at root **143** with `Terminal Period`. Contender subsequently attacks `Max Geist` at roots **147, 156, 175 and 192**, reaching native win at turn 37, final physical Prizes `[6,0]`.
- The treatment selected two Float Stone rescue intents in this changed game. The archive's `physicallyAcceptedSourceFloatStoneAttackChains:0` counts **source-side** rescues: the positive three-root chain is on the **candidate side**. No other pair's full action-ledger digest changes. Control settled contender attacks: 2; intervention settled contender attacks: 5. Original source settled attacks: 18 vs 7.

This is a **native policy-competence witness on a natural, registered original-source physical deal**. It is also an instance in which a source-facing aggregate source-attack count declines because a candidate gains a successful line. The summary must therefore retain actor role and the exact terminal/censor denominator.

## Qualification limits and integration implication

Store acceptance alone does not establish paper legality, opponent competence, information-set isolation, full payment, or official-clock adjudication. The native action trace supports the actually settled Tool -> Retreat -> attack route; it is not a complete independent paper-cost certificate for this game. The experiment has no preregistered comparative statistical power sufficient to rank fixed 60s, and one changed game cannot justify selecting the contender, raising a field win-rate estimate, or claiming the 99.5% target.

The existing selected Issue #25 whole-policy gate must determine whether this component belongs in its actually executed closure; it currently remains an isolated option. Give the integration steward the exact changed-trial receipt as a positive regression and the **31 unchanged trial IDs** as negative/no-op controls. In particular, a future candidate-neutral release panel should count **candidate-side** interventions, not just `physicallyAcceptedSourceFloatStoneAttackChains`. See [Issue #25](https://github.com/FlareZ123/experiment-01/issues/25), [the Agent31 rank-1 heldout companion](agent31-heldout-floatstone-20261103.md), and [Agent14's independent source-agnostic generic mobility test](../twinleaf/agent14-generic-funded-bench-floatstone-three-family-20261104.md).
