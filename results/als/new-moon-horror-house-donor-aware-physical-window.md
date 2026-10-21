# New Moon versus Iron Thorns: donor-aware direct Horror House-GX resource opportunities

**Agent 33, 21 October 2026. Evidence class: exact combinatorics grounded in the frozen candidate 60 and printed card text, independent physical-deal Monte Carlo, manually executed Node regressions. Unqualified as gameplay.**

## What was missing from the previous resource metric

The fixed [New Moon Lockbreaker v1 60](new-moon-lockbreak-60-candidate.md) has **2 Mewtwo & Mew-GX**, **1 Gengar & Mimikyu-GX**, **2 Battle Compressor**, **2 Canceling Cologne**, and **six Psychic-providing Energy cards**, with **17 Basic Pokémon**. Mewtwo's printed Perfection Ability can copy Horror House-GX from Gengar on the Bench or in the discard pile, but its necessary Energy must be present. Opposing Active Iron Thorns ex can suppress Perfection; one same-turn Canceling Cologne can remove this suppression for the active opponent. Gengar can also attack natively, without asking Perfection to work.

The [prior exact starter-and-resource model](../../scripts/new-moon-thorns-starter-joint.cjs) finds **9.51016445697%** for a direct resource union involving either native Gengar plus Energy, or opening Mewtwo plus Cologne plus Energy. It deliberately omitted whether the Mewtwo route actually has a Gengar donor accessible. That union is a *donor-agnostic resource screen*. It is not evidence of an available copied GX attack.

This study adds the missing Gengar payload location and **Battle Compressor** for one deliberately restricted physical first-turn line. It counts disjoint routes and keeps the original 60 unchanged for the baseline.

## Physical-deal experiment

Sample an initial seven uniformly from the 60, condition on at least one Basic Pokémon, place six random Prizes from the remaining 53, and take one normal draw from the other 47. **Exclude all optional mulligan bonus draws** and extra Trainer/Ability search/draw. The two credited events require a Psychic-providing Energy among the first eight physical cards:

1. **Native route:** at least one Gengar & Mimikyu-GX among the initial seven, selectable as the starting Active. This route uses its own printed Horror House-GX, without Perfection or Cologne.
2. **Copied route:** Mewtwo & Mew-GX in the initial seven, selectable as Active; Cologne in the first eight; and a donor Gengar either drawn on the eighth card and directly Bench-playable, or absent from the first eight but accessible in the deck (not Prized) through a directly seen Battle Compressor. The latter requires a successful deck-to-discard search, which the resource screen does not establish.

These are **possible direct resource channels**, assuming the remaining independent requirements would be met. Item lock, Supporter and action opportunity costs, attachment timing, effect resolution, bench space, damage, attacks, source actions, actual first seat, paper tournament clock, and later owner-visible access remain outside this exact screen. Gengar sitting in the first seven while Mewtwo is selected could provide a third route, but the event is already counted by the native starter option with the same Energy, so we do not double count it.

## Exact result, unchanged source 60

| Mutually exclusive route | Share of valid-seven deals |
| --- | ---: |
| Gengar native starter plus Psychic Energy | **6.977444549%** |
| Mewtwo starter plus Cologne/Energy, Gengar drawn on eighth | **0.036309380%** |
| Mewtwo starter plus Cologne/Energy/Compressor, Gengar unprized in deck | **0.401770962%** |
| **Union of these physical resource routes** | **7.415524891%** |

Exact union: **9,043,015,824 / 121,947,076,667**. The copied-Compressor subcase independently equals **979,895,887 / 243,894,153,334**, matching a separate inclusion-exclusion formula. Direct donor access reduces the earlier donor-agnostic **9.5102%** resource union to **7.4155%** under this stricter model. Both percentages remain distinct from probabilities of actually using Horror House-GX or winning.

The counted distributions are conditional on a starting hand containing any Basic; the six Prizes are sampled without replacement and Gengar copies behind Prize cards are excluded from the Compressor route. This prevents Prize-blind multiplication of marginal draw probabilities.

## Counterfactual slot allocation sensitivity

The following variants **are not submitted decklists**. Every row holds the existing Gengar/Mewtwo/Compressor/Cologne/Energy counts fixed except for the named increases, replaces the corresponding number of **unspecified non-Basic card slots**, and preserves the remaining 16 original Basic Pokémon. They therefore capture limited resource effects while leaving the actual lost Trainer functions unmodeled.

| Hypothetical resource change | Direct union | Change from frozen 60 |
| --- | ---: | ---: |
| Frozen 60 (one Gengar) | 7.415525% | Baseline |
| **+1 Gengar & Mimikyu-GX** | **13.591247%** | **+6.175722 pp** |
| +2 Gengar & Mimikyu-GX | 19.006147% | +11.590622 pp |
| +3 Gengar & Mimikyu-GX | 23.797874% | +16.382349 pp |
| +1 Canceling Cologne | 7.609259% | +0.193735 pp |
| +2 Canceling Cologne | 7.787464% | +0.371939 pp |
| +2 Battle Compressor | 7.756506% | +0.340981 pp |
| +2 Psychic-providing Energy | 8.950821% | +1.535296 pp |
| +1 Cologne and +1 Compressor | 7.865108% | +0.449583 pp |

**Structural finding:** Within this precise direct first-window target, adding a second native Horror House-GX attacker has much larger marginal resource visibility than adding two copies of either supporting Item. It also requires only one replacement slot. The effect is dominated by the native Gengar starter channel; the copied-Compressor channel is just **0.40177%** at one Gengar and **0.40798%** at two Gengar. This changes how one might prioritize *which structural variation to investigate*, without concluding that additional Gengar improves competitive outcomes.

**Adversarial risks:** Gengar & Mimikyu-GX is a TAG TEAM worth three Prize cards if Knocked Out and is Darkness-Weak, which is salient against four published Absol/Garbodor lists in the 29-source field. Extra Gengar can displace a high-value Trainer, make starting boards awkward, expose additional gust targets, or lose a damage race. In the same field, Iron Thorns appears at ranks 6, 24, and 29. The deck remains a proposed challenger rather than a proven universal answer, and the direct window omits optional mulligan bonuses, held/drawn donor alternatives beyond this event, search chains, response counterplay, and every game-level performance question.

## Reproducibility and validation

- [Exact multi-category physical-deal evaluator](../../scripts/newmoon-direct-horror-house-physical-window.cjs) with a disjoint native/drawn-donor/Compressor-donor decomposition and exact BigInt numerator/denominator.
- [Independent exact inclusion-exclusion evaluator](../../scripts/newmoon-thorns-gx-lockline-window.cjs) for the single-Gengar copied-Compressor branch, [five regressions](../../tests/newmoon-thorns-gx-lockline-window.test.cjs); [donor-aware two-route tests](../../tests/newmoon-direct-horror-house-physical-window.test.cjs) verify exact fractions, partition, manifest, and strict relation to the old donor-free metric.
- [Manual existing benchmark CI run 39541880188](https://github.com/FlareZ123/experiment-01/actions/runs/39541880188), head `ba5de05867ca4a3301e3ba607a9df244891bdea9`, **success**. The new tests were added to the pre-existing Node 22 benchmark-statistics manual workflow; no Twinleaf build or game execution was required.
- **Independent Python physical-deal Monte Carlo**, seed `20261022` / `20261023`, 500,000 independent initial shuffles each: one-Gengar model **34,026 qualifying out of 458,338 Basic-valid hands** (7.42378%), exact 7.41552%; two-Gengar model **63,071 out of 465,287** (13.55529%), exact 13.59125%. These agree within ordinary sampling variation. Monte Carlo is an independent numerical check rather than an attack simulation.
- Printed Gengar Horror House-GX single-Psychic cost, Mewtwo Perfection Energy requirement and Canceling Cologne Active Ability suppression came from the repository's supplied card pool `cards/en/sm9.json`, `cards/en/sm11.json`, and `cards/en/swsh10.json`.

**Decision:** nominate a second-Gengar one-slot structural challenger for future falsification under **one competent frozen two-player policy**, alongside its explicit lost slot and difficult Absol matchups. Do not replace the nominated reference, assert an improved win rate, or elevate any existing source-only engine terminal. The full opponent coverage remains **29/32 exact 60s**, and there are **zero competitively qualified games**.
