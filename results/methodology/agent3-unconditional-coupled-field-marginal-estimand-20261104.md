# Agent 3: different original-source physical deals can still support an unconditional randomized field comparison

**4 November 2026 | mathematical methodology and eight pure synthetic tests. No Aichi competitive games were newly run, completed or certified.**

## Precise research question

The archived selected-v2 experiment contains an authentic cross-candidate setup mismatch at **original rank 5, seed group `5:101:A`**. [Agent48's archived forensic audit](agent48-frozen-selected-v2-original-archive-posthoc-20261103.md) established that the reference candidate mulliganed once while the New Moon candidate did not, giving the source one bonus draw only against the reference. Despite identical registered seed and real first-player seat, the source's actual physical opening fingerprint differs. This is a real failure of an *exact-identical-original-source-opening* claim.

The existing [Agent46 paired physical-deal confidence sequence](../../simulation/evaluation/agent46-anytime-paired-field-delta.cjs) conservatively assigns `[-1,1]` to any mismatch, even if two independently qualified terminal outcomes would be available. That is appropriate when the planned inference explicitly requires **identical physical source openings**. It is more conservative than necessary for a *different* estimand: an unconditional randomized win-rate difference between the two frozen 60s, each facing the original source as naturally shuffled and compensated under its own rules-valid setup.

This result provides an alternative estimator with explicit additional assumptions. It does **not** retroactively requalify any historical simulation, prove simulator marginal correctness or overturn the physical mismatch finding.

## Mathematical distinction

Let `U` be a preregistered independent random-seed block and let `Y_R(U)` and `Y_C(U)` be valid, fully certified binary game-win outcomes of reference and challenger respectively. Different candidate Basic counts can induce different source mulligans, bonus draws or later RNG consumption. Consequently the two source physical positions may differ even when the underlying random block is shared.

For the **unconditional field contrast**, linearity gives

`E[Y_C(U) - Y_R(U)] = E[Y_C(U)] - E[Y_R(U)]`.

This identity requires correct **marginal distributions** of the two simulated games; it does not require identical source positions or independence of the two outcomes *within* a seed block. Shared random numbers may be used for variance reduction, although that is beneficial only when the induced covariance is favorable. A different physical source position cannot be labeled a matched-opening counterfactual.

By contrast, selecting only those blocks where the source happens to be physically identical produces `E[Y_C-Y_R | source-match]`, which generally differs from the unconditional target. It can even change the sign. An exhaustive two-round synthetic example in the tests has 32 matching-source registered pairs with `D=+1` and 32 mismatched-source pairs with `D=-1`. The **registered unconditional average is zero**. Discarding the latter produces **+1**, an unsupported full-field advantage. This is a mathematical counterexample, not an observed Pokémon result.

## New separately named comparison

- [Pure CJS estimator](../../simulation/evaluation/agent3-marginal-coupled-field-delta.cjs): `marginalCoupledFieldDelta`, 32, 64 or 128 prespecified equal-weight rank/seat/start cells with equal numbers of complete registered rounds.
- [Eight Node tests](../../tests/agent3-marginal-coupled-field-delta.test.cjs): all-mismatched positive and negative qualified outcomes, censored arm retention, exact-source match parity, biased matched-only selection, duplicate IDs, missing ranks, unequal rounds, unaligned rounds and missing study attestations. All **8/8 locally passed under Node v22.16.0 on 4 November**. The [existing manual smoke CI run 41755302735](https://github.com/FlareZ123/experiment-01/actions/runs/41755302735) then **succeeded** at head `14c2b0d73b1683e1c18a4cc899c39c89bea53b21` with this test added to the pure suite. These are synthetic mathematical tests; no compiled Twinleaf or official paper clock is exercised.
- For each pair, require distinct nonempty pair identity, its registered common round identity, two nonempty original-source fingerprints and separate `QUALIFIED_WIN`, `QUALIFIED_NONWIN` or `CENSORED` outcome labels. Every registered attempt remains in the denominator.
- Record `matchingSourceOpenings`, `differingSourceOpenings`, `fullyObservedMismatches`, `censoredPairs`, each outcome interval, the resulting field interval and the conservative decision. **Mismatched actual openings remain mismatched in the record.**
- Require explicit declarations `independentAcrossCells`, `marginalSourceSamplingValidated` and `prospectivelyRegisteredRounds`. These declarations are *external assumptions*, not verification. An analysis supplied with dishonest flags is invalid regardless of the code's syntactic acceptance.

For `C` equal-weight independent cells and `n` independently sampled rounds, each latent pair contrast is bounded in `[-1,1]`. With preregistered comparison ordinal `k` and familywise error budget `alpha`, the two-sided anytime union-Hoeffding radius used is

`sqrt(2 log(2 k (k+1) n (n+1) / alpha) / (C n))`.

Unqualified or censored outcomes retain the sharp component-wise binary outcome interval, yielding a lower and upper observed field contrast before the concentration radius. This works under arbitrary censoring because the unknown true sample contrast is contained **pathwise**, but cannot make wide censored intervals informative. A 32-cell, 16-round all-positive *synthetic* test gives 512 complete mismatched pairs, sample delta +1 and radius about **0.19752** with `alpha=0.05,k=1`; it is a unit-test fixture, emphatically not a claimed deck advantage.

## Distinct admissibility conditions

Use this comparator only when the *registered target* is each fixed 60's performance against a genuinely randomized original-source opponent under that candidate's natural setup. Prove correct marginal source distribution independently, including mulligan and compensation rules, stable source card-name/count identities and declared print proxies, frozen symmetric decision policies, both physical seats/start configurations, official paper match-clock outcomes and independent prospective seed-block generation. If the desired scientific claim is instead "both candidates faced the exact same physical source opening," continue using the existing strict physical-matched estimator and reject mismatched pairs for **that** claim.

In the real repository today, **none** of the archived Twinleaf terminals have passed full paper/game/policy/clock certification. Their native winner fields must never be relabeled `QUALIFIED_WIN` solely to feed this comparator. Its output intentionally contains `competitiveQualified:false` even when supplied synthetic status labels say `QUALIFIED_WIN`. No status here raises the Aichi benchmark above **29 authenticated name/count compositions out of 32**, with missing 23, 25 and 28, zero competitively qualified games, no selected final 60 and no 99.5% evidence.

## Design review requested

The useful next peer review is with Agents **46** (paired confidence sequences), **48** (actual rank5 mismatched-source provenance) and **41** (shared bilateral release). They should evaluate whether an *independently justified marginal sampler* is plausible under the actual pinned engine, and whether an explicitly preregistered unconditional estimand would improve the next comparative campaign. Preserve Agent46's strict physical-pair estimator as a separate answer to a separate question. Do not replace it silently or choose between the two estimators after seeing which one is more favorable.

**Agent 3**
