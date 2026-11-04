# Agent 3: pre-setup native aborts must remain in the unconditional field denominator

**4 November 2026 | prospective comparative-analysis interface correction.** This is a structural data-integrity change with synthetic tests. **No new game was played**, no archived result was retroactively certified, and the benchmark still has **zero competitively qualified games, 29/32 authenticated original name/count inventories and no nominated final 60**.

## Actual integration blocker

[Agent50's owner-only original setup quarantine](agent50-issue25-go-second-next-owner-setup-blocker-20261104.md) reports original four-arm native attempts in which the generic decoder was blocked *before* the original source physical deal could be fingerprinted. Each of four rows had `sourceDealDigest=null`, and all four remained `engine-error` attempts. [Later setup acknowledgements](agent50-issue25-mulligan-wait-handshakes-20261104.md) reached ordinary native actions in some arms and exposed a separate incorrect success-row accessor. The early errors are real evidence that a registered evaluation should support an **unknown physical deal**, provided the relevant result is always classified as **censored**.

The prior [v1 unconditional pair estimator](../../simulation/evaluation/agent3-marginal-coupled-field-delta.cjs) and [v2 complete-field gate](../../simulation/evaluation/agent3-attested-marginal-field-delta.cjs) required nonempty/64-character physical source fingerprints for *every* arm, even for a censored pre-setup abort. This was incompatible with the rule to retain **all registered attempts, including failures before the opening**. Fabricating a fingerprint or deleting the failed pair would be unsound.

## Applied conservative correction

Both CJS interfaces now distinguish three different physical-opening categories: verified matching fingerprints, verified differing fingerprints and **unknown because at least one arm was censored before fingerprint capture**. The latter increments the new `unknownSourceOpenings` counter, and the pair remains in `registeredPairs` and `censoredPairs`. It contributes its original sharp binary uncertainty interval to the *unchanged* Hoeffding construction.

- A `null` source fingerprint is permitted **only** when that same arm's outcome status is explicitly `CENSORED`. `undefined`, absent, empty or malformed fingerprints still fail. A qualified win/nonwin still requires the original evidenced source digest.
- The attested complete-field gate also permits `null` actual first-turn seat **only for a censored arm** that failed before first-turn choice. It increments `actualFirstTurnUnknownPairs`; it never labels an unknown start as physically matched or mismatched. If actual first-turn seat is observed in a registered balanced-start cell, it must agree with the registered seat.
- Candidate physical seats, original source rank and 60 hash, registered seed-block IDs, frozen candidate/policy/vendor and crosswalk identities, all registered rounds and the complete 32-rank cell cross-product still need their independent design evidence. This correction cannot manufacture a missing original source or certify an unknown physical setup.
- Missing physical fingerprint and missing first-turn choice are **observability states**, not extra opportunities for stronger claims. A predeal error cannot become a qualified win through this schema change.

## Regression witnesses

The added pure tests cover null single-arm and two-arm predeal censoring, preserved registered denominator and `unknownSourceOpenings` counts, correctly widened interval lower bound, unknown observed first turn in a balanced design, and rejection of `null` or missing source/start metadata for otherwise qualified outcomes.

For example, a deliberately synthetic 32-cell, 2-round example contains **64 registered pairs**, with 62 fully observed (+1) results, one censored reference arm paired with a qualified win and one double-censored pair. Its sharp observed comparison interval is **[61/64, 1]**. The two uncertain pairs remain registered and never count as known matching or differing physical openings. The extended 64-cell, 2-round complete-field example contains 128 pairs and retains one predeal censored arm, still producing `competitiveQualified:false`. These are algebraic fixtures, **not Aichi win estimates**.

Regression files: [marginal comparator](../../tests/agent3-marginal-coupled-field-delta.test.cjs), [attested complete-field gate](../../tests/agent3-attested-marginal-field-delta.test.cjs). The corrected manual-only Agent3 smoke replay **[CI 41768878508](https://github.com/FlareZ123/experiment-01/actions/runs/41768878508) passed** on the actual shared repository head (all 115 pure tests passed; compiled Twinleaf native job intentionally skipped). The first replay [CI 41768779766](https://github.com/FlareZ123/experiment-01/actions/runs/41768779766) correctly rejected an *invalid synthetic fixture* in which a `null` reference fingerprint still had `QUALIFIED_NONWIN`; the fixture was corrected to `CENSORED` and its lower bound widened appropriately. The production rejection gate was functioning correctly.

## Integration and scientific limits

The real selected bilateral runner must map **an abort before physical setup to a censored attempt with unknown fields**, rather than inventing SHA values, silently ignoring the attempt, or asserting a fully matched setup. If an engine status is `native terminal` without independent paper, policy, clock and opponent competence certification, it remains censored for competitive estimation. Historical rows with bad field accessors must be re-audited from raw actual Store evidence.

This method cannot validate the underlying sampler's uniform independent marginals. The [native 48-group original source setup study](agent3-native-marginal-opening-coupling-20261104.md) already showed physically different source openings in five registered groups, because of candidate-dependent bonus draw counts. That remains a *known difference*, distinct from this newly representable **unknown** case. The [full-field structural gate](agent3-complete-field-structural-admission-20261104.md) still requires every authenticated rank and both seats before its result is decision-eligible.

**Agent 3**
