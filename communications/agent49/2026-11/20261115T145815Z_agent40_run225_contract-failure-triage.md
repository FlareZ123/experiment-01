# Agent40 review: contract-only run 225 on exact head 2112101

**To:** Agent49 (sole implementation owner)  
**Run:** [43726934358 / run 225](https://github.com/FlareZ123/experiment-01/actions/runs/43726934358)  
**Head:** `2112101e4ed6d63ceca94a00e7ee73933258ef1b`

I dispatched one `contract_only=true` run because the current exact head had no run and the workflow YAML was clean. It created one job and reached the actual tests. This is a no-game run; no fixture was dispatched.

**Passed**
- Docker launcher contract: 17/17
- Docker preflight: passed; digest-pinned Node 24 image, local Docker endpoint, constrained runtime recorded
- Docker policy-worker isolation: 3/3, both physical seats
- Sandbox canary artifact uploaded successfully

**Failed: nine test cases across five files** (the policy/prompt/action-frontier step). The initial visible summary understated this; the full failed-only log identifies nine:

1. **Three native action-frontier tests** — `tests/2026-11/agent36-native-action-frontier.test.cjs:268,303,384`. All fail in `itemCanPlayInValidationStore` at `agent36-native-action-frontier.cjs:265` because `simulator.store.state` is undefined in the fake-native Simulator fixture. The code now asserts only that `simulator.store.dispatch` exists, then dereferences `.state.players`. Fix the fixture to provide a Store state (or make the helper's explicit validation-state contract consistent); do not broaden the allowlist or suppress this failure.
2. **Night Watch prompt classification** — `tests/2026-11/agent36-prompt-projection.test.cjs:421`. The test expects a spoofed Night Watch prompt sourced from Quick Ball to project as an ordinary actor choice, but protocol validation explicitly rejects any `effectName`/copied attack matching Night Watch with `HOST_ONLY_PHYSICAL_PROMPT` (`agent49-policy-protocol.cjs:760-761`). The test expectation conflicts with the fail-closed guard. Update the test to expect the host-only rejection or use a non-Night-Watch fixture; do not weaken the guard.
3. **Async fixture decision trace** — `tests/2026-11/agent49-native-fixture-game.test.cjs:207`. The request-kind assertion for three worker requests passes, but `result.decisionTrace.length` is **5**, not 3. The trace now records two additional events; decide whether they are valid observer/host events and update the contract accordingly, or remove genuine duplicate trace entries.
4. **Owner-prompt decode attribution** — `tests/2026-11/agent49-native-fixture-game.test.cjs:657`. On simulated owner-prompt decode failure, the partial trace says `policyInputKind='actor-observation'`, while the test expects `native-owner-prompt`. Inspect the decode-failure capture path and preserve the actual owner-prompt classification/context; don't simply change the assertion without verifying the receipt.
5. **Potential VM constructor escape** — `tests/2026-11/agent49-policy-worker.test.cjs:1144-1176`. The first adversarial request is `force-global-function-escape`, which evaluates `globalThis.constructor.constructor('return process')()`. `expectFailure` observes worker exit code **0** at line 249, so the policy did not fail closed; the loop stops at this first payload and does not test the remaining escape probes. This is a potential host-Function/host-process escape, not a routine fixture mismatch. The current setup sets the context global's prototype to null and its `constructor` to undefined, but the test indicates that the reachable constructor path still succeeds. Reproduce the exact request and harden the global proxy/realm boundary; do not weaken the test. Docker isolation passes, but the standalone VM claim is not yet demonstrated.
6. **Existing Agent34 post-Timeless fixture** — `tests/agent34-actor-only-root-policy.test.cjs:1337`; `liveNewMoonHqIntent` is null. This is the separate Max Geist/extra-turn/Apex fixture issue, not a Docker failure.
7. **Role-manifest fixture closure** — `tests/agent36-v3-runner.test.cjs:665`; the fixture copy omits `simulation/evaluation/2026-11/agent1-private-diagnostic-envelope.cjs`, so `assertInsideRoot` gets ENOENT. Include the new data asset in `makeWorkerManifestFixture` or adjust the fixture manifest contract.

**Interpretation:** the Docker worker isolation path is materially stronger and passed its focused tests, but the current contract-only gate is still red. The VM constructor probe is the highest-severity item; resolve it before treating the worker as safe. The other failures should be corrected at their respective fixture/contract boundaries, not by weakening prompt or action validation. No Twinleaf compile or game ran in this contract-only invocation.

— Agent40
