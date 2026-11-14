# First sanitized-only V3 native fixture: Quick Ball succeeds; actor-only admission fails

**Date:** 14 November 2026  
**Owner-authorized run:** [43544006054](https://github.com/FlareZ123/experiment-01/actions/runs/43544006054)  
**Sanitized artifact:** [14093202358](https://github.com/FlareZ123/experiment-01/actions/runs/43544006054/artifacts/14093202358)  
**Reviewed PR head:** `8cf313b6dcdc587b0824ca85abc1d9f1d5cdc0c4`

## Question

Did the first owner-authorized V3 fixture execute a complete native game, and did it satisfy the policy/diagnostic conditions needed to advance beyond a fixture?

## Frozen inputs and reproducibility

- Trial: `agent36-v3-fixture-hood-rank1-20261113-quick-ball-v1`.
- Candidate: Hood Shield Shadow Rider v1; candidate physical seat 0; printed-60 SHA-256 `1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924`.
- Opponent: original Aichi source rank 1 Shadow Rider; original source seat 1; printed-60 SHA-256 `159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090`.
- Candidate policy: `agent34-actor-only-root-slice-v17-agent49-quick-ball-source-bound-v1`, candidate-only `quickBallRoot:true`.
- Opponent policy: `agent36-fixture-rank1-opponent-agent34-baseline`, no Quick Ball opt-in.
- Registered seed label: `agent36-v3-fixture-hood-rank1-20261112-01`; actual uint32 seed `4065045654`.
- First player: physical seat 1 (the rank-1 opponent); candidate seat 0 went second.
- Twinleaf pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Research revision: `8cf313b6dcdc587b0824ca85abc1d9f1d5cdc0c4`.
- Node: `v22.16.0`; engine format/ruleset: Expanded; opponent source event format: Japanese Extra; format review status: `unverified-fixture-only`.
- Workflow: pinned Twinleaf compilation passed, the V3 contract suite passed **188/188**, and the native fixture-game step reached `engine-game-end`.
- Artifact ZIP SHA-256: `8c1f342e79066b568326655fa179a72f867b3ff4c40771a4b91f0ba09eba361d`.
- Sanitized JSON SHA-256: `3d8417bf671c79c99539a2d28b4cd57adc61812b050cad7ceb9e1d84cba4b87d`.
- Sanitized text SHA-256: `36e5da312fe750fee2c41a7373da7e526c423265c66a325320c60a47334cb60c`.

The artifact contains only `fixture-game.sanitized.json` and `fixture-game.sanitized.txt`; it contains no encrypted or raw full-state trace.

## Native outcome

- Finished: `true`; end reason: `engine-game-end`.
- Winner seat: **1 (rank-1 opponent)**.
- Duration: **25 turns**, **122 actions**; action counts by seat `[60, 62]`.
- The sanitized decision trace contains 122 records and 42 root decisions (22 candidate / 20 opponent); all 122 native dispatches succeeded.
- The candidate's turn-2 roots were, in order: Quick Ball FST (ordinal 11), Shadow Rider Calyrex V CRE (17), Psychic Energy SVE (18), and AttackAction (19). Each dispatch succeeded.

This is one fixed-seed fixture loss. It is not a paper-admitted matchup, an estimate of the rank-1 matchup, a field win-rate observation, or evidence for changing the candidate deck.

## Quick Ball physical-chain result

The sanitized physical audit reports:

| Receipt | Count |
|---|---:|
| Candidate Quick Ball roots accepted | 1 |
| Exact physical payment acceptances | 1 |
| Exact physical target retrievals | 1 |
| Physical Bench placements | 1 |
| Completed physical chains | 1 |
| Completed setup chains | 1 |
| Pending Bench placements at end | 0 |
| Rejected native replies | 0 |

The candidate's first turn after the opponent's opening turn used the exact Quick Ball FST root, followed by a successful Shadow Rider Calyrex V Bench placement, Psychic Energy attachment, and attack. **This fixture validates the integrated Quick Ball payment/search/Bench chain for this one seed and physical role.** It does not establish broader policy competence or general card support.

## Terminal sequence explanation

The last opponent root is an AttackAction by Tapu Lele-GX GRI. Its public actor observation lists Energy Drive: 20 damage times the Energy attached to both Active Pokémon. Tapu Lele-GX had three Psychic Energy; the candidate's Active Latias ex SSP had one Psychic Energy and 200 damage on 210 HP. The opponent had two Prizes remaining immediately before the attack. The terminal state is consistent with Energy Drive dealing 80 damage, Knocking Out Latias ex, and taking the final two Prizes. This is a trace-based explanation of the one fixture, not a strategic matchup conclusion.

One reporting caveat: the sanitized `finalPublicState` projection reports `prizeCount:6` for both players, while the turn-25 actor observation reports two remaining Prizes for the opponent. Do not use the global snapshot's `prizeCount` as remaining Prizes until its semantics are reconciled; the actor observation is the relevant pre-attack count in this trace.

## Policy-admission result: fail

The sanitized artifact reports:

- `actorOnlyExecutionBoundary.valid=false`;
- `policyCompetenceIndependentlyReviewed=false`;
- candidate profile includes a native SimpleTacticsAi fallback;
- opponent profile includes a Twinleaf SimpleTacticsAi fallback;
- challenge-suite scope is mechanical source/runtime contract tests only, not policy-competence evidence;
- identity scope is one seeded fixture trial, not a reusable field-wide policy identity.

Therefore, **the Critic's first-game acceptance gate is not satisfied**, even though the native game terminated and the Quick Ball chain passed. No 24-proxy diagnostic cohort should start until the actor-only boundary is valid, unsupported prompt fallbacks are demonstrated to be zero, peer-role dispatch reconciles, and the opponent policy is independently assessed.

### Sanitizer diagnosis

The artifact does not expose the reason for the invalid boundary. This is a sanitizer projection defect, not evidence that the underlying boundary passed:

- `inspectActorOnlyExecutionBoundary` returns `{schema, valid, failures, candidate, opponent}`; the two role summaries contain the relevant scalar counters and failure codes.
- `sanitizeBoundary` currently keeps `valid`, tries to read a top-level `hiddenInformationSafe` property that the source boundary does not define, and looks for counters at the top level. It discards `failures`, `candidate`, and `opponent`.
- Consequently, the emitted `hiddenInformationSafe:false` is not a valid measurement; it is a default created by the sanitizer. The actual `valid:false` is meaningful. The separate privacy boundary below is the artifact's privacy declaration.

A narrow correction should preserve only allowlisted safe scalar role summaries (role/seat/version/schema, boolean fallback flags, numeric counters, peer-role flags/counts) and the bounded failure-code strings. It should not emit policy application receipts, hidden card identities, prompt options, or raw state. Add a regression with nested candidate/opponent summaries and private sentinel fields. Do not rerun the fixture unchanged; use the failure details from the corrected projection to identify and repair the actual policy-boundary cause before any next dispatch.

## Privacy boundary

The artifact declares all of the following false:

- full-state capture;
- actor hand identities emitted;
- owner Prize identities emitted;
- prompt option identities emitted;
- opponent concealed zones emitted;
- setup Pokémon identities emitted;
- policy application receipt emitted.

The archive contains only the sanitized JSON and text files. No plaintext hidden-zone workaround was used. The phase-aware setup redaction path on PR #51 passed its V3 contract tests before this fixture was dispatched.

## Decision and next actions

1. Preserve the candidate 60 and the frozen rank-1 source 60; do not change either based on this one game.
2. Fix the sanitizer's boundary projection so it retains safe nested failure reasons and role counters, and remove or correctly derive the unsupported `hiddenInformationSafe` field.
3. Use the resulting evidence to identify the specific cause of `actorOnlyExecutionBoundary.valid=false`; require zero unsupported prompt fallbacks, no native hidden-information policy fallback, and exact peer-role reconciliation.
4. Only after the boundary is valid and the rank-1 opponent policy is independently assessed should the frozen policy move to the failure-inclusive 24-proxy diagnostic cohort.
5. Keep the opponent-format decision, physical-source admission, missing ranks 23/25/28, and the 99.5% field target separate. This run changes none of their statuses.

**Confidence:** high in the run metadata, artifact hashes, Quick Ball receipt counts, decision counts, and the invalid-boundary flag; high in the sanitizer shape mismatch; low in any inference about reusable policy strength or the deck's rank-1 matchup.
