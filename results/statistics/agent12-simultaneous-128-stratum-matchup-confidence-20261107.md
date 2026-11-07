# Simultaneous 99.5% confidence for every Aichi matchup under 128-stratum balance

**Agent 12 | 7 November 2026 | prospective statistical design and executable validator.** This adds a stronger qualification tier to the field-mean methods. It contains **no played games, no candidate deck recommendation, and no demonstrated 99.5% performance**.

## Two distinct claims

A 99.5% equal-weight average over the full 32-opponent field and a claim that every individual matchup exceeds 99.5% are different estimands.

The existing [128-stratum field-mean bound](agent12-exact-balanced-field-all-win-bound-20261107.md) treats the four candidate-seat/first-player combinations for each opponent as 128 equally weighted cells. Five all-win games in every cell, 640 total, gives a conservative 95% lower bound of 99.5330106% on the **field mean**. That aggregate result can still include a weaker individual matchup if stronger matchups compensate.

This report instead asks for a simultaneous guarantee that **all 32 opponent-specific means** exceed 99.5%. For opponent rank r, define its mean across the four equally weighted contexts:

`p_r = (p_{r,0,0} + p_{r,0,1} + p_{r,1,0} + p_{r,1,1})/4`.

The four indices are candidate physical seat and first-player seat. Every one of the 128 cells receives the same preregistered number k of independent paper-qualified games.

## Exact all-win floor with familywise 95% confidence

Within a fixed rank, if all 4k games are wins, the probability of that event is

`\prod_{s,f} p_{r,s,f}^{k} \le p_r^{4k}`

by the arithmetic-geometric mean inequality. Allocate one-sided error probability `alpha/32` to each of the 32 opponent claims. Bonferroni then gives at least 95% familywise coverage without requiring independence between the 32 rank-level confidence statements.

For all wins, the per-rank lower bound is

`L_r = (alpha/32)^{1/(4k)}`, with `alpha=0.05`.

| Games per 128-stratum cell | Games per opponent | Total across 32 opponents | Simultaneous lower bound per opponent | Result |
| ---: | ---: | ---: | ---: | :---: |
| 322 | 1,288 | 41,216 | 99.4995894623306% | Fails |
| **323** | **1,292** | **41,344** | **99.5011348501534%** | **Passes** |

The integer threshold is therefore 323 all-win games in each of the 128 cells. This is a stronger claim than the 640-game field-mean floor. It also explicitly balances first-player assignment inside each matchup.

Agent6's earlier 1,290-games-per-opponent / 41,280-total bound remains correct for its stated per-opponent sample without a four-cell integer quota. The 41,344 floor here is the corresponding design when every rank is balanced across both candidate seats and both first-player assignments. See [Agent6's evidence-floor analysis](../methodology/agent6-fixed60-995-confidence-design-floor-20261107.md).

## Nonzero losses: per-rank heterogeneous Chernoff-KL bounds

The all-win threshold is only the cleanest special case. For each rank independently, let `q_r` be its observed win fraction over its 4k games. The existing heterogeneous Bernoulli Chernoff-KL method computes a one-sided lower bound by inverting

`Pr(S_r/(4k) >= q_r | p_r) <= exp[-4k D(q_r || p_r)]`.

It does not assume identical seat or first-player win probabilities within a matchup. Each rank uses confidence `1 - 0.05/32`; Bonferroni supplies the familywise guarantee. A complete panel passes the stronger target only if **every** rank-specific lower bound is at least 0.995.

Examples from the exact implementation and independent Python numerical inversion:

| Nonwins in a rank | Games per 128-stratum cell | Games for that rank | Rank lower bound | Result |
| ---: | ---: | ---: | ---: | :---: |
| 0 | 323 | 1,292 | 99.5011348501534% | Pass |
| 1 | 486 | 1,944 | 99.5002266318960% | Pass |
| 1 | 485 | 1,940 | 99.4991984907088% | Fails |
| 2 | 602 | 2,408 | 99.5004640334765% | Pass |
| 2 | 601 | 2,404 | 99.4996345963929% | Fails |

For a design allowing one nonwin in each matchup, 486 games per cell gives 62,208 total games. Allowing two nonwins in each matchup requires 602 per cell, 77,056 total. These are fixed-sample examples; choose and preregister the complete denominator before observing outcomes. A single loss concentrated in one matchup can fail that matchup's bound even when the aggregate field-mean bound passes.

## Reproducible implementation

- [Implementation](../../scripts/agent12-simultaneous-matchup-kl-bound.cjs) reuses the shared strict 128-stratum manifest validator and heterogeneous KL inversion. It returns a separate lower bound, observed win count and nonwin count for every rank, the minimum matchup lower bound, the simultaneous pass flag, and the exact all-win sample floor.
- [Adversarial tests](../../tests/agent12-simultaneous-matchup-kl-bound.test.cjs) cover the exact 322/323 all-win boundary, a single loss that defeats a low-exposure matchup, one- and two-nonwin balanced sample boundaries, missing source lists, native/error/censored outcomes, imbalanced seat or first-player exposure, candidate/policy/engine/opponent/adjudication hash changes, and duplicated physical-deal or paper-receipt IDs.
- Integrated into the existing manual-only [Agent12 statistical workflow](../../.github/workflows/agent12-statistical-field-confidence.yml). Node 22 [CI run 42381194686](https://github.com/FlareZ123/experiment-01/actions/runs/42381194686) passed the complete confidence, mulligan-pairing, and Basic-opening suites after correcting a source-roster/card-database Prism Star diamond normalization mismatch discovered by the first integrated run. The initial run 42381005357 failed three pre-existing Basic-census tests on `Ditto ♢ LOT 154`; the source roster uses U+2662 while the English card database uses U+25C7. The resolver now normalizes that symbol only, and explicit Ditto/Tapu Koko printing regressions pass in the successful run.

## Admission limits and current status

The validator checks all 32 unique source-rank assertions, all 128 balanced cells, registered attempt count, unique trial/deal/receipt IDs, fixed candidate 60 and policy hashes, fixed engine/hooks, opponent-policy bundle and adjudication hashes, and allowed paper-qualified outcome labels. It returns no bound for a missing rank, a native-only/error/censored attempt, an incomplete registration, duplicate IDs, or changed experiment fingerprints.

Those structural checks do not authenticate source screenshots, original printing legality, physical RNG independence, complete game adjudication, opponent competence, or the truth of a caller-supplied `paper-qualified-*` label. Those remain external audit requirements. Candidate selection on the same observed games also invalidates naive confirmatory coverage; freeze the selected single 60 and use an untouched preregistered holdout.

The live benchmark still has **29/32 authenticated original lists, missing ranks 23/25/28, zero competitively qualified games, no selected final fixed 60, and no demonstrated 99.5% result**. This method is a future matchup-level evidence gate only.
