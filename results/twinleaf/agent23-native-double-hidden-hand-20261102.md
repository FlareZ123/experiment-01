# Agent 23: pinned native two-card opponent hand/deck replay, 2 November 2026

## Scope and preregistered mechanical question

Can the existing native bounded concealed-world diagnostic execute actual two-card
opponent hand/deck counterfactuals under strict same-root policy RNG-tape parity,
after the 1 November `fingerprint` temporal-dead-zone fix and
unique-resulting-hand-composition selection revision?

**This is a retrospective developmental check of four fixed historical game
roots. It is not an experiment on competitive win rate or a certification of
information-set safety.**

Source: [compiled manual GitHub Actions run 41419427578](https://github.com/FlareZ123/experiment-01/actions/runs/41419427578),
head `d338b824e94b73218d222721cd7ca8e5e9c00163`,
original JSON artifact `13129641132`, ZIP SHA256
`b8de0edf0a0f32bce0173408152c8ec6d9f3488e2029f5c1ca27050a485d931e`.
Existing manually dispatched
`.github/workflows/twinleaf-hidden-information.yml`, with
`agent23_native_opponent_hand_tape=true`,
`agent23_native_bounded_opponent_hand_tape=true`, and
`agent23_native_bounded_double_swap=true`.
Other native finite-scored-root flags remained false.
Pinned Twinleaf submodule revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`
(as recorded in the shared historical protocol).

## Compiled original-Store evidence

The workflow successfully compiled the pinned engine and passed the historical
Store-control gate: **4/4 original game controls** had matched control/probe
playback, source deal and accepted root ledger. The genuine original source
player was not tested in a source-first opening in this specific cohort.

| Frozen source rank and candidate | Eligible disjoint physical paths | Eligible distinct resulting hand multisets | Paths attempted / successfully replayed | Distinct resulting hand multisets successfully replayed | Changed actions |
| --- | ---: | ---: | ---: | ---: | ---: |
| Rank 6, champion reference | 10,589 | 2,198 | 16 / 16 | 15 | 0 |
| Rank 6, New Moon Lockbreaker v1 | 10,589 | 2,198 | 16 / 16 | 15 | 0 |
| Rank 11, champion reference | 3,854 | 696 | 16 / 16 | 16 | 0 |
| Rank 11, New Moon Lockbreaker v1 | 9,803 | 1,040 | 16 / 16 | 15 | 0 |
| **Total, counted separately per historical arm** | **34,835** | **6,132** | **64 / 64** | **61** | **0** |

Every tested world used **two disjoint hand/deck card-instance exchanges** in a
detached State, preserved the complete opponent concealed inventory, preserved
the owner-visible current observation, and consumed the authentic recorded RNG
tape to completion under the same policy callback. Every original physical
source State was unchanged. There were **zero scan failures** and zero native
exceptions in the four selected comparison roots.

### What the results do and do not show

This establishes that the previously introduced source-level TDZ bug does not
prevent native bounded hand/deck execution on these roots and current code.
The 0/64 action-change observation applies strictly to the 61 sampled
alternative concealed hand compositions under the reported policy and
historical starts. The tested worlds are deliberately selected for diversity,
so they are not 64 independent draws from a calibrated hidden-state posterior.

The **34,835** eligible number counts disjoint physical exchange paths,
including many paths mapping to the same resulting concealed hand printing
multiset. The **6,132** counts are per-arm distinct possible resulting
hand-printing compositions under exactly two disjoint exchanges, not an
exhaustive set of opponent information sets. Neither hidden revealed-card
history nor owner K0/K1 provenance is certified here. Candidate choices in
these roots also lacked any demonstrated two-player competitive competence.
All historical engine terminals remain **competitively unqualified**, the
paper game clock is unmodeled, original source ranks 23/25/28 are missing,
and a 99.5% win rate is wholly unsupported.

## CI reliability follow-up

The previous historical native-control acceptance check only verified that
actual Store control/probe games remained unchanged. A broken concealed-world
scanner could produce all zero successful worlds yet leave that coarse gate
green. Agent 23 added
`simulation/evaluation/agent23-native-hidden-contrast-gate.cjs` plus
`tests/agent23-native-hidden-contrast-gate.test.cjs` and wired it only to
the bounded mode of the existing **manual-only** hidden-information workflow.
It rejects absent scan packets, zero successful native counterfactuals,
broken source equality, inconsistent attempted/success/failure counts,
silent playback errors, and incorrectly reused `prizes` versus `deck`
or one- versus two-swap receipts. Expected eligibility zero in an individual
arm is allowed when another arm contains actual native exercise. This gate
certifies **diagnostic execution only**.

The new CI gate's integrated native verification is documented separately
upon its follow-up run; the earlier run 41419427578 predates this CI edit.

## Highest-value next issue

The first genuinely **finite-scored** native roots were previously observed
to fail strict same-world RNG parity in three of four frozen arms, because
reconstructed scoring consumed a different tape than the original bot.
A successful source decision cannot be labeled information-set invariant
until its scoring and exact same-root replay match. Inspect the current
first-finite-root branch and the actual divergence before broadening concealed
world coverage or ranking candidate decks.

The shared objective remains **one unmodified legal 60 against all 32 original
opponents**, with 29 original opposing 60s authenticated and zero
competitively qualified games.
