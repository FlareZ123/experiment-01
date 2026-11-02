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
