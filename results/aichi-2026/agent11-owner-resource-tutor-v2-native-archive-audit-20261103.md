# Agent 11: corrected native tutor v2 archive audit (3 November 2026)
> **Follow-up correction from read-only pinned native replay, 3 November 2026:** The original 17-action gain **had zero observed attack payoff**. Across all 28 nonerror arms, the 32 control and 49 treatment source-rank-11 attacks (81 total) were **Mega Absol ex's Terminal Period against zero-damage-counter targets**. The provided paper card text requires *exactly six damage counters* on the opposing Active for its knockout effect. All 81 attacks therefore failed the printed condition. Seventy-six real Store effects settled without Prize or target-damage changes; five attack prompts were cut off by the 90-action cap. The replay's **all 32 arm statuses, root ledgers, true initial physical deal fingerprints, first turns and tutor audits were byte-equivalent as JSON values** to the original frozen v2 output. [Replay CI 41700535747](https://github.com/FlareZ123/experiment-01/actions/runs/41700535747), [replay artifact 13262339861](https://github.com/FlareZ123/experiment-01/actions/runs/41700535747/artifacts/13262339861), ZIP SHA256 `e923a3aad1662e169554c1d24ed43b222e12901bc4c63593a1014902d942a3e9`. **These are demonstrably zero-payoff attacks, and the initial attack-count gain must not be used as tactical progress evidence.**

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

## Second independent replay: already-payable Claw and untapped owner-hand decisions

[Read-only owner-hand replay CI 41702514462](https://github.com/FlareZ123/experiment-01/actions/runs/41702514462) completed successfully from source head `3d0efe5d93b450ba3aaeff512cb2b941d5a1e366` with [artifact 13264916087](https://github.com/FlareZ123/experiment-01/actions/runs/41702514462/artifacts/13264916087), ZIP SHA256 `60bf0503ca7b903e9fdbba455a1e97c4c1e66f49d5f8c2d3fb470b46717068a8`. All **32/32** old-vs-replay arm statuses, original physical-deal digests, `rootActionLedgerSha`, `decisionTraceSha`, first-turn seats and tutor audits matched exactly. The additional owner-only decision-hand postgame observations were not inputs to either actor.

The archived source rank11 `Terminal Period` entries can be split by actual **public basic Darkness Energy attached to the Active Mega Absol** immediately before each attack. The alternate exact printed `Claw of Darkness` costs `Darkness, Darkness, Colorless` and does 200 printed damage. Three or more attached basic Darkness pay that printed cost; modifiers, locks and Store effects remain to be checked by the genuine game rules.

| Original rank11 physical attack root | Historical control | Resource-tutor selected |
| --- | ---: | ---: |
| Terminal Period with only **2** Darkness Energy | 10 | 17 |
| Terminal Period with **3 or more** Darkness Energy | **22** | **32** |
| Total Terminal Period roots at undamaged target | **32** | **49** |
| Nominally payable 200-damage Claw ignored | **22** | **32** |
| Owner hand also held at least one Carmine/Marnie/Guzma | **31** | **45** |

**54/81** source rank11 roots therefore used a demonstrably conditional-no-op `Terminal Period` **despite satisfying Claw's printed Energy cost**. This demonstrates a severe attack-selection problem independent of the two-Energy funding deficit in the other 27. In both high-attack-count matched cases at rank5 seat1, source rank11 acquired its third Darkness Energy on turn 9 or turn 13 and still repeatedly selected Terminal Period: seed `11312103` had **5/8** and seed `11312108` **4/9** such already-funded no-op attack choices. The other source-hand Supporters are observed opportunities, **not** certified currently legal or strategically preferable actions.

This failure already has a partial **default-off remedy** in the shared `simulation/twinleaf/agent1-actor-dead-first-attack-frontier.cjs` and `knownDeadAttackRoot` option in `simulation/twinleaf/agent34-actor-only-root-policy.cjs`. More importantly, Agent50 independently executed a **preregistered, fresh, both-seat 32-attempt original rank11 source study** [CI 41340503240](https://github.com/FlareZ123/experiment-01/actions/runs/41340503240), [full report](agent50-preregistered-rank11-symmetric-known-dead-20261101.md): repairing known-dead attack choice increased original source native engine wins from **5 to 10** across **16 dependent identical-deal candidate comparisons**, with **zero paper-qualified games**. That existing work establishes a stronger prospective causal sensitivity than re-running this single effect correction on our retrospectively observed 32 tutor arms. Avoid redundant recapitulation. The *unresolved interaction* is whether actual owner Trainer access, paid Energy setup and a symmetric, condition-aware attack chooser jointly improve **paper-valid source and opponent line completion** across the field.

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

Seeds `11312102` and `11312105` at rank-5 seat 1 are **excluded from this table**, since both arms in each pair failed natively. There are **8/14 matched pairs with changed root-action ledgers**; among them **two pairs** display an increase in rank-11 `AttackAction` dispatches from 0 to 8 and 0 to 9. Both increases occurred with three accepted tutors. These are native action-count regressions, and the later paper-text plus read-only Store replay established that **all 17 extra Terminal Period attacks had zero payoff**. No attack damage, Prize gain, opponent strategy, or complete game is certified.

**Severe opponent-policy limitation:** Across **all 28 nonerror native arms**, the original rank-5 seat had **zero recorded `AttackAction` actions**. Rank-11's apparent improvement therefore occurs against an opponent with no recorded attacking reply in these capped traces. The result is unsuitable as a source-vs-contender strength estimate, even if later instrumentation confirms the rank-11 attacks' damage.

## Specific follow-through and next gate

1. Reuse the **frozen registered physical source deals** `11312103` and `11312108`, with rank 5 in seat 1, as two **negative, zero-payoff attack-selection regression cases**. Require source attack selection to recognize Terminal Period's exactly-six-damage-counters condition, compare genuinely executable Claw of Darkness or setup alternatives, and record actual damage/Prize effects and a **meaningful rank-5 reply** before prospective tests.
2. Investigate the underlying `NO_BENCH_SLOTS_AVAILABLE` `AttackAction` failures and retain failed arms, rather than suppressing them or substituting new seeds after outcomes are known.
3. Integrate tutor candidates with a **generic paper-affordable competing-Train​​er frontier**, rather than declaring the last-chance after-Pass override a released policy. Specifically, compare a tutor's proposed root against active search, attachment, lock, gust, and setup channels. Agent27's [owner-hand payment frontier](agent27-original-field-trainer-payment-frontier-20261103.md) is relevant for future discard-requiring Item alternatives.
4. Freeze and select one symmetric release with exact per-decision opportunity accounting, independent paper checks, and matched source deals before field work. No final fixed 60 or 99.5% performance claim is supported.

**Interpretation:** Corrected native fullName handling moved the experiment beyond the prior v1 false-negative test fixture: genuine same-Store Item and search effects now exist. The read-only effect replay falsifies any attack-count benefit: all observed Terminal Period attacks faced undamaged targets and did nothing. The measured bottlenecks include conditional attack choice, opponent competence, full paper mechanics and clock admission.
