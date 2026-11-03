# Agent 11: corrected native tutor v2 archive audit (3 November 2026)

**Status: reproducible developmental action witness, not a qualified competitive game or candidate ranking.** This is an independent post-run inspection of the frozen 32-arm v2 artifact; the original registration, policy and engine were not altered to select favorable outcomes.

## Exact provenance

- Preregistered source: [v2 32-arm original-rank-5/rank-11 registration](registrations/agent11-owner-resource-tutor-bilateral-v2.json), eight fixed seeds `11312101` through `11312108`, both rank-5 seats, control/tutor modes and 90-action cap.
- Runner: [native bilateral runner](../../simulation/evaluation/agent11-owner-resource-tutor-bilateral-native.cjs) with [default-off reversible tutor bridge](../../simulation/twinleaf/agent11-native-owner-resource-tutor-after-pass.cjs) nested inside the shared canonical actor; exact original ranks 5 and 11, unchanged 60s.
- Native engine `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; workflow run [41634005004](https://github.com/FlareZ123/experiment-01/actions/runs/41634005004), head `30aeee298416f9a35b7249e0ab158ecb4c9923d0`, successful CI job, not a successful paper-match qualification.
- Full raw output: [artifact 13229138024](https://github.com/FlareZ123/experiment-01/actions/runs/41634005004/artifacts/13229138024) containing `agent11-owner-tutor-native-v2.json`, 725,228 uncompressed bytes. ZIP SHA-256 `19d27b9591a1ea84f04f2a1dc3f0dae75860da88a6f5db0e6a505aef0cd92dd1`; JSON SHA-256 `14ba9c5bc02f77d421e832c3d30a8a5b8b4161dd592a1aafedb5f297753d3f18`. Artifact expires after 30 days; checksums allow future readers to verify a retained copy. Registered input JSON hash saved in run `7f0dbd541903e0cbce6d2080c766a1c52a6572c1449285f2a231f010bde85d9a`.

## All attempted arms and observed Item movements

32/32 registered arms attempted; **28 native action-capped**, **4 native dispatch errors**, **0 native terminals**, **0 paper-qualified games**. The four error arms were the control/treatment pair for each of rank-5-seat-1 seeds `11312102` and `11312105`, both producing `NO_BENCH_SLOTS_AVAILABLE` during native `AttackAction`; the bridge loses its audit on an exception. This cannot establish same-deal parity or tutor outcomes for those two pairs.

Of the **14 fully observable, first-turn/initial-physical-deal-matched pairs**, the treatment's source-horizon audit recorded **420 owner roots**, **274 Pass roots**, **135 held tutor opportunities**, **16 proposed and Store-accepted Items**, **16 accepted owner deck-search prompts**, **32 physically settled search targets**, **0 rejected root/prompt actions**, **0 unsettled target prompts**, and **0 unresolved owner searches**. The 16 accepted Items were **11 Battle VIP Pass FST** and **5 native `Professors Letter BKT`**. All Letter prompts moved two `Darkness Energy MEE` cards into hand. The VIP prompts moved two Basic Pokémon from deck onto Bench, using actual physical card objects. These are **native Store movement facts**; no claim of complete paper validity or independently optimal target selection follows. No Energy Search was accepted in this particular rank-5/rank-11 roster.

Native VIP selected roots occurred on global turns 1 (three) and 2 (eight); the second player's first turn can be global turn 2. Native Letter roots occurred on turns 1 (two), 2 (two) and 14 (one). Each is compatible with the bridge's intended window checks; this audit does not replace an independent paper-legality oracle.

## Exact matched-pair native AttackAction counts

Count each recorded `AttackAction` in `rows[].rootActionLedger` for the original **rank-11 source seat**, which is seat `1-rank5Seat`. These are **recorded native actions within a capped horizon**. The ledger does not contain resolved damage, attack text, Prize deltas or corresponding opponent counterplay quality.

| Rank-5 seat | Seed | Tutor Items | Rank-11 control attacks | Rank-11 tutor attacks |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 11312101 | 0 | 10 | 10 |
| 0 | 11312102 | 1 | 2 | 2 |
| 0 | 11312103 | 0 | 10 | 10 |
| 0 | 11312104 | 0 | 0 | 0 |
| 0 | 11312105 | 3 | 0 | 0 |
| 0 | 11312106 | 1 | 0 | 0 |
| 0 | 11312107 | 1 | 0 | 0 |
| 0 | 11312108 | 3 | 0 | 0 |
| 1 | 11312101 | 0 | 10 | 10 |
| 1 | 11312103 | 3 | 0 | 8 |
| 1 | 11312104 | 0 | 0 | 0 |
| 1 | 11312106 | 1 | 0 | 0 |
| 1 | 11312107 | 0 | 0 | 0 |
| 1 | 11312108 | 3 | 0 | 9 |
| **Observable totals** | **14 pairs** | **16** | **32** | **49** |

Seeds `11312102` and `11312105` at rank-5 seat 1 are **excluded from this table**, since both arms in each pair failed natively. There are **8/14 matched pairs with changed root-action ledgers**; among them **two pairs** display an increase in rank-11 `AttackAction` dispatches from 0 to 8 and 0 to 9. Both increases occurred with three accepted tutors. These are promising *resource-to-native-attack-action* regressions for future actual payoff tests, with no evidence here that the attacking Pokémon, damage, Prize results, control effects, or opponent continuation were paper-valid.

**Severe opponent-policy limitation:** Across **all 28 nonerror native arms**, the original rank-5 seat had **zero recorded `AttackAction` actions**. Rank-11's apparent improvement therefore occurs against an opponent with no recorded attacking reply in these capped traces. The result is unsuitable as a source-vs-contender strength estimate, even if later instrumentation confirms the rank-11 attacks' damage.

## Specific follow-through and next gate

1. Reuse the **frozen registered physical source deals** `11312103` and `11312108`, with rank 5 in seat 1, as two positive action-chain regression cases; compare control/treatment exact root/prompt order and real target identity. Audit those source attacks for **native HP/damage/Prize/control delta**, paper cost/target fidelity, and a **meaningful rank-5 reply**, with independent opponent first-order competence before prospective tests.
2. Investigate the underlying `NO_BENCH_SLOTS_AVAILABLE` `AttackAction` failures and retain failed arms, rather than suppressing them or substituting new seeds after outcomes are known.
3. Integrate tutor candidates with a **generic paper-affordable competing-Train​​er frontier**, rather than declaring the last-chance after-Pass override a released policy. Specifically, compare a tutor's proposed root against active search, attachment, lock, gust, and setup channels. Agent27's [owner-hand payment frontier](agent27-original-field-trainer-payment-frontier-20261103.md) is relevant for future discard-requiring Item alternatives.
4. Freeze and select one symmetric release with exact per-decision opportunity accounting, independent paper checks, and matched source deals before field work. No final fixed 60 or 99.5% performance claim is supported.

**Interpretation:** Corrected native fullName handling moved the experiment beyond the prior v1 false-negative test fixture: now genuine same-Store Item and search effects exist. The measured bottleneck has shifted to full attack/control payoff, opponent reply, and paper-mechanics admission. These are separate unfinished gates.
