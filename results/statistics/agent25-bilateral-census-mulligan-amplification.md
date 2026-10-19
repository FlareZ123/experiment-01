# Agent 25: prospective bilateral census reviewability versus legal candidate mulligans

**19 October 2026 UTC. Evidence: exact finite-sample probability calculation and code-path review.** No simulator games were executed, no opponent source altered, no deck promoted. This builds on [Agent 39's original candidate-mulligan discrepancy](agent39-mulligan-posttreatment-source-alignment.md) and [Agent 2's separate unconditional census](../aichi-2026/agent2-v2-unconditional-paired-census.md). The earlier individual discrepancy is theirs; the finite-cohort sensitivity and current-report flag analysis here are independent.

## Frozen inventory asymmetry and exact marginal lower bound

The two v2 proposed candidate 60s have 14 Basic Pokémon (source champion reference) versus 17 (New Moon). A uniformly random initial seven is a mulligan if it contains no Basic. Therefore

```
p14 = C(46,7)/C(60,7)
p17 = C(43,7)/C(60,7)
delta = p14 - p17 = 21,300,566 / 386,206,920
      = 0.05515324790140995
```

Under **any coupling** of the two candidate decks' marginal initial seven-card sampling laws, the probability that their *first* mulligan/valid status differs is at least `delta`. This follows from the elementary coupling inequality `P(X≠Y) ≥ |P(X=mulligan)-P(Y=mulligan)|`. This exact bound is on **candidate opening status**, not on final opponent source-deal fingerprint divergence.

If an eligible v2 plan independently randomizes `N` distinct paired opening streams, and each stream's paired candidate-opening event has valid marginals, then conditional on independence **between** streams, the probability of seeing at least one unequal initial mulligan status is at least `1 - (1-delta)^N`. For reference:

| Independent registered pair streams `N` | Minimum probability of at least one different *initial mulligan status* |
| ---: | ---: |
| 4 | 20.30235% |
| 8 | 36.48285% |
| 12 | 49.37833% |
| 16 | 59.65572% |
| 24 | 74.37446% |
| 32 | 83.72339% |
| 64 | 97.35072% |

These figures are **design calculations**, not observed mismatches. Across-stream independence and unconditioned uniform legal openings are necessary premises. Shared future opponent state need **not** differ in every candidate-mulligan discordance: the source player may decline compensation, an engine might independently freeze the pre-bonus source RNG draw, and observed fixed-seed couplings may not realize the probabilistic bound. A useful diagnostic records both actors' actual mulligans, optional source compensation choices, source initial seven and later source-first-turn fingerprints rather than forcing an equality inference.

## Precise existing report-path consequence

Source reviewed: `simulation/evaluation/agent2-bilateral-unconditional-census.cjs` as of 19 October. Its `auditUnconditionalBilateralCensus` does preserve **all** registered arms and accurately exposes `first-only-witnessed`, `second-only-witnessed`, `neither-witnessed` for **aligned** complete-terminal pairs. However:

- `pairedAttemptCensusReviewable` requires `pairs.every(pair => pair.actualSourceDealAligned && pair.actualStarterAligned)`. One unaligned pair anywhere makes the report-level flag false, even if each arm has an authentic registered, independently started, legal initial draw.
- `pressureCell` chooses `unaligned-start-or-deal` **before** evaluating either independently authenticated source pressure. Thus, a legitimate but unaligned two-terminal pair with, e.g., source pressure in reference only, increments only the unaligned category, although per-arm `candidateArms[].sourcePressureEvidence` retains the correct positive/negative observations.
- The underlying `auditBilateralV2` separately has `completeAttemptCensus` and per-candidate actual-start coverage; none presently survives into the inclusive module under a conspicuous distinct independent-of-source-alignment flag.
- This is a **reporting problem** for intent-to-test evidence, not permission to call unmatched source-deal pairs comparable *counterfactuals*. Existing exact paired mechanical counterfactual gates correctly require genuine alignment and must remain intact.

An honest v2 output can therefore distinguish (1) **full preregistered arm accounting** and independently validated actual starts, (2) **exact matched-initial-source-deal subset** for controlled same-deal evidence, (3) **all independently valid but naturally unaligned streams** where a deck-inventory-dependent mulligan/opponent-bonus difference can be a real treatment consequence, and (4) **conditional pressure/response mechanical coverage**. Keep engine-error/cap/missing arms in the first denominator with status; no game win certification follows from any of these.

## Suggested policy-neutral correction before actual v2 data

Add two non-interchangeable top-level fields in the integration owner’s reporting surface:

- `allRegisteredAttemptsAccounted`: strict base `completeAttemptCensus`, with counts by candidate/rank/actual-first-seat and missing/error/capped recorded; does **not** demand source fingerprint equality and does **not** imply policy/game quality.
- `matchedPhysicalDealsReviewable`: existing stringent `pairedAttemptCensusReviewable`, preserving physical fingerprint matching, validated chronology and matched tactical investigations.

Optionally show a separate four-pressure-status cross-tab among independently valid two-terminal **unaligned** pairs so that genuine candidate-dependent failure to establish a lock is not hidden under one `unaligned` total. These unaligned arms should not be presented as matched-deal counterfactuals. Source compensation/mulligan protocol should be frozen prospectively, and no outcome-dependent removal should occur.

**Status:** the current authenticated dataset has 29 of 32 exact original opponent 60s and zero competitively qualified matches. No 99.5% claim or causal inventory estimate arises from this note.
