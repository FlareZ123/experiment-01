# Agent32 -> Agent49/36: a four-dependency V3 source-label integration, not a runner rewrite

**2026-11-28 ~03:26 UTC**, normal research Agent32. Branch [agent32/real-pinned-actor-pr86-handoff-20261128](https://github.com/FlareZ123/experiment-01/tree/agent32/real-pinned-actor-pr86-handoff-20261128), based on pending PR #86. **No owner authorization for CI, game, or merge.**

## Newly solved integration mismatch

The first `createCertifiedSourcePrintedHostBridge` implementation successfully source-labeled `native.observe` *before* the fixture driver wrote its `actorObservationSha256`. But V3 `createV3WorkerDecisionResolver` subsequently calls `eventReceipt(state,seat)`, `actionFrontier.buildNativeActionFrontier(...)` and `promptProjection.projectPrompt(...)` separately. All three return raw native card IDs. **Naively validating the raw native owner receipt against an already-source-labeled frozen observation fails with `EVENT_OWNER_ACTIVE_MISMATCH` / `EVENT_OWNER_BENCH_MISMATCH`.** That was a real blocker in my previous adapter; I corrected it and wrote an exact two-seat failing-before/passing-after test.

The corrected `projectAdmittedWorkerParts` has an **explicit, factory-private** `observationAlreadySourcePrinted` flag: strict raw caller retains raw receipt/observation validation; the certified observer factory first verifies its frozen observation is unchanged by idempotent relabeling (comparing canonical JSON bytes, the driver's actual digest representation), **then canonicalizes the raw receipt before strict receipt/observation admission**. Both pathways subsequently validate projected observation, prompt, receipt, and frontier, preserve all action tokens. Without this explicit flag, even a well-typed source/candidate actor would fail before any worker.

## One opt-in composition at V3's existing dependency boundary

New exported `createCertifiedV3RoleAdapters` in [source-printing-bridge.cjs](https://github.com/FlareZ123/experiment-01/blob/agent32/real-pinned-actor-pr86-handoff-20261128/simulation/evaluation/2026-11/agent32-source-printing-bridge.cjs) accepts existing dependencies:
`{native,protocol,candidateSeat,opponentSeat,candidateSourceDeck,opponentSourceDeck,candidateNativeOrdered60,opponentNativeOrdered60,actionFrontier,promptProjection,eventReceipt}`.

It returns the **four V3 dependency names unchanged**: `native`, `actionFrontier`, `promptProjection`, `eventReceipt`.

- `native.observe` returns detached frozen source-printed actor observation **before driver's SHA**, without mutating upstream State.
- `actionFrontier.buildNativeActionFrontier` returns identical native `actionByToken` and diagnostics, but strict-source-prints actor/target labels in `actionFrontier.items`; `dispatchSelectedNativeAction` is delegated unchanged.
- `promptProjection.projectPrompt` retains `choiceByToken` native raw results; source-prints typed source/choices and leaves host-only prompts untouched; native `dispatchPromptChoice` and `resolveHostOnlyPrompt` are delegated unchanged.
- `eventReceipt` source-prints native Store public receipt, including owner Active/Bench and opponent's last-turn attack source, **using the same physical-seat-certified 60s**.

Exact installation seam in `simulation/evaluation/2026-11/agent36-v3-runner.cjs`, around `loadNativeRoleDependencies({enginePin})` (then `candidateResolved.fullNames` / `opponentResolved.fullNames`) and later both `runNativeFixtureGameAsync({native,...})` and `createV3WorkerDecisionResolver({native,...})`: construct once with **both exact source-60 deck objects and resolved ordered native 60s**; feed `adapters.native` to the fixture driver and resolver, and `adapters.actionFrontier`, `adapters.promptProjection`, `adapters.eventReceipt` into the corresponding resolver override arguments. **Do not alter** driver trace/hashing, native Action tokens or dispatch, physical RNG, logged seed registration, upstream Twinleaf, or worker schema. The adapter itself performs protocol admissions.

Source-bridge suite: **17/17 local Node pure tests passing** on a functionally matched local mirror, including both-seat mixed raw native receipt vs source frozen observer, V3 all-four-producer interface, failed-direct/passed-certified case, token preservation and host-only bypass. Branch `tests/2026-11/agent32-source-printing-bridge.test.cjs` has the same tests in the published codebase; the last 17th test is syntax checked, not executed *in repo* (no local clone). Full compiled native root→Penny prompt→Store test remains unexecuted.

**Owner go/no-go:** Review + selectively integrate this narrow adapter alongside PR86 and Agent17 rank3 physical-slot policy correction. A single **approved no-game compiled pinned native witness** is the decisive next gate; this branch is not authority for a live game or native CI dispatch. **0 qualified Aichi games; 99.5% remains unproven.**

— Agent32
