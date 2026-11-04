# Agent 2: a fourth Quick Ball increases access while reducing positioned first-turn lock-plus-attacker geometry

**4 November 2026 | exact structural sensitivity, 0 native or paper-qualified wins**. This investigates a hypothetical third allocation in the existing Apex Alchemy package, using the unchanged remaining **54 card slots**. The third allocation is **not an authenticated tournament list, registered winning deck, or selected final 60**.

## Three resource packages and counterintuitive result

The original frozen [Agent43 v0 printed 60](../aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json) contains **3 Boost Shake and 3 Quick Ball**. Existing Agent2 [v1 4 Shake / 2 Quick](../aichi-2026/agent2-apex-alchemy-shake4-quick2-v1.json) is a one-for-one Item replacement. Hypothetical **v−1** substitutes 1 existing Boost Shake with 1 Quick Ball, yielding **2 Shake / 4 Quick** and preserving the same printed identity set and 60-card total.

All probabilities below are **exact combinatorial opportunity incidences conditional on a valid initial seven containing at least one Basic**, independent of play quality. Underlying attack-enabling search Item discard costs and opponent decisions are not paid, so none is a game-win rate.

| Exact first-eight plus six random Prize opportunity | Hypothetical 2 Shake / 4 Quick | Registered v0 3 / 3 | Registered v1 4 / 2 |
| --- | ---: | ---: | ---: |
| Grimer→Muk via Shake (no separate Regidrago requirement) | **14.982426%** | 20.124008% | **23.766991%** |
| Budew held or Quick-searchable, whether Active or Benched | **48.121027%** | 41.503976% | 34.013882% |
| Either abstract early lock AND independently obtainable Regidrago V, after a shared-Item-connector exclusion | **43.260594%** | 39.611630% | 35.514662% |
| Regidrago V itself accessible (held or eligible search) | **86.390042%** | 83.920291% | 81.075102% |
| Muk/Shake AND Regidrago with noncontended search | **11.107024%** | 14.526932% | **16.666868%** |
| Opening-seven Budew and Regidrago V accessible (Budew may be chosen Active at setup) | **11.757079%** | 11.303403% | 10.784916% |
| **Positioned either lock AND Regidrago**, requiring Muk route or opening-seven Budew | 21.525138% | 24.109997% | **25.518076%** |
| Both abstract lock and Regidrago resources hypothetically accessible but not positioned under this simple model | 21.735456% | 15.501634% | 9.996586% |

The **2 Shake / 4 Quick** variant raises the permissive abstract **either lock + attacker** metric by **+3.648963 percentage points against v0**, while **lowering the positioned version by 2.584858 points**. Budew search via Quick Ball becomes more frequent, but a Budew added to the Bench cannot immediately use Itchy Pollen without moving to the Active Spot. This model does not grant a free movement effect. Meanwhile the reduction in Boost Shake directly reduces Muk setup access. The fourth Quick increases nominal search connectivity but often yields an incomplete initial-turn line.

Conversely, **4 Shake / 2 Quick** lowers abstract joint access by 4.096968 points versus v0 but raises *positioned* joint access by 1.408080 points. That is not automatically stronger in games: the Muk line, Budew attack, Regidrago attack setup, future resource access, matchup value and expected opponent action are meaningfully different.

## Exact calculation and independent checks

Reused the previously scrutinized [9-category exact first-eight/Prize algorithm](../../simulation/evaluation/agent2-alchemy-attacker-lock-joint-first8.cjs), without touching that locked archival implementation or its tests. Categories are 2 Alolan Grimer, 2 Alolan Muk, Shake count, 4 Mysterious Treasure, Quick count, 1 Budew, 4 Regidrago V, 5 other Basic Pokémon and 36 remaining cards. The three choices satisfy Shake+Quick=6 and keep all 60 slots unchanged.

Every eight-card count pattern receives its exact hypergeometric multiplicity. We distinguish the eighth-card ordinary draw from the actual initial seven when validating a starting Basic and an actual *opening-seven* Budew start. Then all jointly possible six-Prize Grimer/Muk/Budew/Regidrago compositions are enumerated with integer binomial coefficients. The denominator and Basic-valid count are common to all three allocations, and search connectors can service only one incompatible function if insufficient independent copies exist. A Grimer→Muk Shake opportunity requires an independently eligible non-Grimer opening Basic, unprized Muk, and Grimer held or searchable; a Quick-accessible Budew on Bench does not count as already Active.

- [Nonregistered v−1 exact BigInt source](../../simulation/evaluation/agent2-alchemy-2shake-4quick-geometry-sensitivity.cjs) preserves v0/v1 logic and limits the additional input to 2 Shake/4 Quick.
- [New regression](../../tests/agent2-alchemy-2shake-4quick-geometry-sensitivity.test.cjs) asserts old v0/v1 full exact counts remain strictly identical, v−1 numeric metrics and partition identities, and illegal five-Quick sensitivity is rejected.
- [Bounded reproducible manual CI](../../.github/workflows/agent2-apex-2shake-geometry-pure.yml), [successful CI 41898275370](https://github.com/FlareZ123/experiment-01/actions/runs/41898275370) at code checkout **5d80b0c75b5d7e53062e9b787e04d5e91233963a**, uploaded complete integer counts and JSON to GitHub Actions.
- An independently written local **Python math.comb** enumeration with 9 categorical counts and six-Prize stratification reproduced the three sets of figures above to at least 12 significant decimal digits, including the original registered values. No random seeds or Monte Carlo sample sizes are involved in these exact counts.

## What is unmodeled and the experiment that would discriminate

This is a **structural screen**. It does not pay Quick Ball or Mysterious Treasure discards, spend the one Supporter, check energy requirements or both attackers' attachments, assess Bench space after other support Pokémon, test float/retreat availability, guarantee that opening Budew is actually the chosen Active, resolve Muk Power of Alchemy under active enemy locks, or measure opponent's next-turn Item/Ability dependence. Going first versus second changes whether Budew can attack immediately; all probabilities are conditional on an initial valid Basic and *do not* incorporate optional opponent-mulligan compensation draws.

A decisive comparison needs registered, immutable printed 60s, uniform natural full shuffled deals, an owner-information-only policy that can choose between Muk Shake and a Budew Active opening, meaningful paid attacks and opponent continuation, followed by full paper-rule audited game outcomes against all 32 authentic source sixties. Until then the hypothetical fourth Quick Ball is **not** shown to improve play strength, and neither v0 nor v1 should be promoted from these proxy metrics alone.

This is an explicit example of the human research caution **access is not success**: graph connectivity can rise while immediate turn-realizable positional plans decline.

**Global benchmark status unchanged:** 29/32 authenticated originals, missing ranks 23/25/28, zero qualified games, no proven 99.5% fixed deck.
