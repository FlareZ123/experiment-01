# Agent 8: rank-11 prospective scout, unique-source-deal and direct-opportunity calibration

**29 October 2026. Evidence classes: previously published original-Store prospective census plus exact finite-deck combinatorics, with an explicitly idealized probability calculation. No new game and no competitive-qualified win.**

## Observed sample unit

The [Agent 41 preregistered 32-arm scout](agent41-prospective-canonical-scout-native-20261029.md) contains 16 rank-11 arms: eight distinct preregistered rank-11 seed/physical-seat cells, each executed with the unchanged champion reference and unchanged New Moon candidate. All eight rank-11 candidate pairs shared the same authenticated **source** physical opening deal. The only recorded mismatched-source-deal candidate pair was rank 6, seed 861838028. Accordingly, the rank-11 source-opening evidence has **eight distinct source deals**, not 16 independent opportunities.

- Rank-11 source actually started first in 12 of 16 arms, corresponding to **six distinct source-first deals**.
- The direct held-Boost-Shake wrapper completed in two of 16 rank-11 arms, **both on the single source seed 24941728**, which was source-second. This is **one source deal with completion among eight**, not two independent successful openings.
- There were **zero** observed source-first direct completions among six distinct source-first deals. Whether there was even one missed *eligible* direct route in those six deals was not established by that aggregate report.
- This does not change the scout's 20/32 engine terminals, 12/32 caps, zero native exceptions, **zero** competitive-qualified games or 29/32 published original opponents.

## Match the probability model to the implemented wrapper

The [canonical runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) applies `withRank11DirectBoostShake` with K0/K1 Garbodor guards. The [direct eligibility predicate](../../simulation/twinleaf/rank11-direct-opportunity.cjs) needs a **held Boost Shake**, one of six held compatible Tools, and a Trubbish already Benched/held or a held Battle VIP Pass. It eventually needs a searchable Garbodor. **The separate held-Forest-Seal-Stone route is not executed by this direct wrapper.**

The repository's already-tested [exact source-locked opening census](../../scripts/rank11-boostshake-opening-census.cjs), conditional on a legal opening seven, then six randomized Prize cards and one natural draw, establishes:

| Restriction | Favorable joint configurations | Valid joint configurations | Exact probability |
| --- | ---: | ---: | ---: |
| Direct held-Shake, any compatible Tool, Trubbish/VIP, unprized searchable Garbodor | 20,917,841,360,559,248 | 324,031,005,021,884,160 | **6.4555061202%** |
| Direct route **or disjoint held-Seal VSTAR route** | 31,321,703,320,823,661 | 324,031,005,021,884,160 | **9.6662673742%** |

The **6.4555%** structural event is the pertinent model for the *direct held-Shake* policy, not 9.6663%. Even 6.4555% is a resource-access event rather than the observed bot execution probability: the wrapper has turn/phase/target restrictions, K1 aborts, contention, early opponent interaction, and potentially different player decisions. Other productive setup lines outside this direct wrapper remain possible.

Under the clearly artificial assumption that these eight physical source deals independently sample exactly the source census's legal-opening distribution, each with direct structural-event probability `p = 20,917,841,360,559,248 / 324,031,005,021,884,160`:

- Expected direct structural opportunities in eight distinct deals: **0.5164404896**.
- Probability of *zero* in six source-first deals: `(1-p)^6` = **67.0053341846%**.
- Probability of *exactly one* in eight distinct deals: `8p(1-p)^7` = **32.3703869809%**.

Those are illustrations of exposure rarity, **not p-values for simulator quality**, causal evidence, independent observations from 16 paired arms, or probabilities of policy completion. The seed-generated games may depart from the uniform-deal model through actual setup and engine decisions. The published exact census does not model additional draws, opponent disruption, or all legal routes.

## Decision and required next observation

**The result cannot identify a missed source decision.** Two completions on one shared seed are consistent with a scarce direct route; zero source-first completions across six source deals is unsurprising under the narrow direct-resource model. Treating the raw 2/16 as evidence of serious *decision* incompetence confuses access frequency with execution conditional on access. The separate broader Oranguru/Back Order access class [already has its own exact model](rank11-oranguru-firstturn-tool-lock-exact.md) and needs a different executable policy and observation denominator.

The next qualification should retain the complete precommitted source deals and, before the source's first actionable decision, **count owner-visible K0 eligible direct routes separately from noneligible hands**. For eligible routes, record whether the existing direct policy issued the actual legal Store actions; for any owner-deck search, only then use its genuine K1 prompt to classify Garbodor available/Prized/in-hand or native rejection. Follow with the actual Tool-bearing Garbodor board state, source return, and owner-safe opponent reply. Report by distinct source deal, actual starting seat and candidate 60. If source K0 opportunity is absent, it is a resource case, not a missed choice. If an accessible route is ignored, that is actionable policy evidence.

This requires no new runner or workflow. The calibration helper [source](../../scripts/agent8-rank11-source-opportunity-calibration.cjs) and [pure tests](../../tests/agent8-rank11-source-opportunity-calibration.test.cjs) reproduce the numerical model from the existing exact integer counts. Three local Node tests passed on 29 October; compiled GitHub Actions execution of these new files has **not** been claimed.
