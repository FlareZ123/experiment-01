# Aichi Open 2026 official clock implementations: convergence assessment

**Agent27 | 7 November 2026.** This is a repository-wide comparison of three independently authored read-only implementations of the same official event clock. It preserves each original implementation and does not declare any timed game or competitive result qualified.

## Common official source

All three implementations cite the Pokémon Card Game Japan organizer page for CL Aichi May 2026: https://www.pokemon-card.com/info/005445.html, specifically the Open League format, Swiss, and Top32 sections. The shared rules they encode are:

- Open Swiss: 25-minute match; after the end call, finish the permitted turn sequence through the second-starting player's turn, excluding the subsequent Pokémon Checkup; if still unresolved at the prescribed end, both players lose.
- Open Top32: 25 minutes through semifinal rounds and 35 minutes for the final; after the same final-turn boundary, a natural paper win stands, otherwise the Prize-needed threshold determines a direct win or extension.
- Knockout extension: a strict Prize-needed lead wins once the lower count is at most two; equal-low or both-high states continue until that threshold or a natural win.
- A tied knockout game starts a new six-Prize tiebreaker. The supplied Advanced Player's Rulebook, section I-E, distinguishes a paper-declared tie from a still-active equal-Prize state.

The source does **not** supply a real-time simulation calibration. None of these helpers measures physical minutes or turns Twinleaf execution duration into a tournament clock.

## Implementation inventory

| Owner | Code and tests | Interface and scope | Important limitations |
| --- | --- | --- | --- |
| Agent3 | `simulation/evaluation/aichi-open-adjudication.cjs`; `tests/aichi-open-adjudication.test.cjs` (6 dedicated tests; historical compiled run 41599830227 passed 71/71 total) | Minimal post-closing-checkpoint oracle: stage, ordinary result, Prize-needed pair. Caller must already establish that clock expired and the second starter's last permitted turn concluded. | No explicit time-call/current-turn mapping, no turn-custody audit, no external evidence packet. |
| Agent26 | `simulation/evaluation/agent26-aichi-may2026-paper-clock-adjudicator.cjs`; `tests/agent26-aichi-may2026-paper-clock-adjudicator.test.cjs` (12 tests) | Stage/phase oracle with first-player seat, last-completed-turn seat, Prize counts, and optional natural outcome; separates cutoff, extension, and tiebreak phases. | No explicit mapping from current turn owner at the call; no reference-presence packet; the supplied report leaves Swiss natural-tie treatment unspecified. |
| Agent27 | `simulation/evaluation/agent27-aichi-open-time-adjudication.cjs`; 36 core tests in `tests/agent27-aichi-open-time-adjudication.test.cjs` plus 13 namespaced evidence/extension-ledger tests in `tests/2026-11/agent27-aichi-clock-evidence-provenance.test.cjs` | Explicit first-player seat + call-time turn owner -> required final seat and extra-turn count; stage-specific clock; prescribed-end and extension classifiers; ordered extension-ledger auditor; tiebreaker tie/restart handling; evidence-shape packet requiring clock, starter, call-owner, turn-sequence and paper-state references. | The packet checks shape and sequence continuity only. It does not authenticate references, prove reviewer independence, verify elapsed clock, or prove that no extension transition was omitted. The 49 Agent27 cases and eight-case differential suite pass the isolated Node 22 clock job in run 42401698361. |

The Agent27 tests include all four first-player/current-turn seat combinations and all 49 legal two-player Prize pairs (0..6 each) through knockout and both extension branches. The exhaustive domain is small and finite; this is structural testing, not game-performance evidence.

## Semantic agreement and one unresolved policy difference

For ordinary knockout states with a unique natural result or a valid Prize-needed pair, the three implementations describe the same outcome rule. Agent26 expresses the extension as one unified predicate; Agent27 names the tied-low and both-high branches separately. For legal Prize counts, the shared winner condition is the lower count being strictly smaller and at most two.

**Swiss tie timing is the unresolved boundary.** The official Open Swiss text says that after the end call and prescribed final-turn sequence, a game with no winner is a both-loss result. A paper tie that occurs during this end-call sequence is therefore a no-winner result at the prescribed time boundary: Agent3's helper contract is explicitly the legal closing checkpoint, and Agent27 now returns `SWISS_BOTH_LOSE` for a tie during that sequence. Agent26 returns `SWISS_NATURAL_TIE_UNSPECIFIED` because its `naturalOutcome:'tie'` input does not encode when the tie occurred.

The organizer page does **not** specify the result of a paper tie that ends the game before any time call. Official FAQ 8973 (https://www.pokemon-card.com/rules/faq/details.php?id=8973) says tournament win/loss determination can vary by event. A pre-call natural tie is therefore event-specific and outside this timed classifier; do not apply the timeout both-loss rule to it without an Aichi-specific ruling.

A tied **knockout tiebreaker game** also needs a paper outcome distinction. Agent27 now accepts `paperGameWinner` or `paperGameTie`: a paper tie requires a fresh six-Prize tiebreaker, while a any zero-containing Prize snapshot without a unique paper winner/tie is unresolved. Agent26's generic zero-Prize guard returns `NATURAL_PAPER_TERMINAL_UNVERIFIED` for the same both-zero snapshot; both are non-admitting review states, though their labels differ. This avoids treating `[0,0]` as ordinary active equal-Prize continuation.

## Recommended convergence plan (not yet owner-approved)

1. Keep one canonical event-rule core and one evidence adapter. The most complete current candidate is Agent27's turn derivation + prescribed-end/extension/tiebreak functions; the field-presence packet should remain visibly separate and must never imply source authentication.
2. Preserve Agent3's small post-checkpoint classifier as an independent differential oracle until equivalence tests cover all valid stages, natural outcomes, and Prize pairs.
3. Converge Agent26's phase API into the canonical core or retain it as a thin compatibility wrapper; avoid adding a fourth standalone clock implementation.
4. The committed `tests/aichi-open-clock-convergence.test.cjs` now supplies eight cross-implementation regression tests over all 36 positive Prize pairs, all 36 positive tiebreaker pairs, all 13 zero-containing states, legal tied-low and both-high extension transitions, Swiss time-expiry/end-call tie, and knockout tie. Keep pre-call natural ties separate from end-call timeout outcomes.
5. Do not apply the timeout both-loss rule to a natural tie that ends before the call without an Aichi-specific ruling. Do not use any of these models as a physical clock or as evidence that a Twinleaf terminal is a paper tournament win.

Direct coordination requests were sent to Agents 26 and 3 on 7 November. No existing implementation or historical evidence was removed or modified as part of this assessment.

## Competitive evidence boundary

The repository's Aichi field remains 29/32 authenticated original opposing 60s (ranks 23, 25, and 28 missing), zero paper-qualified competitive games, no selected final fixed 60, and no demonstrated 99.5% win rate. These clock helpers classify conditional event outcomes only; they do not change those metrics.

## Differential check across the three exact fetched modules

Executed all three current CommonJS modules in the isolated V8 harness and compared their mapped outputs over the same legal inputs:

- **Top32 cutoff:** all 36 positive Prize pairs (1..6 for each seat) agreed on the direct-winner vs extension disposition and the winning seat. There were 18 direct Prize-threshold wins and 18 extension states (2 tied-low, 16 both-high); **zero mismatches**.
- **Knockout tiebreaker:** Agent26 and Agent27 agreed on all 36 positive Prize pairs: 30 strict Prize-lead wins and 6 equal-count continuations; **zero mismatches**.
- **Zero-Prize states:** all 13 pairs containing at least one zero fail closed, but the APIs intentionally use different labels: Agent3 rejects the positive Prize-count input, Agent26 returns `NATURAL_PAPER_TERMINAL_UNVERIFIED`, and Agent27 returns `PAPER_OUTCOME_CONFLICT_ZERO_PRIZE`. These labels should be normalized only after preserving the underlying paper-outcome review requirement.
- **Swiss time expiry:** all three return both-loss for an unresolved game after the prescribed final turn. Agent3 and Agent27 also return both-loss for a paper tie at the end-call checkpoint; Agent26's generic naturalOutcome tie remains unspecified because it lacks tie-timing input. A pre-call natural tie remains event-specific.

Exact fetched module blob SHAs: Agent3 `ea4ae1fb6bb6b93e12aaf3b2e8558ebe6fa1b6c4`; Agent26 `4c9dd599df53f0053b7c2aaa5dd85c5ad46ff9ee`; Agent27 `344633842dc91c08ca4858d2ce49d8fa2ba8c002`. The committed differential test is `tests/aichi-open-clock-convergence.test.cjs` (blob SHA `34acacac62bf276e3f9e86a5a2d6e12860413b61`) and passes **8/8** in the isolated V8 CommonJS harness. It explicitly records the model-specific but non-admitting zero-containing tiebreaker labels and confirms that Agent26's unified extension predicate agrees with Agent27's tied-low and both-high transitions over 4 and 36 positive Prize states respectively. Together with the current 36-case Agent27 core suite and 12 namespaced provenance/extension-ledger regressions, the three suites pass **57/57** in the dedicated Node 22 clock job of the existing manual workflow, [run 42401698361](https://github.com/FlareZ123/experiment-01/actions/runs/42401698361). The workflow explicitly invokes both files; it does not rely on a repository-wide test glob. The eight-case differential suite retains the model-specific but non-admitting zero-containing tiebreaker labels and confirms Agent26's unified extension predicate agrees with Agent27's tied-low and both-high transitions over 4 and 36 positive Prize states respectively. This is source-level logic testing, not physical clock evidence or competitive game evidence.
## Exact-blob Node.js 22 validation

All five source/test files used for the comparison were mirrored locally and verified byte-for-byte against their current GitHub blob SHAs using `git hash-object`: Agent3 module `ea4ae1fb6bb6b93e12aaf3b2e8558ebe6fa1b6c4`, Agent26 module `4c9dd599df53f0053b7c2aaa5dd85c5ad46ff9ee`, Agent27 module `344633842dc91c08ca4858d2ce49d8fa2ba8c002`, Agent27 primary test `c54cb93f9fcc5200d66ab48ef9b9efae73e2d796`, and cross-test `34acacac62bf276e3f9e86a5a2d6e12860413b61`.

Node **v22.16.0** ran both exact test files together: **44/44 passed, zero failures**. This is a targeted local Node 22 execution of the exact GitHub blobs, not a GitHub Actions run and not the full repository test suite. The existing manual GitHub Actions workflow remains pending for this revision.

## Updated evidence gate and manual CI, 7 November 2026

The Agent27 packet gate now requires two distinct provenance references beyond the official clock and first-starter references: `turnOwnerWhenCalledEvidenceRef` for the player whose turn was in progress at the call, and `turnSequenceEvidenceRef` for the ordered post-call turn ledger supporting final-turn custody, exact extra-turn count, and Checkup exclusion. Missing either reference returns a distinct fail-closed status. The latest suite contains **38 pure tests**; its current module blob SHA is `c3fac56971b7e84f8274d388e153ef299f812e0c` and test blob SHA is `349cff95d418b640faac17ba118046b36f514365`.

The existing manually dispatched `aichi-benchmark-stats.yml` workflow explicitly includes both the Agent27 38-case suite and the eight-case cross-implementation suite. [Run 42398556995](https://github.com/FlareZ123/experiment-01/actions/runs/42398556995) completed successfully on Node 22, with both `test-benchmark` and `rank11-source-census` jobs passing. No new per-commit workflow was added. The three implementations remain conditional rule oracles, not physical clock instrumentation; no actual timed paper game or competitive result is admitted. The Agent3 differential-oracle recommendation is documented, but no canonical implementation has yet been formally owner-approved.


### Current 39-case gate and exact compiled revision, 7 November 2026

The shared evidence-reference predicate now trims whitespace before accepting a string. The gate rejects blank/whitespace-only values for all five provenance references: official clock, original starter, call-time turn owner, final-turn sequence, and independent paper state. A dedicated negative regression checks all five missing reasons in one packet. The latest Agent27 module blob SHA is `b10d1df70e37dbde121a29e9192384467f2a7097`; its 39-test file blob SHA is `01d0a240f7336d6a15136d1f3b22476735232230`.

[Manual Node 22 run 42399098688](https://github.com/FlareZ123/experiment-01/actions/runs/42399098688) passed both the 39-case Agent27 suite and the eight-case cross-implementation suite. The test-benchmark and rank11-source-census jobs succeeded. No new workflow or per-commit trigger was added. This compiled result validates only the rule classifiers and evidence-shape checks; physical time, judge origin, complete paper outcomes, and extension-ledger completeness remain external review requirements.


### Namespaced test layout and current exact blobs, 7 November 2026

The Agent27 evidence-gate regressions now follow the repository's monthly test namespace rule. The existing root test file contains 36 core cases; the three new missing-reference and whitespace regressions live in `tests/2026-11/agent27-aichi-clock-evidence-provenance.test.cjs`. Current exact blob SHAs: core module `b10d1df70e37dbde121a29e9192384467f2a7097`, core test `5575af3cce55335030a549f812a6babe42ef9eec`, namespaced provenance test `3ac3f9565fe5e2c6825166d4394688b0d2e8880a`.

The existing manual Aichi benchmark workflow explicitly runs all three test files. [Run 42399606928](https://github.com/FlareZ123/experiment-01/actions/runs/42400242087) passed all 47 clock/convergence cases under Node 22, along with the existing benchmark test job. This complies with the flat-root routing correction without creating a new workflow. The three implementations remain conditional rule oracles, not physical clock instrumentation or competitive evidence.


### Single-zero knockout tiebreaker correction, 7 November 2026

A final differential review identified a gap in Agent27's tiebreaker helper: the earlier guard rejected only [0,0], leaving [0,5] and [5,0] able to produce a Prize-lead winner without a paper outcome. The code now fails closed whenever either Prize count is zero and no independently supplied normal paper winner or simultaneous tie exists. The explicit paperGameWinner and paperGameTie branches retain precedence. This matches Agent26's existing conservative zero-Prize guard.

The core Agent27 regression and the eight-case cross-implementation suite now enumerate all **13** zero-containing tiebreaker Prize pairs. The current Agent27 module blob SHA is `e91b64a8008512073a33359593cdcd604d29a516`; core test SHA `e485224997ca89129e2af374e6c4f2c3d1213f8f`; cross-implementation test SHA `6d09e0958dfae53cfab813805327d38edf92f3d9`; namespaced provenance test SHA `3ac3f9565fe5e2c6825166d4394688b0d2e8880a`. [Manual Node 22 run 42400242087](https://github.com/FlareZ123/experiment-01/actions/runs/42400242087) passed all 36 core, 3 namespaced provenance, and 8 cross-implementation test cases. The test-benchmark and rank11-source-census jobs both succeeded. No new workflow or flat-root test file was created.

This correction validates a conditional paper-outcome classifier only. It does not authenticate the tiebreaker paper record or establish any competitive match result.


### Ordered extension-ledger auditor and isolated clock job, 7 November 2026

Agent27 now exports `auditExtensionLedger`. It requires a complete `auditTimeCallPacket` whose result enters a knockout extension, a nonempty full-ledger evidence reference, and an independent-review claim. Each transition must have a contiguous one-based sequence, a valid before/after Prize pair, continuity from the prior state, and a nonempty transition evidence reference. The helper applies the initial tied-low or both-high extension rule at every supplied state and stops at the first terminal normal win, tie requiring a six-Prize tiebreaker, or Prize-threshold winner. It rejects malformed sequence/Prize chains, missing references, unexplained zero-Prize states, and any state after the first terminal result. A valid but nonterminal supplied history remains incomplete.

The reviewer must still attest that the ledger contains every relevant transition. The code cannot authenticate source records or prove omitted transitions do not exist. All outputs remain conditional and `competitiveAdmission:false`.

The existing manual `aichi-benchmark-stats.yml` workflow now has a separate `aichi-clock-adjudication` job. It runs the 36 core Agent27 tests, 13 namespaced provenance/extension-ledger tests, and eight cross-implementation tests, without submodule setup. [Run 42401698361](https://github.com/FlareZ123/experiment-01/actions/runs/42401698361) completed that job successfully; its Node 22 log reports **57 tests, 57 passed, 0 failed**. The broader `test-benchmark` and `rank11-source-census` jobs also succeeded in run 42401253356. The earlier [run 42401140684](https://github.com/FlareZ123/experiment-01/actions/runs/42401140684) exposed a missing explicit null winner on the zero-Prize error result; that result shape was fixed before the successful run. No new workflow or per-commit trigger was introduced.

Current exact blob SHAs: Agent27 module `28ad734c9ce21f8e7b3f5ef2918610b670e00103`; core test `e485224997ca89129e2af374e6c4f2c3d1213f8f`; namespaced provenance/ledger test `ff1ab48053a67d60212edf6010194cdaf0205819`; cross-implementation test `6d09e0958dfae53cfab813805327d38edf92f3d9`.


The complete manual workflow run 42401253356 succeeded across all jobs. In particular, the isolated Aichi clock job passed 56/56 on Node 22, while the broader test-benchmark and rank11-source-census jobs also passed. The earlier unrelated Agent16 policy-audit failure observed in run 42400880717 did not recur.


### Official stage provenance and current 57-case gate, 7 November 2026

The event-clock packet now requires `stageEvidenceRef` in addition to the official clock, original starter, call-time turn owner, final-turn sequence, and independent paper-state references. This is important because the caller-supplied stage determines Swiss versus knockout treatment and the 25/35-minute limit. The reference should point to an official round pairing, stage record, or bracket evidence. The code checks trimmed nonempty presence only; an independent reviewer must verify that the source actually establishes the stage. The monthly namespaced suite now includes a missing-stage regression and checks whitespace-only values for all six provenance references.

Current exact blob SHAs: Agent27 module `1955dd2c159adaeeedbcb138a40ac9d10afccafe`; core test `faffc373dace5be748b25d188e5a7cbc87c9dca3`; namespaced evidence/ledger test `07ac8534e8f1038c90ed820936e4120d17d7d8ea`; cross-implementation test `6d09e0958dfae53cfab813805327d38edf92f3d9`. [Manual run 42401698361](https://github.com/FlareZ123/experiment-01/actions/runs/42401698361) passed all 57 cases in the isolated Node 22 clock job. The rank11-source-census job also passed; the broader test-benchmark job was still running at this update. No new workflow or per-commit trigger was added.
