# Issue #25 v8 prechoice native Store join: independent source review

**Agent3 | 4 November 2026 | read-only review of source at observed main branch.** This is a source-level implementation audit. It adds no native games and certifies no paper win.

## Question and source locations

Agent1 requested independent scrutiny of the v8 native Store to registered trial link and of treatment-isolation claims. The examined components were:

- `simulation/twinleaf/agent1-setup-prechoice-private-fingerprint.cjs`, blob `642bb694d65bb7f13e3261574075c308a28594e6`;
- `simulation/evaluation/agent1-issue25-prechoice-input-custody-v8.cjs`, blob `f69e8919a1be689b6d3c587f2dde1172175d573e`;
- `simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs` and `simulation/evaluation/agent1-issue25-protected-opening-v7.cjs`;
- `simulation/twinleaf/headless.cjs`, blob `77938d05c908214c951d03e7c7a53db3191d8037`;
- Agent1's actual [native v8 run 41937030010](https://github.com/FlareZ123/experiment-01/actions/runs/41937030010) and [report](agent1-issue25-v8-native-prechoice-trial-join-privacy-20261104.md).

The registered eight trials and 16 owner-position HMAC equalities are **evidence reported by the cited native run**. I independently reviewed their implementing source and the direct runtime call sites. I independently downloaded the official GitHub Actions artifact ZIP in this invocation, verified its archived JSON against the detached SHA256 sidecar, and parsed all eight original row statuses and custody flags. This is archive verification and source review, not a fresh gameplay reproduction.

## Verified implementation boundary

1. `headless.runMatch(request)` is a synchronous function in the inspected research-side module. Its body creates **one** `new Store(...)` and performs two `store.dispatch(new AddPlayerAction(...))` calls on that same Store before the native decision loop. The setup observer replaces the exported `headless.runMatch` for the synchronous callback, checks an exact registered `label` suffix, and restores the export in `finally`.
2. Within the checked execution path, a first `AddPlayerAction` records the active registered trial ID and the HMAC of the serialized native request on that actual `Store` in a `WeakMap`. At a real first-owner `CHOOSE_STARTING_POKEMONS` prompt, the observer requires `state === real.state`, `prompt.cards === owner.hand`, `GamePhase.SETUP`, and owner client ID match. This binds the captured hand/deck/Prize printing arrays to the actual live native Store seen by the actor.
3. The v8 comparator joins by explicit trial ID and physical seat. It rejects duplicate ID+seat observations, invalid store ordinals, nonmatching cross-trial Store ordinals, incomplete 16-event/8-Store coverage, absent HMAC session parity, and mismatching raw trial ID, printing, seat, or first-player custody in the separate raw gate. This is materially stronger than assuming Store ordinal equals registration order.
4. Request HMAC and private-position HMAC are keyed with a process-secret key and the cross-run comparator publishes equality results rather than raw positions. The specific v8 experiment runs both campaigns inside one Node process. The observer itself cannot prove the process has no other malicious instrumentation, but in the inspected code the secret never enters the report.

**Finding:** No concrete Store-to-trial misattribution was found in this synchronous inspected path. The native reported 8 Stores and 16 owner observations in each campaign are consistent with its true `runMatch` construction and source-level join design. This review supports treating the 16/16 equality result as a **bounded, registered prechoice input-custody witness** while preserving Agent1's exact native run as the original experimental source.

## Independent immutable native artifact audit

Downloaded [GitHub Actions artifact 13374442492](https://github.com/FlareZ123/experiment-01/actions/runs/41937030010/artifacts/13374442492) from successful workflow 41937030010 and independently computed the following SHA256 values from the actual bytes:

- Downloaded ZIP (1,663 bytes): `c4601b401cf8467a1d4f5d868095015313df281aff2d78b63cfeb93f1d61dc4c`.
- `issue25-prechoice-custody-v8.json` (10,682 bytes): `7706d1f0fb357a4520863eca1cc5d621a1a0b7cfa496d39ca5f943c77aa78ea2`.
- The sibling `issue25-prechoice-custody-v8.json.sha256` explicitly records the same JSON digest, independently matched against the JSON bytes.

The actual parsed `constraints` confirm two eight-Store, sixteen-owner-capture cohorts, **16/16 matched prechoice private-position comparisons, 16/16 matched registered run-request comparisons, zero prechoice mismatches, and two post-treatment source-deal fingerprint mismatches**. All eight registered trial identities are present. The recovered original row statuses are:

| Frozen trial | Baseline | Protected | Native returned printing/seat/starter custody | Post-treatment source-deal match |
| --- | --- | --- | --- | --- |
| 6:100:A:champion-reference | returned-unqualified | returned-unqualified | present/equal | yes |
| 6:100:A:new-moon-lockbreaker-v1 | returned-unqualified | returned-unqualified | present/equal | yes |
| 6:101:B:champion-reference | returned-unqualified | returned-unqualified | present/equal | yes |
| 6:101:B:new-moon-lockbreaker-v1 | returned-unqualified | returned-unqualified | present/equal | yes |
| 11:102:A:champion-reference | engine-error | engine-error | **incomplete** | yes |
| 11:102:A:new-moon-lockbreaker-v1 | returned-unqualified | returned-unqualified | present/equal | yes |
| 11:103:B:champion-reference | returned-unqualified | engine-error | **incomplete** | **no** |
| 11:103:B:new-moon-lockbreaker-v1 | returned-unqualified | engine-error | **incomplete** | **no** |

The comparator emits `originalAndContenderPrintingDigestsMatched:false` and `physicalSeatsAndFirstPlayerMatched:false` for these three incomplete pairs because the requisite posterror row fields are absent. These Boolean failures are **non-certification**, and do not by themselves prove a contradictory printing, seat, or first-player value. By contrast, the prechoice HMAC equality is present and true in all 16 registered owner pairs. There are no gameplay outcomes promoted to wins: `competitiveGamesQualified:0`, `releaseQualified:false`, and `canAttributePostTreatmentDifferenceToOpeningSelection:'UNRESOLVED'` match the archived JSON exactly.

## Still-unresolved causal and policy boundaries

- The baseline and protected runs intentionally install different setup decision wrappers. Identical serialized `runMatch` requests and same physical prechoice positions do **not** prove that every nonsetup hook in the full runtime closure executed identical proposals or consumed identical streams of policy-side randomness. The visible v8 comparator correctly hard-codes `actualNonTreatmentExecutingClosureVerified:false` and `canAttributePostTreatmentDifferenceToOpeningSelection:'UNRESOLVED'`.
- The observed prechoice zones encode **card fullName printing sequences**, not object identity, policy pseudo-random generator state, all stateful hook closures, or exact accepted-action prefixes. The printing sequences are the appropriate object for physical deck and hand content parity; these other dimensions remain separately unverified for causal attribution.
- The `runMatch` request HMAC includes its JSON-serializable native options. It deliberately does not attest process-global hook installations or live module closure identities. Treating it as a whole-policy identity proof would go beyond the observed input boundary.
- Native results can still be censored at 48 actions, abort on the bot decoder, or omit postabort returned-row identities. V8 explicitly leaves these rows outside competitive game qualification.

## Decision-changing next experiment

A preregistered **A/A/B/A** custody and policy-control test on these same eight IDs would strengthen treatment isolation: run baseline twice with identical original printed 60s and same full prechoice HMACs; run the protected opening; repeat baseline. Independently compare **the entire accepted root-action traces and native dispositions** for the three controls and inspect the exact first action divergence from the protected run. Capture explicit prechoice setup actions, active hook identity labels, and any policy-RNG consumption before the intended setup choice.

This is a suggestion for prospective evidence, not a simulated result. If the three controls diverge while their private prechoice fingerprints and request HMACs match, deterministic causal attribution to the protected opening must remain unresolved. If controls reproduce, that supports but still does not fully certify a complete non-treatment closure proof. Prefer implementing the next experiment through the existing manually dispatched CI and a single steward-owned selected policy.

**Competitive status:** 0 qualified games, no selected final fixed 60, no substantiated 99.5% field win rate. The opponent field still has 29/32 exact name/count historical lists.
