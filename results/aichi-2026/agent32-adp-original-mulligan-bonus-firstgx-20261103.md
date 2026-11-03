# Agent 32: exact original-mulligan bonus card rescue for the ADP first-GX opening

**3 November 2026 | exact source-60 physical hand/Prize enumeration with bounded bilateral setup weighting | zero native matches or qualified wins.**

## Why this extra screen is needed

The unchanged [Agent5 ADP/Thorton/Regidrago v2 fixed sixty](candidates/agent5-adp-thorton-regidrago-60-v2.json) has seven Basics. Its prior [first-eight-card ADP starter plus Switch/G&H/Tag/Quick Ball screen](agent32-adp-switch-tutor-extension-20261103.md) measured **36.456100999688%** physical access to the specified enhanced Altered Creation-GX opening, conditioned on a Basic-valid starting seven **and no opponent mulligan bonus draws**.

That exclusion matters against opponents with very few Basics. All three original rank 6/24/29 Iron Thorns lists have four Basics and frequently fail initial seven-card setup, potentially offering this candidate extra cards **after Prize setup but before its first ordinary draw**. The pilot can choose to take all allowed bonus cards, and those cards may contain ADP, Switch, DDE, Guzma & Hala, Tag Call or Quick Ball. This analysis computes the expanded hand-space accurately while preserving the opening Active choice from the **original seven**.

## Physical access definition, extended to bonuses

With m additional cards actually drawn after the opponent's eligible mulligans, first-GX availability is checked among **8 + m** visible cards on the going-second pilot's first own turn. The initial seven must be Basic-valid.

The original starting Active must be **ADP from the actual initial seven**, or another Basic from those seven followed by a held **Switch** promoting an ADP that was bonus/ordinary-drawn or searched via Tag Call or Quick Ball. One DDE must be held by first draw, or accessible in the remaining deck through held G&H or held Tag Call fetching G&H. Tag Call can also obtain the TAG TEAM Pokémon ADP and TAG TEAM Supporter G&H in the same action. All required target groups must survive the six facedown Prize cards. The candidate is assumed to accept **all** available optional bonus draws. Search permissions and physically payable discards are assumed in this *optimistic card-location screen*, with strategic DCI, locks, original opponent actions, natural policy choices, and actual GX declaration outside scope.

For any fixed m, the result is an **exact integer enumeration** over eight disjoint printed-card groups: ADP 2; other Basic 5; Switch 2; Tag 4; Quick Ball 3; G&H 3; DDE 4; Other 37. Rather than selecting an eighth-card category separately, the enumerator counts each possible unordered **8+m-card visible hand**, weights by the exact number of ways the **original seven** can contain ADP (or contain another Basic and no ADP), and applies full six-Prize inclusion-exclusion to every required deck target. This method accurately prevents bonus-drawn ADP from being treated as a freely selectable original Active Pokémon.

## Exact access when m bonus cards are received

| Bonus cards actually taken | Exact physical first-GX access among Basic-valid original sevens |
| ---: | ---: |
| 0 | **36.456101%** |
| 1 | **40.304418%** |
| 2 | **43.938323%** |
| 3 | **47.359769%** |
| 4 | **50.571242%** |
| 5 | **53.577273%** |
| 6 | **56.384901%** |

The zero-bonus BigInt fraction and both disjoint Active-start branches reproduce the independently developed earlier source evaluator **exactly**, confirmed by a dedicated regression. Extra cards expand physical reach, but do not guarantee that the pilot can play the Items, pay acceptable discards, safely attach DDE or survive the opponent's already-played turn.

## Bilateral mulligan distribution and matchup-specific correction

If qA is the candidate's probability of a Basic-invalid starting seven, qB the original opponent's probability, then both-player simultaneous mulligans cause a joint redraw. In the terminal setup cycle, the probability the candidate receives m **eligible bonus cards** from the opponent is:

- For m=0: **1 − (1−qA)qB/(1−qAqB)**.
- For m≥1: **(1−qA)(1−qB)qB^m/(1−qAqB)**.

The first-seven distribution conditional on being Basic-valid is independent of m. Accordingly, the actual conditional probability of passing the *physical access screen with maximum optional bonus draws* is the weighted sum of the exact fixed-m access probabilities. For each source Basic count B we evaluate **m=0 through 32** and bound the omitted tail by its exact probability **(1−qA)qB^33/(1−qAqB)**, assuming any tail continuation can contribute from zero to one. Against the four-Basic originals, that tail is below **0.000000039** in probability. No extrapolation beyond this interval is needed.

| Opponent original source | Original Basics | No-bonus physical access | Bonus-weighted lower bound | Upper bound |
| --- | ---: | ---: | ---: | ---: |
| Rank 6 Iron Thorns (also ranks 24,29) | 4 | 36.456101% | **40.655622157%** | **40.655626036%** |
| Rank 1 Shadow Rider | 14 | 36.456101% | **36.846394179%** | **36.846394179%** |
| **Equal-weight 29 authenticated originals** | Mixed | 36.456101% | **37.330408368%** | **37.330408769%** |

The original rank-6 four-Basic setup produces **47.45694%** probability of at least one optional bonus card being offered to the ADP pilot, compared with **8.81524%** against rank 1. This translates into a roughly **4.20 percentage-point** first-GX *physical-access* rescue against original Iron Thorns under the maximum-draw choice, versus roughly **0.39 percentage points** against rank-one Shadow Rider. The equal-original average rescue is about **0.8743 percentage points**. Those values concern the specified hand/deck/Prize conjunction and exclude the original Thorns' Item/Ability disruption.

## Evidence and reproducibility

- [BigInt exact all-m physical evaluator and bilateral distribution](../../simulation/evaluation/agent32-adp-mulligan-bonus-firstgx.cjs), with cached binomial coefficients, source-count assertions, original-seven Active weighting, actual six-Prize survival and exact first-eight m=0 reproduction.
- [Six deterministic regressions](../../tests/agent32-adp-mulligan-bonus-firstgx.test.cjs), including C(0,0), Prize survival, zero-bonus cross-check, monotone positive m, two-player bonus normalization, opposite-source Basic counts, exact same-B grouped results.
- [Native original-29 printed Basic census](../../simulation/evaluation/agent32-adp-field-mulligan-offers.cjs) and [its previous exact report](agent32-adp-original29-mulligan-bonus-offers-20261103.md).
- Existing manual-only [card audit workflow](../../.github/workflows/aichi-card-audit.yml): **GitHub Actions [41556127756](https://github.com/FlareZ123/experiment-01/actions/runs/41556127756) SUCCESS** at source head **37bf3b2618795ac3359321a2d5181fec50847db1**. Six new regressions, zero failures; source exact m=0 and max-m=32 all-29 report executed in the repository. No native games and no competitive winner claims.

## Research decision

This source-specific calculation corrects a known omission in the earlier first-GX access analysis. Original four-Basic Iron Thorns can grant the ADP pilot more initial cards, partially mitigating its scarce start resources. The correction is real and bounded but **does not remove the central bottleneck**: even under the pilot's maximal bonus-draw assumption, only about **40.66%** of legal candidate openings against that source rank satisfy the defined early ADP GX hand/Prize/Active access condition. Other draw, switching, Supporter-search and ability routes can raise genuine practical access beyond this screen. Original Iron Thorns may itself disrupt DDE or Item/Supporter lines, lowering the rate of **actually completed** GX attacks.

A capable bilateral source policy must record concrete candidate and original mulligan counts, bonus cards offered and taken, candidate's actual initial Active, the accepted Tag/Quick/G&H payments, source-owned pressure, genuine enhanced GX flag and Thorton continuation before presenting matchup evidence. The unchanged v2 sixty remains an unranked structural proposal. Three original field 60s (23/25/28) are absent; zero qualified paper games and no 99.5% result exist.
