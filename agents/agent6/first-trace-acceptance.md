# Agent6 first registered natural-terminal trace: execution checklist

This is a diagnostic trace, **not** a competitive result. Do not report a matchup win rate or use it to claim the 99.5% objective.

## 1. Stopline and sequence

- [ ] Agent49 completes the canonical PR #58 sequence on one exact head: contract-only; only if green, same-SHA native no-game; all four role × physical-seat witnesses pass. Stop at the first concrete failure. Agent6 does not dispatch or edit Agent49's branch.
- [ ] Review and integrate the accepted V3 changes onto current main without dropping current mainline guards.
- [ ] Run fresh exact-SHA acceptance on the integrated V3 main revision.
- [x] Run the existing Agent45 focused recorder test **before integrating that recorder into the V3 runner**: `.github/workflows/agent45-electrode-bomb-contract-native.yml`, `tests/2026-11/agent45/full-state-trace.test.cjs`. Passed on Node `24.22.3` at research SHA `2def5feea3a48d20fd522e4dbfea7c6169cfa610` in run [44615886469](https://github.com/FlareZ123/experiment-01/actions/runs/44615886469): pinned Twinleaf checkout/install/compile, 13/13 focused tests, and native CES48 prompt-validator characterization. This validates the existing recorder independently; it is not a V3 fixture/game.
- [ ] Only after the focused recorder test passes, add the required host/trace-only capture: exact actor-scoped frontier, selected token/item, cloned-Store validation receipt and digests on each live decision record; add versioned actor-only `policyAudit` to the worker response; connect the tested Agent45 recorder to the same V3 live Store. Do not infer these from full-state snapshots or selected tokens.
- [ ] Run fresh exact-SHA acceptance again after any runner/worker/workflow change.
- [ ] Only then dispatch the registered fixture. No fixture/game before every preceding gate passes.

- **Do not preemptively change the frozen Agent6 rank-1 policy or Copycat route before the first trace attempt.** The current `copycatTargetAvailable()` heuristic checks only the opponent's current Active attack list, not a tracker-authenticated prior-turn non-GX attack receipt. It can search/play Mimikyu and score Copycat without that receipt; the host Copycat prompt projection is unsupported and throws. If the first registered run reaches Copycat, preserve the exact prompt, frontier, receipt and failure evidence, stop for review, and report no natural-terminal game. After that first attempt, either implement the complete tracker → receipt → worker protocol → copied-source prompt projection → native dispatch chain, or disable the route with explicit tests; any change requires fresh exact-SHA acceptance.

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

## 3. Required owner-controlled privacy gates

- [ ] `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION=public-reproducible`.
- Public reproducibility is explicitly authorized by the owner in issue #59. Do not obfuscate physical seeds, introduce an owner-held secret-seed mode, or reopen sandbox/IPC work as a prerequisite: the owner treats both bots as trusted research-owned code, not adversaries. Still enforce the actual decision-input contract: each worker receives only its own actor-visible observation and public receipts, never native game state, opponent hidden zones, or physical RNG/seed as explicit inputs.
- [ ] Valid RSA public recipient key configured as repository variable `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` (at least 2048 bits); keep the private key offline.
- [ ] Preserve main's fail-closed key-validation step during PR integration. PR #58's branch-level sanitized-only fallback is not sufficient for this trace.
- [ ] Confirm the actual diagnostic mode is `encrypted-full`; sanitized-only is not an acceptable substitute.
- [ ] Confirm encrypted private artifacts are uploaded and plaintext `fixture-game.json` / `.txt` are excluded. Never upload hidden-state plaintext. Keep frontier and policy audit details encrypted-only; public/sanitized artifacts must not disclose them.
- [ ] Confirm physical seed and policy RNG seeds are not disclosed to either worker.

## 4. Per-decision trace acceptance

For each live decision, the private trace must bind the acting role/seat and actor observation to:

- exact actor-scoped native action-frontier items and frontier digest;
- selected token and exact selected item;
- cloned-Store validation receipt and validation mode;
- versioned actor-only `policyAudit`, with finite scores, no duplicate tokens, every token in the exact frontier, and selected-token agreement;
- action ordinal, action payload digest, dispatch status and resulting state transition.

### Setup-prompt decision receipts (both physical seats)

From the role-composer result, retain `candidateAudit.setupPromptDecisions` and `opponentAudit.setupPromptDecisions` as separate, role-labeled records for both physical seats, not only the summarized actor-only boundary counters. Capture them before reducing the role result to the `actorOnlyBoundary` summary. In the encrypted-full artifact, preserve the starting-Basic receipt's `promptId`, `turn`, `seat`, `selectedHandIndices`, `selectedPrintings`, `nativeDispatch`, and `nativeDispatchReturnType`; preserve the GO_FIRST receipt's `promptId`, `turn`, `seat`, `result`, `nativeDefaultEquivalent`, `nativeDispatch`, and `nativeDispatchReturnType`. Bind each record to its candidate/opponent role, physical seat, and corresponding live-Store action/ordinal so the trace establishes which starting Basic Pokémon was selected, whether `Store.dispatch` returned or threw, and what native state/log transition followed. Capture the final receipt after the corresponding Store dispatch settles; no accepted setup record may remain `nativeDispatch: 'pending'`. Cross-check the submitted/rejected counts against `dispatch-returned` / `dispatch-threw` receipts. If dispatch throws, retain the private `nativeError` receipt field. Preserve the GO_FIRST decision and its dispatch receipt whenever that prompt is presented.

Also retain the total and per-seat `setupStartingBasicPromptsHandled` / `setupStartingBasicPromptsBySeat` and `setupGoFirstPromptsHandled` / `setupGoFirstPromptsBySeat` counts, `setupPromptActionsSubmitted` / `setupPromptActionsRejected`, `unsupportedPromptFallbacks`, and `nonOwnerNativeDelegations`. A setup receipt with a rejected native dispatch, any unsupported fallback, or any non-owner delegation blocks actor-only trace acceptance. The count summary is useful for cross-checking but cannot substitute for the selected-card / prompt / dispatch records. Keep starting-hand identities and prompt details encrypted-only; sanitized/public outputs may expose only approved aggregate status and must not disclose hidden cards or prompt payloads.

The trace must be complete and move-by-move, within the configured action bound, and end naturally. Reject the trace if any public-board or human-summary projection error occurred, any capture/encryption error occurred, action/trace counts disagree, the trace is truncated, or termination is non-natural. A complete flag alone does not override projection/capture errors.

## 5. Reporting boundary

- Report both physical-seat runs and their actual terminal outcomes; preserve the raw encrypted evidence for authorized review.
- If the Copycat projection blocker is reached, report it as a blocked diagnostic, not a completed fixture or matchup. Do not conceal the occurrence or silently disable the policy.
- The trace is one rank-1 diagnostic. It is not a competitively paper-qualified game, does not establish paper Expanded legality, does not establish a matchup rate, and does not move the 99.5% target toward demonstrated attainment by itself.
- Historical context: earlier sanitized-only fixture run [43544006054](https://github.com/FlareZ123/experiment-01/actions/runs/43544006054) on PR #51 reached engine terminal after 122 accepted actions / 25 turns and rank 1 won, but `actorOnlyExecutionBoundary.valid=false`; it is diagnostic-only and not the registered two-seat encrypted-full trace. Do not repeat that identical fixture or treat its terminal as competitive evidence.
- Do not alter `results/README.md` to imply a competitive result. Update it only after a trace actually completes and its diagnostic status is clear.
