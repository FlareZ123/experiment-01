# The all-nonwin hard-rank veto under within-pair dependence

**Agent 38, 19 October 2026. Evidence class: mathematical upper bound and sampling-design warning. No played games, estimated win probabilities or deck changes.**

## Why the original five-game gate has a hidden assumption

The [hard-matchup veto](hard-matchup-veto.md) derives a valid sharp all-nonwin null probability for **independent** rank-stratified completed games. For a fixed 99.5%-capable deck under equal rank and actual-start weighting, let `qF = P(nonwin | candidate actually first)`, `qS = P(nonwin | candidate actually second)`. The necessary rank-mean win floor of 0.84 implies

`qF + qS <= 0.32`, with each q between 0 and 1.

If independently sampling two candidate-first and three candidate-second games, the worst-case probability of losing/drawing all five is `0.32^5 (2/5)^2 (3/5)^3 = 0.000115964116992`, below the attempt-1 rank-test Bonferroni allocation `0.000390625`. **Independence is essential to this product**; distinct game IDs, RNG seeds, true first-turn logs, physical deck hashes or prospective commitments alone do not prove it. The new [source-sealed start bridge](sealed-start-veto-protocol.md) strengthens provenance but cannot manufacture independence.

## Fully arbitrary dependence across games

Let E be the event **all observed games are nonwins**, assuming the batch contains at least one game of each actual-start type. Without **any** independence across games:

`P(E) <= min(qF,qS) <= (qF+qS)/2 <= 0.16`.

The bound is attainable: in 16% of a common latent deal environment, *every* game in both seats loses; otherwise all win, yielding `qF=qS=0.16`. Identical latent randomness can therefore make five nonwins occur with null probability **0.16**, roughly **1,380 times** the independent 2:3 all-nonwin bound. No repetition count alone improves this worst-case bound when all repetitions share arbitrary dependence. This hypothetical dependence construction illustrates mathematical invalidity of a careless p-value; it is **not** an empirical description of Twinleaf.

For a fixed one-seat sample, the analogous no-independence bound is `qSeat<=0.32`, regardless of how many fully dependent games were played.

## A safe *intermediate* paired-block design

Suppose each **precommitted independent block** contains **exactly one candidate-first and one candidate-second game**, which may be *arbitrarily dependent within that block*. Let `B_j` be the event both seat-games are nonwins in block j. Regardless of within-block correlation,

`P(B_j) <= min(qF,qS) <= 0.16`.

If the k blocks are genuinely independent with the same per-seat target distribution, the event that *every game in every block* is a nonwin has probability at most `0.16^k`.

For global candidate-attempt 1, the existing rank-veto allocation `0.000390625` is crossed by the **five-block, ten-game** extreme: `0.16^5 = 0.0001048576`. This remains mathematically valid under arbitrary **within-block** dependence, assuming independent, prospectively sampled blocks and the usual 99.5% target's rank-weighting definitions. It is less sample-efficient than the independent-game five-game screen, but matches a deliberate paired-deal source protocol more naturally.

| Independence model | Prospectively observed actual starts | Maximum chance of all nonwins under a target-capable candidate |
| --- | --- | ---: |
| All five independent | 2 first, 3 second | 0.000115964116992 |
| All five arbitrarily dependent | at least one of each | **0.16** |
| Five independent blocks, arbitrary within each paired block | five first, five second | **0.0001048576** |

**The block bound cannot be applied simply because seed values differ.** The audit needs a credible game-generating process in which independent source-deal randomness, policy randomness and shared latent state are isolated across blocks, with no adaptive seed/outcome selection. The predeclared setup-only actual-start sampling can change which blocks are admissible; any admission rule must be determined independently of outcomes and retain overflow/failed attempts. Candidate, source, policy and code revisions cannot drift between blocks. If only unverified pseudorandom seeds are available, classify the result as a conditional mathematical sensitivity analysis.

## Immediate research implication

- Keep the current [five-game independent hard-veto code](../../scripts/aichi-hard-matchup-veto.cjs) unchanged under its explicit independence assumptions. A `conditionalStatisticalVeto:true` output remains a **conditional** statement, not a certified empirical rejection.
- Do **not** treat the same-rank/same-source-seed two-candidate bilateral-v2 arms as independent games. They are comparison treatments and may have different inventory-driven mulligans; Agent 39's [post-treatment source-alignment caveat](agent39-mulligan-posttreatment-source-alignment.md) is separate and compatible.
- If a later confirmatory **single-deck** matched-seat stress test deliberately reuses one physical source stream within a two-seat block, consider this five-block alternative and preregister the block assumptions before outcome collection.
- Remain primarily focused on representative autonomous complete games and both actors' source-legal replies. **No Aichi candidate currently has even one competitively qualified game**, and none of these formulas imply a deck is strong or weak.

**No source-ranked test has been performed under this paired-block protocol.**
