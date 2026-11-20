# Agent6 first registered natural-terminal trace: execution checklist

This is a diagnostic trace, **not** a competitive result. Do not report a matchup win rate or use it to claim the 99.5% objective.

## 1. Stopline and sequence

- [ ] Agent49 completes the canonical PR #58 sequence on one exact head: contract-only; only if green, same-SHA native no-game; all four role × physical-seat witnesses pass. Stop at the first concrete failure. Agent6 does not dispatch or edit Agent49's branch.
- [ ] Agent49 integrates only the accepted, reviewed V3 scope onto current main without dropping current mainline guards. Agent6 does not own integration.
- [ ] On the integrated-mainline SHA, run a fresh exact-SHA contract-only check; only if it passes, run the compiled/no-fixture native no-game witness on that same SHA and require all four role × physical-seat witnesses. Stop at the first concrete failure. The PR-branch receipt does not transfer to the integrated main commit.
- [x] Run the existing Agent45 focused recorder test **before integrating that recorder into the V3 runner**: `.github/workflows/agent45-electrode-bomb-contract-native.yml`, `tests/2026-11/agent45/full-state-trace.test.cjs`. Passed on Node `24.22.3` at research SHA `2def5feea3a48d20fd522e4dbfea7c6169cfa610` in run [44615886469](https://github.com/FlareZ123/experiment-01/actions/runs/44615886469): pinned Twinleaf checkout/install/compile, 13/13 focused tests, and native CES48 prompt-validator characterization. This validates the existing recorder independently; it is not a V3 fixture/game.
- [ ] Before the first registered diagnostic, require the host/worker decision audit in the accepted integration: exact actor-scoped frontier, selected token/item, cloned-Store validation receipt and digests on each live decision record; versioned actor-only `policyAudit`; fail-closed validation and cleanup. Do not infer these from full-state snapshots or selected tokens.
- [ ] Treat Agent45's same-live-Store full-state recorder and detailed setup-prompt audit as optional `encrypted-full` diagnostics, not universal prerequisites for the first registered game. If `encrypted-full` is selected, require the focused recorder test and full recorder completeness checks.

**Current source-review and acceptance status (2026-11-20 19:58 UTC). Do not repeat the historical 04:15–04:18 gap list below; it is superseded by later exact-head review.**

- The ordinary setup-path reviews and optional cloned-Store public receipt boundary remain as recorded above. These are source reviews, not acceptance receipts.
- PR #58 was open/draft at exact head `3c196861bc3155b5aec0fa4127295ca435543db8` when last checked at 19:58Z. The canonical Agent36 workflow had no run on that SHA; the latest PR-branch run, `44735823397`, failed on older SHA `eb317926c1f079a18471b32e22efa883fbd6cd07`. At the Critic's 19:39Z check, the PR branch was 28 commits ahead / 636 behind main. Main has since advanced through Agent6-owned documentation/communication commits only; do not pin a historical main SHA here. Fetch the latest remote main immediately before any integration.
- **Current acceptance blocker:** the no-game witness generator writes global `workerDecisionCount` from role-local `roleAudit.decisionCount`, while `totalWorkerDecisions` aggregates both roles' root and prompt decisions. The validator does not reconcile global/per-role/projected totals and does not require the inactive role's prompt/total counts to be zero. Agent42's exact finding is in `communications/broadcast/2026-11/20261120T1932Z_agent42-no-game-worker-count-acceptance-gap.md`; Critic's 19:39Z direction assigns the narrow correction and exact-SHA gates to Agent49 alone.
- Agent42's 19:11Z comparison confirms that all eight Agent2/Agent6 sanitizer source/test changes are already represented in PR #58 head `3c196861`. **Do not cherry-pick them again.** The remaining worker-count correction belongs in the existing PR path; no new schema, runner, workflow, or acceptance path.
- These are reviews and source comparisons only. No contract-only or native no-game acceptance receipt exists on exact PR head `3c196861`; no registered fixture/game has run on the integrated current mainline. Agent6 does not edit the canonical branch or dispatch the gates.

**Sanitizer and diagnostic-mode integration correction:**

- The Agent2 sanitizer commits and Agent6 public failure-receipt commits listed in the earlier memory are no longer mainline-only for the canonical PR path: equivalent source and tests are already present in PR #58 head `3c196861`. Preserve that work; do not re-cherry-pick.
- The PR-branch runner/test now permits the registered diagnostic to use `sanitized-only` when no valid owner-controlled public key is configured. Main's runner/test still needs the accepted scoped correction ported and revalidated on the integrated-main SHA. The owner authorized public reproducibility in issue #59; an encryption key is not a universal prerequisite.
- Agent49 alone owns the scoped integration and exact-SHA contract-only → same-SHA four-cell native no-game sequence on the PR path, followed by porting only accepted changes to current main and rerunning both gates there. Agent6 owns only the already-registered first trace after integrated-mainline acceptance.

**Accepted sequence and first trace:**

- Freeze one exact canonical PR SHA; Agent49 runs contract-only, then only if green the same-SHA native no-game witness for all four role × physical-seat cells. Agent49 integrates only the accepted scope onto current main, then repeats contract-only and the same-SHA no-game witness on the exact integrated-mainline SHA. Stop at the first concrete failure. Agent6 does not dispatch until those integrated-mainline gates pass.
- Only after integrated-mainline acceptance, dispatch the existing registered fixture with `agent36_v3_fixture_game=true` and `agent36_v3_predeal_artifact_ref=results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json`. Do not select `agent36_v3_native_no_game_witness` in the same run. Use `sanitized-only` when no valid owner key is configured; full-state recorder/setup receipts remain optional `encrypted-full` diagnostics.
- Do not alter the frozen candidate, rank-1 opponent list, policy versions, registered public seed, physical-seat assignments, or Twinleaf pin. The first trace is diagnostic only.

**Frozen Copycat caveat:** do not preemptively change the registered rank-1 policy or Copycat route before the first trace attempt. The current `copycatTargetAvailable()` heuristic checks only the opponent's current Active attack list, not a tracker-authenticated prior-turn non-GX attack receipt. It can search/play Mimikyu and score Copycat without that receipt; the host Copycat prompt projection is unsupported and throws. If the first registered run reaches Copycat, preserve the exact prompt/frontier/receipt/failure evidence, stop for review, and report no natural-terminal game. Any later fix or route disablement requires fresh exact-SHA acceptance.

## 2. Frozen registration and fixture inputs

- Registration: `results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json`
- Workflow input: `agent36_v3_predeal_artifact_ref=results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json`
- Registration/trial ID: `agent6-v3-rank1-baseline-20261117-a`
- Registered seed string (pass unchanged): `1c42e5b9443bf43e91b275fdb4a4d67809bef64f0bcbabaca128b8afd47a36fe`
- Native mapping: SHA-256 over UTF-8 seed string, first UInt32LE; expected `seed32=4084747862=0xF3784E56`.
- Candidate printed-60 SHA-256: `1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924`.
- Original rank-1 printed-60 SHA-256: `159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090`.
- Candidate policy: `agent46-hood-candidate-v1`; opponent policy: `agent6-rank1-shadow-rider-opponent-v1`.
- Twinleaf submodule: `vendor/twinleaf`, remote `https://github.com/twinleafgg/twinleafgg.git`, pinned gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Preserve the registration's exact decks, policies, seed, two physical-seat assignments, and engine pin. The fixture is explicitly unqualified and format review remains unverified.

## 3. Privacy gates and diagnostic mode

- [ ] Set `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION=public-reproducible`.
- Public reproducibility is explicitly authorized by the owner in issue #59. Do not obfuscate physical seeds, introduce an owner-held secret-seed mode, or reopen sandbox/IPC work as a prerequisite: the owner treats both bots as trusted research-owned code, not adversaries. Still enforce the actual decision-input contract: each worker receives only its own actor-visible observation and public receipts, never native game state, opponent hidden zones, or physical RNG/seed as explicit inputs.
- **First-game default:** use `sanitized-only` when no valid owner key is configured or when hidden-state snapshots are not needed. A public-key variable is not an owner-approval prerequisite for the first registered diagnostic. The PR-branch runner/test already permits this mode; Agent49 must carry the accepted correction onto current main and verify it on the exact integrated-main SHA before dispatch.
- [ ] In `sanitized-only`, verify the artifact preserves the engine terminal/winner, action and turn counts, sanitized actor/root decisions and their digests, final public state, actor-only boundary, worker execution/cleanup audit and hashes, exact deck/policy/engine/research identities, and the registered public seed/seed32. Verify `privacyBoundary.fullStateCaptured === false` and that hidden zones, hand/prize identities, setup Pokémon identities, prompt-option identities, raw frontiers, selected tokens/items and private prompt payloads are absent.
- [ ] Keep exact actor-observation/frontier binding, versioned actor-only `policyAudit`, cloned-Store validation, worker cleanup and natural-terminal checks enforced at runtime. Public sanitized outputs may commit only to explicitly sanitized decision/root/actor-observation/worker-audit projections; raw worker-decision traces, validation receipts, frontiers, selected items, policy audits, prompt projections, public-event receipts and action-payload hashes remain host-only or encrypted-full. A digest over a private preimage is not redaction.
- Use `encrypted-full` only when a concrete unresolved question requires hidden-zone or private prompt/selection evidence and a valid owner-controlled public key is already configured. In that case, keep the private key offline, upload only ciphertext plus approved public manifest, delete plaintext before upload, and retain full-state/selected-item/setup receipt details only in the encrypted artifact.
- [ ] Confirm physical seed and policy RNG seeds are not disclosed to either worker.

## 4. Per-decision trace acceptance

For each live decision, the host must validate and bind the acting role/seat and actor observation to the following. This runtime contract applies in both diagnostic modes. `sanitized-only` publishes only approved actor-observation projections, decision/root digests and aggregate status; it must not publish raw frontiers, selected private items, cloned-state payloads or private prompt details. `encrypted-full` may preserve the complete private trace when a concrete diagnostic requires it.



- exact actor-scoped native action-frontier items and frontier digest;
- selected token and exact selected item;
- cloned-Store validation receipt and validation mode;
- versioned actor-only `policyAudit`, with finite scores, no duplicate tokens, every token in the exact frontier, and selected-token agreement;
- action ordinal, action payload digest, dispatch status and resulting state transition.

### Setup-prompt decision receipts (both physical seats)

From the role-composer result, retain `candidateAudit.setupPromptDecisions` and `opponentAudit.setupPromptDecisions` as separate, role-labeled records for both physical seats, not only the summarized actor-only boundary counters. Capture them before reducing the role result to the `actorOnlyBoundary` summary. In the encrypted-full artifact, preserve the starting-Basic receipt's `promptId`, `turn`, `seat`, `selectedHandIndices`, `selectedPrintings`, `nativeDispatch`, and `nativeDispatchReturnType`; preserve the GO_FIRST receipt's `promptId`, `turn`, `seat`, `result`, `nativeDefaultEquivalent`, `nativeDispatch`, and `nativeDispatchReturnType`. Bind each record to its candidate/opponent role, physical seat, and corresponding live-Store action/ordinal so the trace establishes which starting Basic Pokémon was selected, whether `Store.dispatch` returned or threw, and what native state/log transition followed. Capture the final receipt after the corresponding Store dispatch settles; no accepted setup record may remain `nativeDispatch: 'pending'`. Within each role audit, require `setupPromptDecisions.length` to equal `setupStartingBasicPromptsHandled + setupGoFirstPromptsHandled`, each per-seat array to sum to its total, and `setupPromptActionsSubmitted + setupPromptActionsRejected` to equal the receipt count. Cross-check the submitted/rejected counts against `dispatch-returned` / `dispatch-threw` receipts. If dispatch throws, retain the private `nativeError` receipt field. Preserve the GO_FIRST decision and its dispatch receipt whenever that prompt is presented.

Also retain the total and per-seat `setupStartingBasicPromptsHandled` / `setupStartingBasicPromptsBySeat` and `setupGoFirstPromptsHandled` / `setupGoFirstPromptsBySeat` counts, `setupPromptActionsSubmitted` / `setupPromptActionsRejected`, `unsupportedPromptFallbacks`, `nonOwnerSeatBypassCalls`, and `nonOwnerNativeDelegations`. A setup receipt with a rejected native dispatch, any unsupported fallback, any non-owner seat bypass, or any non-owner native delegation blocks actor-only trace acceptance. The count summary is useful for cross-checking but cannot substitute for the selected-card / prompt / dispatch records when `encrypted-full` is selected. For that optional mode, require focused tests that both role arrays survive into the encrypted artifact, settled statuses/counts reconcile, and sanitized artifacts exclude `selectedHandIndices`, `selectedPrintings`, prompt IDs/payloads, and `nativeError`. In `sanitized-only`, these private setup receipts are intentionally unavailable; rely only on the safe actor-decision projection and approved aggregate boundary/worker counters. Keep starting-hand identities and prompt details encrypted-only; sanitized/public outputs must not disclose hidden cards or prompt payloads.

The trace must be complete and move-by-move, within the configured action bound, and end naturally. Reject it if any public-board or human-summary projection error occurred, required per-decision audit/digest capture failed, action/trace counts disagree, the trace is truncated, or termination is non-natural. When `encrypted-full` is selected, also reject any full-state recorder, projection or encryption error; these optional full-state checks do not apply to `sanitized-only`. A complete flag alone does not override projection/capture errors.

## 5. Reporting boundary

### Public failure-receipt privacy

The public no-game failure receipt is uploaded unencrypted, including on failed witness runs. Its failure projection must exclude raw-preimage `messageSha256` and `actionPayloadSha256` at every level: direct native failure, nested native failure, primary failure, cleanup failure, and the final receipt. Preserve only bounded safe metadata such as name, code, stage, message length, action ordinal, physical seat, phase/turn, prompt type, action name, and an approved repository stack site. Do not hash arbitrary error text or action payloads and call the result redacted. The failure worker-audit projection must preserve disclosure flags only as strict booleans (unknown becomes `null`) and preserve `workerInputScope` only when it exactly matches the closed V3 scope enum. The source/test changes from commits `84ba81c` and `e016e41` are already represented in PR #58 head `3c196861`; exact-head acceptance and integrated-mainline revalidation remain pending. The separate worker-count reconciliation defect is the current no-game witness blocker.

- Report both physical-seat runs and their actual terminal outcomes. Preserve the sanitized artifacts and hashes; if `encrypted-full` was selected, preserve the raw encrypted evidence for authorized review.
- If the Copycat projection blocker is reached, report it as a blocked diagnostic, not a completed fixture or matchup. Do not conceal the occurrence or silently disable the policy.
- The trace is one rank-1 diagnostic. It is not a competitively paper-qualified game, does not establish paper Expanded legality, does not establish a matchup rate, and does not move the 99.5% target toward demonstrated attainment by itself.
- Historical context: earlier sanitized-only fixture run [43544006054](https://github.com/FlareZ123/experiment-01/actions/runs/43544006054) on PR #51 reached engine terminal after 122 accepted actions / 25 turns and rank 1 won, but `actorOnlyExecutionBoundary.valid=false`; it is diagnostic-only and not the current registered two-seat diagnostic. Do not repeat that identical fixture or treat its terminal as competitive evidence.
- Do not alter `results/README.md` to imply a competitive result. Update it only after a trace actually completes and its diagnostic status is clear.
 
### Candidate-side delayed Pale Moon observation (not a pre-trace change)

The registered fixture is the unchanged Hood candidate with Agent46 in seat 0 against the original rank-1 list with Agent6 in seat 1. Agent12's 19:58Z context note and Agent42's readiness map identify a possible candidate-side response: a legal Skyliner retreat by the Active into Girafarig can move the affected Pokémon to the Bench and clear the delayed Pale Moon effect under manual A-03. This is **not** a demonstrated Agent46 policy miss: the existing source continuation does not establish Girafarig's Bench Energy/attack readiness or the opposing hand/damage counters.

- If the unchanged first trace naturally reaches the prior-Pale-Moon decision state, preserve the candidate's actual actor-visible observation, legal Retreat/Pass frontier, selected action and native effect receipt. Do not intervene, alter the seed, or inject a new action.
- If the trace does not reach that state, defer the targeted native Retreat/Pass frontier challenge until after the first trace. Do not add a pre-trace fixture or treat the pipeline trace as policy-competence evidence.

