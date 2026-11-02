# Bounded owner-hand Plumeria payment conservation: identical native rank6 source deal, three selected plays withheld

**Agent 38 | 2 November 2026 | native developmental evidence | 0 competitively qualified games.**

## Research question

The previous exact native Plumeria payment census reported several expensive owner-hand payments. A rank6 Iron Thorns source implementation sometimes discarded **both held Speed Lightning Energy RCL** to remove one opponent Basic Psychic Energy MEE. The existing central same-root scorer was willing to choose native Plumeria over an otherwise terminal Pass if the opponent Active displayed at least two Energy, without considering the actual two-card payment. This investigation asks whether an owner-hand-only conservation veto can change real native decisions in the existing common chooser while preserving source and candidate initial deals and the original controller control ledger.

## Implementation in the shared common chooser

- `simulation/twinleaf/agent38-plumeria-cost-conservation.cjs` uses the same detached owner-hand printed-card counts and the existing `agent47-actor-hand-discard.cjs` 2-of-2 mandatory payment chooser; the grouped physical payment pairs come from the existing `agent4-plumeria-payment-menu.cjs`. It removes the physical Plumeria being played from the forecast hand. A candidate is **vetoed** if the predicted payment would use the last remaining copy of at least one printing. It also fails closed when the prompt menu is outside actor47's `<=18` remaining-card scope or physical indices have become stale.
- `simulation/twinleaf/agent41-same-root-proposal-choice.cjs` applies the new check only to the existing default-off `nativePlumeriaChoice` Pass-versus-Plumeria scorer, when `nativePlumeriaPaymentConservation` is explicitly enabled. Zero-extra-hand-cost Team Flare still scores above the paid Plumeria when both are held.
- `simulation/twinleaf/agent34-actor-only-root-policy.cjs` exposes `AGENT38_NATIVE_PLUMERIA_PAYMENT_CONSERVATION_DEV=true` to the existing two-seat actor and retains the effective flag in its own native root audit. Without this flag, previous scoring remains unchanged.

This veto is a strategically crude test. A printing can be legitimately expendable or actively desirable to discard in some archetypes. The observer does not score the future value of any retained card or prove that all synthetically enumerated payment choices match the native prompt. Only successful original Store settlement can establish that a chosen card was genuinely paid.

**Tests:** Both new pure regression files `tests/agent38-plumeria-cost-conservation.test.cjs` and `tests/agent38-plumeria-score-conservation.test.cjs` passed on Node 22, alongside the existing Agent41 Plumeria chooser tests, in [manual CI 41403237975](https://github.com/FlareZ123/experiment-01/actions/runs/41403237975). The first triggered regression CI 41403116469 revealed a stale expectation in the older Agent41 structural test: the proposer already supplies paymentTargets, so structural support was true. That test was corrected before the successful repeat. No existing default-on general policy was changed.

## Original Store native paired replay

An independent comparison script `simulation/evaluation/agent38-plumeria-cost-conservation-native-pair.cjs` invokes the existing exact frozen `agent41-rank6-native-plumeria-common-choice-pair.cjs` twice. The sole experimental difference is `AGENT38_NATIVE_PLUMERIA_PAYMENT_CONSERVATION_DEV=false` versus `true`. Each invocation itself runs original Plumeria-disabled control and original common Plumeria-enabled treatment, with two original candidate 60s; **eight native attempts in total**, four per flag setting. The rank6 source is the unchanged Aichi rank6 original 60, source seat **1**, seed **296638747**, original source physical deal SHA256 **`29db5b5feaf15b2eec86b19e7d1bbe46738f63ef8e479da9a22ecb46970a1dab`**. Both candidate comparisons share this *one* source seed. The two candidate 60s were champion-reference and new-moon-lockbreaker-v1. Twinleaf pin **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**.

The [native CI 41403709491](https://github.com/FlareZ123/experiment-01/actions/runs/41403709491) completed **SUCCESS**, checkout commit `5ecf624c9bdad68073c3ab6bd6abfc55a04ce069`. It verified all eight native attempts, equal source and full physical initial fingerprints within each off/on pair, exact root-level flag transition and unchanged Plumeria-disabled control root-action SHA256. The unmodified JSON is [artifact 13122353702](https://github.com/FlareZ123/experiment-01/actions/runs/41403709491/artifacts/13122353702), ZIP SHA256 **`6c596688245d697a3dda032ba6f8edf148a9ac880c29272ec0179b80ee464b28`**. The artifact was independently inspected and its one JSON file matched CI's compact summary.

| Original registered opponent | Flag OFF: genuinely accepted Plumeria / original two-card payments | Flag ON: accepted Plumeria | Same physical deal and original control ledger |
| --- | --- | ---: | --- |
| Champion reference | **1**, global T4: Crushing Hammer POR + Guzma BUS | **0** | Both verified |
| New Moon Lockbreaker v1 | **2**, global T52: Spiky Energy JTG + Double Colorless Energy SUM; T58: Capture Energy RCL + Speed Lightning Energy RCL | **0** | Both verified |
| **Total (correlated)** | **3** native paid Plumeria roots, all confirmed Energy-discard settlements | **0** | Both original pairings passed |

The flag-ON common owner changed its native root-action SHA256 for **both** candidate comparisons; the Plumeria-disabled control root ledger remained identical between OFF and ON. Accepted Plumeria dropped from three to zero in the compared bounded continuations. These are actual native interventions; this confirms action selection changes while preserving the starting deal and independent control baseline. It does not establish how valuable the conserved card printings were.

**Every one of the eight attempts ended censored** at the developmental action cap; there is no clock qualification, human-equivalent opponent policy, independently selected full Top32 population, or demonstrated game-winning improvement. The apparent reduction is *not* a population frequency: three events came from one retrospectively selected source seed and two related candidate continuations. It is inappropriate to treat this as a win-rate estimate.

## Independent next-step registration

To escape the one-seed retrospective selection bias, eight fresh uniform 32-bit seeds were generated via Python `secrets.randbelow(2**32)` at 2026-11-02T07:06:21Z and committed *before any native replay* to [fresh registration](registrations/agent38-plumeria-conservation-fresh-20261102.json), Git blob `6142a6bac7dcb3fc88eb135c38f60ed1d2083151`. Four source seed groups per physical candidate seat, two candidate 60s per seed, and two identical-deal policy arms define **32 future/ongoing original Store developmental attempts**. Every error, cap and successful original Store outcome must remain in the denominator. The preregistration precludes selectively changing seeds after observing results. The pure comparison and failure-closed tests live at `simulation/evaluation/agent38-prospective-plumeria-conservation-native.cjs` and `tests/agent38-prospective-plumeria-conservation-native.test.cjs`. This paragraph records the preregistered intention without asserting any unobserved result.

No existing candidate has demonstrated 99.5% against the 2026 Aichi Top32; the field remains **29/32 authenticated exact original opponent 60s** and **zero** competitively qualified games.

## Prospectively frozen eight-seed native results (07:10–07:13 UTC)

The committed registration `6142a6bac7dcb3fc88eb135c38f60ed1d2083151` was executed without changing any seed in [CI 41404571010](https://github.com/FlareZ123/experiment-01/actions/runs/41404571010) at checkout `c6831f95b2d1aec4dfa887e3b693dcc32bb62057`. This returned exactly **32 original Store attempts**, 16 same-physical-matchup pairs from 8 independently drawn source seed groups (four groups per candidate physical seat), and zero eligible games. The full original JSON is [artifact 13123335488](https://github.com/FlareZ123/experiment-01/actions/runs/41404571010/artifacts/13123335488), ZIP SHA256 `84aaab19cb81cbe828ce029aca6c77f5fd3b0b49084bb1b82cbf7f3c775b319f` (downloaded and independently inspected).

**Strict validation intentionally FAILED** because one originally preregistered pair, `6:0:B:new-moon-lockbreaker-v1`, threw identical `BLOCKED_BY_SPECIAL_CONDITION` on **AttackAction after native action 40** in both flag values. Its original Store exception lacked a full physical deal fingerprint, actor audit or observed source seat, so it cannot be counted among verified physical matchups. The runner preserved that exact pair as a failure instead of omitting or replacing its seed. In the other **15/16 pairs**, the entire starting physical deal fingerprints matched and the effective root policy toggle was witnessed. Eleven of those fifteen had source moving first and four had source moving second. All 16 registered trial IDs are retained, so the original 32-denominator still includes the failed source.

| Measurement | Flag OFF | Flag ON |
| --- | ---: | ---: |
| Native paid Plumeria with original Store settlement across 15 verified pairs | **24** | **13** |
| Engine-terminal statuses (still competitively unqualified) | 7 | 8 |
| Censored at action cap | 8 | 7 |
| Shared engine-error status (unverified pair) | 1 | 1 |
| Competitively qualified game outcomes | 0 | 0 |

**13 of 15 physically verified pairs exhibited a changed native action ledger**. In each of those 13, the first differing *public* action belonged to the rank6 source owner: original **PlayCardAction Plumeria**, conservation **PassTurnAction**. The other two had the same recorded public action sequence through the cap. The exact Native Plumeria acceptance-count difference was 0 for 7 pairs, 1 for 5 pairs and 2 for 3 pairs; an initially skipped Plumeria can be played later, making the net paid count an incomplete model of strategic value.

Native outcomes after this divergence were genuinely different, and the count of *engine terminals* increased by one in these 15 verified pairs. **Neither condition's engine winner is qualified as an estimate of competitive win rate** because the automatic policies remain development-grade, some games cap at 260 root actions, and the original Top32 field remains incomplete. An engine terminal is an execution status, not evidence of a better deck. All treatment action changes are isolated to original same-deal policies; different opponent candidate 60s do not share the same full physical initial deal merely because the source seed matches.

The failed `6:0:B:new-moon-lockbreaker-v1` pair is itself an actionable competence defect: `BLOCKED_BY_SPECIAL_CONDITION` at action 40. Both policies failed identically; the first root intervention cannot be adjudicated from the exception output. The previous numeric SpecialCondition actor-gate discrepancy was already repaired in shared policy before this replay, so attribution requires inspecting the actual dispatch source and native state. Avoid silently relabeling the failed pair as matched or discarding it from the denominator.

**Updated conclusion:** The last-held-printing heuristic demonstrably reduces native paid Plumeria and shifts its timing across independently drawn original source deals. There is no defensible claim yet that it improves winning chances. The strict validation failure is retained as a separate native policy blocker, and any repairs must be assessed against new separately preregistered independent seeds before tournament-performance claims.
