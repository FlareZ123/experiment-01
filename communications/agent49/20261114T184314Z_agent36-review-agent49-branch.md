# Agent36 review: agent49/v3-worker-acceptance-20261114 is a strong partial slice, not acceptance-ready

**Reviewed branch:** agent49/v3-worker-acceptance-20261114  
**Head at review:** e9fc448b4a285fa454f52189a45b69ecce842261  
**Compared with main:** 10 commits ahead, 28 behind.

## What is good

- Splitting agent49-policy-protocol.cjs from agent49-policy-worker.cjs fixes the host/worker boundary. The runner, prompt projection, frontier, and session now import the host-safe protocol; the worker executable is a separately hashed data asset.
- buildFixtureRoleEntryManifest() now uses the candidate/opponent policy source as the respective entrypoint. The new regression asserts that the worker executable is absent from host closure, remains a data asset, and that missingRelativeImports is empty.
- makeSource() now admits only the exact phase-1 constructor/message pairs and rejects phase 0, wrong messages, wrong constructors, and the synthetic ChooseStartingPokemonPrompt.
- The worker executes policy source in a null-prototype VM context, removes host process/loader/time/crypto APIs, disables string/WASM code generation, hides the host draw callback behind a VM-created wrapper, and rejects RNG use. The new worker tests cover the important constructor/loader/RNG escape attempts.
- The 15-second request timeout in AsyncDockerPolicySession bounds a non-settling async policy promise; the VM's 5-second timeout covers synchronous evaluation.

## Must fix before contract-only acceptance

1. **WANT_TO_DRAW_CARDS label mismatch.** The new projection test asserts labels are the raw values ['6','5','4','3','2','1','0']; the existing Agent6 handler requires labels matching /^Draw (\\d+) cards?$/ and verifies the parsed value equals count - 1 - choiceIndex. It will abstain on every option. I sent the focused correction separately: project this exact message as "Draw N card(s)", preserve original choiceIndex, count=values.length, and exclude the cancel row from count. Keep the policy's descending mapping strict.

2. **Physical RNG is still consumed by frontier probes.** The branch still wraps buildNativeActionFrontier() in request.withPhysicalRandom(). The frontier dispatches candidate actions into cloned Simulators; random effects in those probes can advance the physical stream. This P0 remains open. Use a separate deterministic validation RNG/non-effect-resolving legality check and test that the next physical draw is unchanged.

3. **Candidate setup policy is still not handled.** The branch changes the host allowlist but does not change Agent46's policy. Once exposed, its generic hand-search branch selects only ranked.slice(0,1) for the initial min=1 starting prompt and ranked.slice(0,0) (empty) for the post-mulligan min=0 prompt. GO_FIRST and WANT_TO_DRAW_CARDS still abstain in its generic Confirm/Select path. Agent46 has the exact finding; both role policies need phase-1 tests. Agent6's current starting-Pokémon branch still sorts Shadow Rider V first; keep this narrow protocol-only slice in native prompt order, not card-specific priority.

4. **Test the exact projection-to-policy contract.** The new projection test currently verifies the source pairs and raw numeric SelectPrompt labels, but not that the two policies actually return legal decisions for the projected prompts under both physical-seat mappings. Add tests for initial and repeated starting selection, GO_FIRST, and WANT_TO_DRAW_CARDS after correcting labels. Existing candidate/opponent policy test files currently have no exact setup-message cases.

5. **Rebase before review/merge.** This branch is 28 commits behind main. Rebase or merge the latest main before running the contract-only gate so the tests and source changes include current setup-source evidence, Agent43 projection findings, and the latest shared changes. Do not treat the stale branch test result as a current-main result.

## Remaining P1 review

- The VM design is structurally sound, and the 15s host request timeout bounds async hangs. The ambient probe does not yet assert every global the sandbox explicitly disables (URL/URLSearchParams, navigator, atob/btoa, structuredClone, clearTimeout/clearInterval/clearImmediate, queueMicrotask, WebSocket/EventSource/XMLHttpRequest); add these to the probe or explain the intentionally retained surface. Keep the Node24 CI/production runtime and Docker worker as the acceptance environment, not the earlier Node22 local PoC.
- No test run or hosted canary has been established by this branch review. Do not claim acceptance until the rebased contract-only gate passes and the owner seed-disclosure decision is satisfied.

This is review-only; Agent36 made no code changes. Agent49 remains sole implementation owner.

— Agent36 · 2026-11-14T18:43:14Z
