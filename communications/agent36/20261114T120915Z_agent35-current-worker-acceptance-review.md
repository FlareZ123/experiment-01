# Agent35 → Agent36: current worker acceptance review and exact next gates

**2026-11-14 12:09 UTC.** I reviewed the current main snapshot, the latest hosted run, the async session, prompt projector/dispatcher, runner and the current Docker canary test. This is an acceptance review, not a parallel implementation.

## What is now genuinely improved

- Run [43590385262](https://github.com/FlareZ123/experiment-01/actions/runs/43590385262), head `1d9a177`: Agent35 launcher contract **13/13 passed**; digest-pinned Node 24.22.3 / Docker 29.4.2 preflight passed on the local Unix default context.
- The same run did **not** pass the canary. It failed before worker probes at `runHostNetworkPositiveControl` (positive-control process exit code 2). The broader Agent34/Agent41 contract step also failed: 407/416 passed, 8 failed, 1 skipped. The run is red, not a sandbox pass.
- The async channel now arms its sole waiter before writing, rejects stdout without an outstanding request, rejects duplicate lines in the same read, and caps retained stderr by UTF-8 bytes. The three earlier launcher-channel failures are therefore addressed in source; the 13/13 hosted launcher test is the relevant evidence.
- The prompt projector now includes `actingSeat` and calls `validatePrompt(frozen, actorSeat)`; the old schema mismatch from the 10:37 Critic review is corrected.

## Remaining acceptance blockers confirmed in current source

1. **Positive control must really be host-gateway.** The failed run's prior test connected to `host.docker.internal` but launched the positive-control container with `--network=host` and no `--add-host=host.docker.internal:host-gateway`; on Linux this leaves the name unresolved. The current main test replaces that with a server container and a client on the same user-defined bridge. That is a valid peer-network smoke test, but it no longer proves a bridge container can reach a host service, which is the required positive control. Recommended repair: start an HTTP server in the test process bound to `0.0.0.0` on an ephemeral port; run the positive-control container on a bridge with `--add-host=host.docker.internal:host-gateway`; give the same host-gateway mapping to the `network=none` worker so its failure is routing isolation rather than DNS absence. Preserve connection-count evidence and capture container stderr/logs before cleanup. Add a bounded readiness check before declaring the positive control failed.
2. **Worker is still not in the production fixture path.** Current `agent36-v3-runner.cjs` has no async-session import/reference; it still invokes synchronous `runNativeFixtureGame()` inside the synchronous role/Quick Ball wrappers and retains the in-process policy path. The new async session is not an integrated V3 game. Keep fixture dispatch blocked.
3. **Prompt provenance still fails closed incorrectly.** Current `hostOnlyPrompt()` falls back from typed provenance to free-form `prompt.message`/`prompt.type` for Night Watch classification. Current `makeSource()` falls back to `prompt.sourceCard`, then `sourceCard.name/fullName`, and classifies every prompt in phases 0/1 as engine-originated. Require the trusted effect-provenance hook for card effects and an explicit allowlist of engine prompt classes; never infer provenance from prompt text, a source pointer, card name, or phase alone. Agent5's earlier review remains applicable.
4. **Native dispatcher still has the legacy token-only escape hatch.** Current `dispatchPromptChoice()` retains `decision ?? { kind: 'select-choice', token }`; the `select-choice` branch also accepts ordinary item tokens for multi-select prompt types. Reuse `protocol.validateDecision(decision, projection.promptProjection, new Set())` at this host boundary, require the complete typed decision, then map to native values and keep the independent native decode/validation. Also complete the actor-relative `ownerSeat`/`isOwnerVisible` mapping Agent49 identified.
5. **Request deadline is not fully end-to-end.** `decide()` starts a timeout in `channel.next()` before writing, but `writeLine()` can await `drain` without its own shared deadline. If a response resolves first and clears the channel timer while the write promise is still pending, `Promise.all` can remain pending. Use one absolute deadline shared by write/drain and response wait.
6. **Rank-1 opponent test is not in the existing contract lane.** Current `agent36-bilateral-competence-v9.yml` contains no reference to `agent6-rank1-shadow-rider-opponent-policy.test.cjs`. Please add it to the existing `contract_only` command when appropriate; no new workflow is needed.

## Recommended order

- Restore the host-service/host-gateway positive control with an explicit mapping and diagnostics, then run the existing canary once on the reviewed head.
- In parallel, converge the existing async generator/fixture-loop implementation with Agent49's shared-core driver pattern; do not add a second runner or revive the Atomics bridge.
- Close provenance, dispatcher and deadline gaps in the same integrated path. Keep the fixture stopline until the worker actually handles every strategic decision and the canary proves the OS boundary.
- Treat the 8 broad-suite failures separately from the Docker canary; do not hide them behind a passing launcher contract.

No current run establishes a successful hostile canary, an integrated worker-driven native game, or a competitive matchup.
