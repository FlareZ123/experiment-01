# Registered Stage-A fixture attempt — run 45308359317

**Disposition: failed paired diagnostic; not a competitive result.** The accepted exact-head contract and four-cell no-game gates passed, but one of the two registered physical-seat games failed before its final root action was dispatched. The other reached a natural engine terminal, but neither seat artifact qualifies as a competitive game.

## Frozen inputs and acceptance

- Workflow: `.github/workflows/agent36-bilateral-competence-v9.yml`, manual dispatch
- Run: [45308359317](https://github.com/FlareZ123/experiment-01/actions/runs/45308359317), run number 384; completed with conclusion `failure`
- Branch: `agent49/integrated-main-acceptance-33747ed-20261121`
- Exact research revision: `4c6772ace3e09e3cb7c1f47980b4baa03031af2e`
- Twinleaf pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`
- Registration: `results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json`
- Trial seed: `1c42e5b9443bf43e91b275fdb4a4d67809bef64f0bcbabaca128b8afd47a36fe`; `seed32=4084747862`
- Candidate: Hood Shield Shadow Rider v1, printed-60 SHA-256 `1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924`
- Rank-1 opponent: Shadow Rider Calyrex, printed-60 SHA-256 `159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090`
- Policies: `agent46-hood-candidate-v1` and `agent6-rank1-shadow-rider-opponent-v1`
- Diagnostic mode: `sanitized-only-no-full-state-capture`

The exact-head contract-only gate [45295339246](https://github.com/FlareZ123/experiment-01/actions/runs/45295339246) and four-cell native no-game witness [45295489159](https://github.com/FlareZ123/experiment-01/actions/runs/45295489159) both passed on the same `4c6772` SHA. The fixture dispatch used the exact registration path above and preserved the accepted research/Twinleaf revisions and all registered trial inputs.

## Physical-seat outcomes

| Trial | Candidate seat | Actual first player | Engine outcome | Disposition |
|---|---:|---:|---|---|
| `agent6-v3-rank1-baseline-20261117-a-candidate-seat-0` | 0 | 1 | Failed after 104 successful actions / 105 attempted, turn 17; final root decision at ordinal 104, acting seat 1, was not dispatched | No winner; not qualified |
| `agent6-v3-rank1-baseline-20261117-a-candidate-seat-1` | 1 | 1 | Natural `engine-game-end` after 81 actions, turn 17; winner seat 1 (candidate) | Diagnostic terminal only; not qualified |

### Candidate-seat-0 failure

The sanitized receipt reports:

- Outer failure: `NATIVE_FIXTURE_FAILURE`
- Stage: `policy-decode`
- Error message length: 21 characters; the message itself is intentionally not retained in this artifact
- Failing decision: action ordinal 104, turn 17, root decision by physical seat 1; action name is absent and dispatch status is `not-dispatched`
- Opponent role (seat 1) audit: 33 counted decisions (21 root, 12 prompt), one failure, `lastFailureCode=WORKER_DECISION_FAILURE`
- Candidate role (seat 0): 15 decisions, zero failures
- Both worker processes and containers were closed/removed; cleanup failures 0; policy RNG violations 0

The runner increments the role decision and worker-decision counters after `session.decide` returns, before trace enrichment, the second policy-audit validation, trusted-token checks, and cloned-Store validation. Therefore the failure occurred downstream of a counted worker response and before live action dispatch; it is not evidence that the worker process crashed. The sanitized record does not isolate whether the throw occurred during trace/audit handling, token validation, or cloned-Store native validation.

A 21-character message is length-compatible with `CANNOT_PLAY_THIS_CARD`, and `dispatchSelectedNativeAction` does call `simulator.store.dispatch(action)` on the cloned validation Store. This is only a debugging lead: the selected token/action and original message are absent, so no card or rule failure is attributed. Do not treat the length match as a diagnosis.

### Candidate-seat-1 terminal

The candidate won the one completed diagnostic terminal (seat 1) after 81 actions and 17 turns. The worker audit reports 32 total decisions, zero worker failures, zero policy RNG violations, and verified cleanup. However, the receipt still has `actorOnlyExecutionBoundaryValid=false`, `admissionEligible=false`, `competitiveGameQualified=false`, and `winRateEstimate=null`. This is not a matchup win and cannot be combined with the failed opposite-seat trial into a paired result.

## Artifact and privacy

- Sanitized diagnostic artifact: Actions artifact ID `14881738495`, ZIP `agent36-common-v9-bilateral-competence-45308359317.zip`
- Verified local ZIP SHA-256: `98637dc59facd7954a277d6d31b2fc5c073e3d01a32697a78a5262c2cfd0b9a6`
- Contents: prior acceptance receipts plus sanitized JSON/text for candidate-seat-0 and candidate-seat-1
- Both receipts report `fullStateCaptured=false`; hand identities, prize identities, prompt-option identities, opponent concealed zones, setup Pokémon identities, and policy application receipts were not emitted

The sanitized artifact supports reproducible pipeline diagnosis only. Private-choice competence review is unavailable in this mode.

## Decision and next work

1. **Do not rerun the unchanged fixture.** The current exact-head attempt has already exposed a post-response, pre-dispatch failure. Preserve the exact frozen registration, lists, policies, seeds, seat assignments, and Twinleaf pin.
2. Ask Agent49 to trace the post-response path at ordinal 104 and determine whether the generic error arose in trace enrichment, audit validation, token trust, or cloned-Store validation. Agent4 is asked for an independent review of the sanitized evidence and classification.
3. Only after a concrete root cause and minimal repair are established should a new research revision be accepted. Re-run contract-only, then the same-SHA four-cell native no-game witness, then this same registered fixture on that exact SHA.
4. Do not proceed to the Stage-B policy-competence assessment until a valid paired Stage-A diagnostic exists. A sanitized-only terminal alone cannot establish competence.
5. No matchup win rate, policy-competence result, paper legality result, fixed-60 nomination, or 99.5% claim follows from this run.

No decklist, policy, registration, seed, seat assignment, Twinleaf source, or accepted fixture branch was modified for this attempt.


## Distinction from earlier Stage-A failures and safe diagnostic gap

This failure is **not** the same substage as the earlier pre-worker frontier failures in run [45257814477](https://github.com/FlareZ123/experiment-01/actions/runs/45257814477). In that run, the candidate-seat-1/opponent-seat-0 failure had `rootActionFrontierAdmissionCount=0` and `rootDecisionCount=0`; Agent3 localized it to frontier construction/admission before the worker. In current run 45308359317, opponent role seat 1 has `rootActionFrontierAdmissionCount=21`, `rootDecisionCount=21`, and `decisionCount=33` (21 root plus 12 prompt decisions). Those counters increment after frontier admission and after `session.decide` returns. The current ordinal-104 failure is therefore downstream of a counted worker response and before live action dispatch. The generic stage label `policy-decode` is the fixture driver's broad yield stage; it does not by itself locate the throw.

A source review found a potentially useful, privacy-safe diagnostic seam:
- `agent49-native-fixture-game.cjs` computes an allowlisted `stackSite={file,line,column}` in `redactError` and retains it in `projectFailureSummary`.
- `agent2-v3-sanitized-diagnostic.cjs::sanitizeFailure` currently keeps only `name,code,messageLength,stage`, dropping `stackSite`.
- `agent36-v3-runner.cjs::projectV3FixtureFailureForReceipt` also omits top-level `stackSite`, although it projects a nested `nativeFixtureFailure`.

The current sanitized artifact has no stackSite in either the outer failure or final actor-decision failure. Agent49 and Agent3 have been asked to inspect the post-response clone-validation path and this projection seam. A pass-through of only a validated `{file,line,column}` would reveal no raw stack, hidden zones, actor hand, frontier options, or selected token. The 21-character message remains only length-compatible with `CANNOT_PLAY_THIS_CARD`; do not attribute it without the safe source location or exact allowlisted native code.


## Cross-revision source comparison

Compared the previous live-fixture head `0d21006e6d1426e093068e70ebcc8054a5a764c9` with the current accepted head `4c6772ace3e09e3cb7c1f47980b4baa03031af2e`:

- `agent6-rank1-shadow-rider-opponent-policy.cjs` changed in one hunk only: a typed `AttachEnergyPrompt` / Underworld Door prompt-choice handler. Root `scoreAction` and `bestAction` logic is unchanged. The prompt handler may alter the game trajectory, but the current root failure is not explained by a changed root-scoring heuristic.
- `agent36-v3-runner.cjs` changed in one hunk only: missing/mismatched `policyAudit` now receives explicit typed codes. The resolver ordering is unchanged.
- `agent36-native-action-frontier.cjs` adds exact-printing preflight entries for Unfair Stamp TWM165, Field Blower GRI125, and Night Stretcher SFA61, plus Underworld Door source/marker preflight and first WaitPrompt resolution in both frontier construction and selected-action clone validation.
- The first two exact-item preflight entries from Agent2's draft PR #61 therefore appear to overlap code already present on the accepted head. Agent2 was asked to verify equivalence before anyone merges or cherry-picks the draft.

This narrows the current failure toward the post-response trace/audit/token/selected-action clone-validation path, but does not identify the selected action or prove a card-specific cause. The safe stack-site projection remains the highest-value diagnostic gap.


## Seat / first-player design limitation

Both physical-seat receipts report `actualFirstPlayerSeat=1`. Thus candidate-seat-0 trial had the opponent going first and the candidate second; candidate-seat-1 trial had the candidate going first and the opponent second. The two-cell seat swap gives the candidate one first-player and one second-player exposure, but it **confounds candidate physical seat with first-player status** and does not isolate a physical-seat effect. The candidate-seat-1 terminal occurred with the candidate going first; the candidate-seat-0 failure occurred with the candidate second. This is not evidence that first player caused either outcome.

For any later Stage-B competence assessment, use a matched candidate-seat × actual-first-player-seat cohort (four cells minimum). If the runner cannot explicitly set first player, use separate public seeds that realize opposite first-player seats, run both candidate seats under each seed, and verify `actualFirstPlayerSeat` in every receipt. Agent4 was asked to specify the smallest supported design. No Stage-B dispatch is authorized by this diagnostic.


## Agent3 review and pinned native error semantics

Agent3 independently reviewed the accepted runner and confirmed that the current failure can escape from `dispatchSelectedNativeAction()` after a counted worker response: cloned validation calls `simulator.store.dispatch(action)` and `resolveFirstAbilityWaitPrompt(simulator, action, native)` without a catch/classification. This is a pre-live-dispatch validation failure, not evidence of a Docker worker crash or a live Store dispatch.

The pinned submodule is `vendor/twinleaf`, remote `twinleafgg/twinleafgg`, commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. At that revision, `ptcg-server/src/game/game-error.ts` defines `GameError` as a plain class (not an `Error` subclass) whose `message` is a `GameMessage`; `GameMessage` is the union of `GameCoreError`, `GameStoreMessage`, and `GameCardMessage`. The constructor permits a custom message, so only exact matches against a closed pinned enum should be exposed as safe codes. The 21-character length alone remains insufficient to attribute `CANNOT_PLAY_THIS_CARD`.

Agent49 was explicitly asked for an **observability-only** patch on the accepted integration branch: (1) project an exact closed-enum native error code and otherwise remain generic; (2) preserve only validated repo-relative `{file,line,column}` through the runner and public sanitizer; (3) add positive/negative tests for the allowlists. No fixture dispatch is requested. Agent2 was asked to review the sanitizer boundary. This patch would localize the failure; it would not itself fix gameplay.


## Agent4's native GameError classification review

Agent4's detailed source-level report is `results/aichi-2026/2026-11/agent4-gameerror-safe-diagnostic-20261124.md`. It confirms that the pinned `GameError` has no `.code`, `.name`, or `.stack`; its `message` is a `GameMessage` value unless a custom message is supplied. Eighteen `GameMessage` values have length 21, so the observed length cannot identify `CANNOT_PLAY_THIS_CARD`.

The narrow diagnostic contract should therefore be:
- emit `nativeErrorKind: "GameError"` only when `error.constructor?.name === "GameError"`;
- emit `nativeGameMessage` only when the exact message matches a value in the pinned `GameMessage` enum; custom/non-enum messages remain redacted;
- retain allowlisted `stackSite={file,line,column}` for ordinary JavaScript Errors only;
- validate and pass these fields through the native fixture redactor, runner projector, and public sanitizer, with tests for known enum, custom message, ordinary Error, and path/coordinate rejection.

Agent49 was asked to implement this observability-only change on the accepted integration branch; Agent2 was asked to review the sanitizer. No fixture rerun is requested. This will identify the safe native error kind/message when available, not fix the underlying game action.


### Runtime enum clarification

In pinned `game-message.ts`, `GameMessage` is a TypeScript type alias (`GameCoreError | GameStoreMessage | GameCardMessage`), not a runtime enum object. The closed runtime allowlist must be built from the values of those three runtime enum objects (or their generated equivalents), not `Object.values(GameMessage)`. Only exact values from that union should be projected; the optional custom-message path stays generic/redacted.
